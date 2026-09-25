/** Iconic play film: Homare Sawa's extra-time equaliser, Japan 2–2 USA (Japan won 3–1 on penalties), FIFA Women's World Cup final,
 * Commerzbank-Arena (Waldstadion), Frankfurt, 17 July 2011.
 * A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration text: public/plays/narration/sawa-final-2011/script.json. The lead voices it later with local Kokoro. Until then every chapter
 * runs on provisional cue times (≈2.6 words/s, see prov()). EVERY action time is read from cue onsets and chapter seconds, so once
 * timing.json exists `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/sawa-final-2011/timing.json exists, replace the `null` in the VOICE constant below with
 *   import timingJson from '../../../public/plays/narration/sawa-final-2011/timing.json';   (and `timingJson as NarrationTiming`).
 *
 * SOURCES (read Sept 2026 as page text; the footage itself was not reviewed in this session):
 *  - Wikipedia, "2011 FIFA Women's World Cup final" (goals, minutes, line-ups and numbers, kits, referee, attendance 48,817, 20:45 CEST
 *    kick-off, partly cloudy 16 °C, shootout 3–1) https://en.wikipedia.org/wiki/2011_FIFA_Women%27s_World_Cup_final
 *  - Japanese Wikipedia, "2011 FIFA女子ワールドカップ・決勝" (citing Sports Graphic Number 784, pp. 11–12 and 28–29, and Sunday Mainichi):
 *    the corner was from Japan's LEFT; during the stoppage for Solo's treatment Miyama, Sakaguchi and Sawa met, Miyama said "I'll kick it to
 *    the near post", Sawa answered "I'll be first in"; Sawa darted out at the near side, stretched her RIGHT foot, and the ball she touched
 *    struck Wambach's body and flew into the net. https://ja.wikipedia.org/wiki/2011_FIFA女子ワールドカップ・決勝
 *  - The Guardian live blog, "USA v Japan – as it happened", 17 July 2011 (117 min: "Sawa runs towards the near post, meets the corner
 *    before any USA defender and pokes the ball over Solo"; the corner came after Rampone cleared Kinga's chance; "no one in blue")
 *    https://www.theguardian.com/football/2011/jul/17/usa-japan-live-world-cup-final
 *  - The New York Times, "A Resilient Team Soothes a Nation", 18 July 2011 ("Sawa ... redirected a corner kick that deflected off Wambach into
 *    the net") https://www.nytimes.com/2011/07/18/sports/soccer/japan-battles-back-to-win-womens-world-cup.html
 *  - FIFA.com match summary "Japan edge USA for maiden title", 17 July 2011 (web.archive.org copy: "Sawa equalised by diverting Miyama's
 *    corner with just three minutes remaining"; top scorer with five goals)
 *  - Wikipedia, "Homare Sawa" (captain; Golden Ball and Golden Boot, five goals; 1.65 m) https://en.wikipedia.org/wiki/Homare_Sawa
 * CONFIRMED by those accounts: 17 July 2011, Frankfurt, the World Cup final; the USA led 2–1 (Morgan 69', Wambach 104'; Miyama 81' for
 *  Japan); in the 117th minute, three minutes from the end of extra time, Japan won a corner on their LEFT; Aya Miyama (8) took it, aiming for
 *  the near post by plan; Sawa (10, captain) ran to the near post, got there before any US defender and redirected it with her RIGHT foot
 *  over Hope Solo (1); the ball deflected off Abby Wambach (20) into the net: 2–2; Japan won the shootout 3–1 (Kumagai scored the last kick);
 *  Sawa won the Golden Ball and the Golden Boot. Kits: Japan all blue, USA all white. An evening kick-off (20:45), so the equaliser came
 *  under floodlights, at night.
 * INFERRED / ILLUSTRATIVE: that the contact was with the OUTSIDE of the right boot (the brief's account; the sources say "right foot",
 *  "poked", "diverted", "redirected") — drawn as an outside-of-the-boot flick with her right side to goal; Miyama kicking with her right
 *  foot (an inswinger); the ball's height (a low ball, contact about knee high) and flight time; exactly where on Wambach it deflected (drawn:
 *  her right shoulder) and where it entered (drawn: high, just inside the near post); every other player's position and run (Boxx marking
 *  Sawa, Rampone, Buehler, LePeilbet, Krieger, Lloyd, Morgan, Heath for the USA; Kumagai, Iwashimizu, Kawasumi, Nagasato, Sakaguchi, Kinga
 *  for Japan — all on the pitch at 117'); Solo's keeper kit colour (drawn red) and the referee's kit (drawn black); hair (ponytails; Sawa's
 *  dark hair tied back), heights and builds; the navy trim and numbers on the white US kit, the paper numbers on the blue Japan kit; the ball
 *  design; the stadium drawn as a closed two-tier bowl under a ring roof with floodlights in the roof edge; the camera placements and lenses;
 *  Sawa's celebration run; the clock stamp, rings, arrows and badges are teaching graphics, not footage.
 *
 * STRUCTURE (the user's standard: a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): the play is ONE simulation
 * on a real clock τ (seconds, τ = 0 Miyama's corner): ch1 = the high main-stand broadcast camera in real time (the teams, the clock, the
 * corner, Sawa's run, the goal); ch2 = the TV slow-motion replay, low and close, orbiting Sawa from the pitch round to her right side (she is
 * first there, the outside-of-the-boot flick, over Solo); ch3 = the replay from behind the goal, low through the net (the clip off Wambach,
 * the net, the celebration, the Golden Ball and Boot); ch4 = a duotone lesson (attack the near post early; any part of your foot redirects).
 * Seams are forward passages into the ball. Contact points are read from the solved skeletons (Miyama's right toe; the outside of Sawa's
 * right boot) so the ball always meets the boot. Figures: lib/plays/riso/athlete.ts through ONE adapter, drawPlayer().
 * Framing: the world is centred on the CANVAS centre (never sheet.safe) with a lens that widens for a square window (1.45:1 … 1:1).
 * Inks: yellow (floodlights, grass with blue, highlights), red (skin, crowd, Solo), blue (Japan, grass), navy (night, key line, US trim).
 * Scenes read only their local t; drawn objects pose on twos, cameras on ones; all randomness is seeded. Budget ≈ 150–300 plate ops/frame. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,settle,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,posed,keyPoses,blendPose,runCycle,stand,strike,backpedal,celebrate,keeperSet,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Camera,type Place,type Build,type V3,type Detail,type Skeleton} from './athlete';

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
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`sawa film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
/** VOICE: null until the lead voices the film with scripts/plays/kokoro-narrate.py sawa-final-2011 (writes timing.json next to
 * script.json). Then import that timing.json and pass it here (see the LEAD note in the header). */
import timingJson from '../../../public/plays/narration/sawa-final-2011/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Frankfurt',"Frankfurt, 2011, the World Cup final. Japan, in blue, are losing to the USA, in white. Three minutes left. Corner! Homare Sawa sprints to the near post... goal!",
  ['Frankfurt','World Cup final','Japan','in blue','the USA','in white','Three minutes left','Corner','Homare Sawa','sprints to the near post','goal']),
 prov('Outside of the foot','Watch again, slowly. Sawa gets there first and flicks it with the outside of her right foot, over Hope Solo.',
  ['Watch again','slowly','gets there first','flicks it','outside of her right foot','over Hope Solo']),
 prov('Two all','From behind, see it clip Abby Wambach into the net. Two all! Japan won the shootout, and Sawa won the Golden Ball and Golden Boot.',
  ['From behind','clip Abby Wambach','into the net','Two all','Japan won the shootout','Golden Ball','Golden Boot']),
 prov('Near post','Attack the near post early, and use any part of your foot to redirect the ball.',
  ['Attack the near post','early','any part of your foot','redirect the ball']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`sawa film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a retime can never reorder a camera) */
function mono(K0:number[][]):Key[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});}

// ================= 3D helpers over athlete.ts cameras (right-handed, metres, y up; goal line x = 0, net toward +x, pitch to x = −105) =================
const sub=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const add=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mul=(a:V3,k:number):V3=>[a[0]*k,a[1]*k,a[2]*k];
const dot=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const mix3=(a:V3,b:V3,u:number):V3=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u];
const mv3=(m:number[],v:V3):V3=>[m[0]*v[0]+m[1]*v[1]+m[2]*v[2],m[3]*v[0]+m[4]*v[1]+m[5]*v[2],m[6]*v[0]+m[7]*v[1]+m[8]*v[2]];
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
const lerpAng=(a:number,b:number,u:number)=>{let d=b-a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return a+d*u;};
/** a yellow mark that must read on grass or navy: knock the paper through first, then print the yellow (1 extra op) */
function yInk(s:Sheet,p:Path2D,cov=.95){s.knockout(p,.92);s.fill(Y,p,cov);}
/** a yellow ring (cue highlight) as one knocked-out ribbon */
function yRing(s:Sheet,x:number,y:number,r:number,w:number,cov=.95){if(r<1)return;const pts:Pt[]=Array.from({length:24},(_,i)=>[x+Math.cos(i/24*TAU)*r,y+Math.sin(i/24*TAU)*r] as Pt);yInk(s,ribbon(pts,w,{close:true,taper:0,wobble:.6}),cov);}
/** a dotted ground arrow through world points (chalk-talk run lines) */
function groundArrow(s:Sheet,c:Camera,pts3:V3[],u:number,wm=.2,minW=8){
 const pts:Pt[]=[];const n=40;for(let i=0;i<=n;i++){const v=i/n*u*(pts3.length-1),k=Math.min(pts3.length-2,Math.floor(v)),p=mix3(pts3[k],pts3[k+1],v-k);if(depthOf(c,p)>NEAR)pts.push(P(c,p));}
 if(pts.length<2)return;const w=Math.max(minW,wm*kAt(c,pts3[pts3.length-1])),gaps:[number,number][]=[];for(let x=.05;x<.93;x+=.09)gaps.push([x,x+.035]);yInk(s,ribbon(pts,w,{taper:.1,wobble:1,gaps}),.95);
 const e=pts[pts.length-1],d=pts[Math.max(0,pts.length-3)],a=Math.atan2(e[1]-d[1],e[0]-d[0]);yInk(s,polyPath([[e[0]+Math.cos(a)*w*2.2,e[1]+Math.sin(a)*w*2.2],[e[0]+Math.cos(a+2.4)*w*1.7,e[1]+Math.sin(a+2.4)*w*1.7],[e[0]+Math.cos(a-2.4)*w*1.7,e[1]+Math.sin(a-2.4)*w*1.7]],true),.95);}

// ================= the Commerzbank-Arena at night: a closed two-tier bowl under a ring roof, floodlights in the roof edge =================
const PC=-52.5;// pitch centre (x); the goal Japan attack is at x = 0
const se=(th:number,a:number,b:number):[number,number]=>{const c=Math.cos(th),s=Math.sin(th),n=5;return[PC+a*Math.sign(c)*Math.pow(Math.abs(c),2/n),b*Math.sign(s)*Math.pow(Math.abs(s),2/n)];};
/** bowl rings [a, b, y]: lower tier 0→1, upper tier 2→3; the roof from 4 (inner edge, floodlights) to 5 */
const RINGS:[number,number,number][]=[[61,42,.9],[74,55,11],[76,57,13.5],[93,74,29],[70,51,33],[98,79,35]];
const NSEG=32;
const ringPt=(i:number,k:number):V3=>{const[a,b,y]=RINGS[k],[x,z]=se(i/NSEG*TAU,a,b);return[x,y,z];};
const bowl=(i:number,k0:number,k1:number,u:number,v:number):V3=>{const th=(i+u)/NSEG*TAU,[a0,b0,y0]=RINGS[k0],[a1,b1,y1]=RINGS[k1],p0=se(th,a0,b0),p1=se(th,a1,b1);return[lerp(p0[0],p1[0],v),lerp(y0,y1,v),lerp(p0[1],p1[1],v)];};
/** crowd: [segment, tier (0 lower / 2 upper), u, v, ink 0 paper faces / 1 red / 2 blue (Japan fans) / 3 yellow, phase] */
const CROWD=(()=>{const r=rng(2011),out:[number,number,number,number,number,number][]=[];for(let i=0;i<NSEG;i++)for(const tier of[0,2])for(let k=0;k<26;k++){const c=r();out.push([i,tier,r(),.06+r()*.88,c<.42?0:c<.66?1:c<.9?2:3,r()*TAU]);}return out;})();
/** the "three minutes left" clock stamp, printed in the night sky above the far stand (a teaching graphic) */
const CLK:V3=[-6,50,-92];
type Crowd={cheer?:number;flash?:number;lamps?:number;t:number;net?:(p:V3)=>V3};
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{cheer=0,flash=0,lamps=1,t}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5;
 // night: a deep navy print over the paper, a faint blue glow rising from the bowl
 s.field(K,.88,.5);
 // stands: knocked out, a blue screen for the seats, navy step bands; a paper walkway between the tiers
 const stands=new Path2D(),rows=new Path2D(),walk=new Path2D(),roof=new Path2D(),edge=new Path2D();
 for(let i=0;i<NSEG;i++){for(const[k0,k1] of[[0,1],[2,3]]){addPoly(stands,clipPoly(c,[bowl(i,k0,k1,0,0),bowl(i,k0,k1,1,0),bowl(i,k0,k1,1,1),bowl(i,k0,k1,0,1)]));
   for(let q=1;q<8;q+=2)addPoly(rows,clipPoly(c,[bowl(i,k0,k1,0,q/8),bowl(i,k0,k1,1,q/8),bowl(i,k0,k1,1,(q+.45)/8),bowl(i,k0,k1,0,(q+.45)/8)]));}
  addPoly(walk,clipPoly(c,[bowl(i,1,2,0,0),bowl(i,1,2,1,0),bowl(i,1,2,1,1),bowl(i,1,2,0,1)]));
  addPoly(roof,clipPoly(c,[ringPt(i,4),ringPt(i+1,4),ringPt(i+1,5),ringPt(i,5)]));
  addPoly(edge,clipPoly(c,[ringPt(i,4),ringPt(i+1,4),add(ringPt(i+1,4),[0,-.9,0]),add(ringPt(i,4),[0,-.9,0])]));}
 s.tone(B,stands,.5);s.tone(R,rows,.1);s.knockout(walk,.35);
 // crowd heads: faces, US red, Japan blue, a few yellow — bobbing on the twos when they cheer
 const heads=[new Path2D(),new Path2D(),new Path2D(),new Path2D()],seen=[0,0,0,0];
 for(const[i,tier,u,v,col,ph] of CROWD){const p=bowl(i,tier,tier+1,u,v),bob=cheer>0?cheer*.8*Math.abs(Math.sin(ph+tt*9)):0;p[1]+=.35+bob;if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.55*k,4,20),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.6,sz,sz*1.15);seen[col]++;}
 if(seen[0])s.knockout(heads[0],.6);if(seen[1])s.fill(R,heads[1],.95);if(seen[2])s.fill(B,heads[2],.95);if(seen[3])s.fill(Y,heads[3],.95);
 // camera flashes when the goal goes in (paper sparks on the twos)
 if(flash>0){const fp=new Path2D(),r=rng(700+Math.floor(tt*12));let n=0;for(let k=0;k<Math.round(26*flash);k++){const i=Math.floor(r()*NSEG),tier=r()<.5?0:2,p=bowl(i,tier,tier+1,r(),.1+r()*.8);if(depthOf(c,p)<3)continue;const[x,y]=P(c,p),sz=clamp(.9*kAt(c,p),7,22);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n){s.knockout(fp);s.fill(Y,fp,.6);}}
 // roof: a dark ring; its inner edge a paper line with the floodlight panels and their yellow haloes
 s.fill(K,roof,.95);s.knockout(edge,.7);
 const lamp=new Path2D(),halo=new Path2D();let nl=0;for(let i=0;i<NSEG*2;i++){const p=add(ringPt(i/2,4),[0,-.6,0]);if(depthOf(c,p)<4)continue;const[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;const w=clamp(1.3*kAt(c,p),4,60);lamp.rect(x-w,y-w*.4,w*2,w*.8);const r=w*(2.6+.8*lamps);halo.moveTo(x+r,y+r*.2);halo.ellipse(x,y+r*.2,r,r*.75,0,0,TAU);nl++;}
 if(nl){s.knockout(halo,.2*lamps);s.tone(Y,halo,.3+.3*lamps);s.knockout(lamp);s.fill(Y,lamp,.5+.45*lamps);}
 // LED boards round the pitch (navy with yellow panels) — behind the goal and along the touchlines
 const bd=new Path2D(),pn=new Path2D();
 addPoly(bd,clipPoly(c,[[5.5,0,-28],[5.5,0,28],[5.5,.95,28],[5.5,.95,-28]]));for(const z of[-37.2,37.2])addPoly(bd,clipPoly(c,[[-108,0,z],[4,0,z],[4,.95,z],[-108,.95,z]]));
 for(let k=0;k<9;k++){const z=-26+k*6;addPoly(pn,clipPoly(c,[[5.45,.25,z],[5.45,.25,z+3.2],[5.45,.7,z+3.2],[5.45,.7,z]]));}
 for(let x=-104;x<0;x+=9)addPoly(pn,clipPoly(c,[[x,.25,-37.15],[x+5,.25,-37.15],[x+5,.7,-37.15],[x,.7,-37.15]]));
 s.knockout(bd);s.fill(K,bd,.85);s.fill(Y,pn,.8);
 // grass under the floodlights: yellow × blue = green, mowing stripes, paper lines
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-110,0,-37],[5.5,0,-37],[5.5,0,37],[-110,0,37]]));s.knockout(gp);yInk(s,gp,.88);s.tone(B,gp,.6);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10.5)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5.25,0,-34],[x+5.25,0,34],[x,0,34]]));s.tone(B,stripes,.2);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.14);
 Ln([-105,-34],[0,-34]);Ln([-105,34],[0,34]);Ln([0,-34],[0,34]);Ln([-52.5,-34],[-52.5,34]);
 Ln([0,-20.16],[-16.5,-20.16]);Ln([-16.5,-20.16],[-16.5,20.16]);Ln([-16.5,20.16],[0,20.16]);
 Ln([0,-9.16],[-5.5,-9.16]);Ln([-5.5,-9.16],[-5.5,9.16]);Ln([-5.5,9.16],[0,9.16]);
 {let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=Math.PI-.927+i/10*1.854,pt:[number,number]=[-11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 {let prev:[number,number]|null=null;for(let i=0;i<=5;i++){const a=Math.PI/2+i/5*Math.PI/2,pt:[number,number]=[Math.cos(a),-34+Math.sin(a)];if(prev)Ln(prev,pt);prev=pt;}}// the corner arc Miyama kicks from
 addPoly(lines,clipPoly(c,[[-11.15,.02,-.15],[-10.85,.02,-.15],[-10.85,.02,.15],[-11.15,.02,.15]]));
 s.knockout(lines,.95);
 // the corner flag at Japan's left
 const fl=new Path2D(),top:V3=[0,1.5,-34];if(depthOf(c,top)>NEAR){const a=P(c,[0,0,-34]),b=P(c,top),k=kAt(c,top);fl.addPath(ribbon([a,b],Math.max(2,.05*k),{taper:0,wobble:0}));const flag=polyPath([b,P(c,[0,1.2,-33.55]),P(c,[0,1.02,-34])],true);s.fill(K,fl,.9);yInk(s,flag,.95);}
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
 s.knockout(vol,.35);s.tone(K,vol,.2);s.stroke(K,mesh,clamp(.03*kAt(c,[0,1,0]),2,9),.75);
 const frameP=new Path2D(),edge=new Path2D(),bar=(a:V3,b:V3,w0=.12)=>{if(depthOf(c,a)<NEAR||depthOf(c,b)<NEAR)return;const pa=P(c,a),pb=P(c,b),w=w0*kAt(c,mix3(a,b,.5));frameP.addPath(ribbon([pa,pb],Math.max(2,w),{taper:0,pressure:0,wobble:.5}));edge.addPath(ribbon([pa,pb],Math.max(2,w)+Math.max(2,w*.4),{taper:0,pressure:0,wobble:.5}));};
 bar([0,0,-W],[0,H+.06,-W]);bar([0,0,W],[0,H+.06,W]);bar([0,H,-W-.06],[0,H,W+.06]);
 bar([Dp,0,-W],[Dp,H,-W],.06);bar([Dp,0,W],[Dp,H,W],.06);bar([0,H,-W],[Dp,H,-W],.05);bar([0,H,W],[Dp,H,W],.05);
 s.fill(K,edge,.9);s.knockout(frameP);
}
const netRipple=(age:number,hit:V3)=>(p:V3):V3=>{const d=Math.hypot(p[0]-hit[0],p[2]-hit[2])*.8+Math.abs(p[1]-hit[1])*.6,w=.5*Math.exp(-age*2.2)*Math.exp(-d*d*.4)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.4,p[1]+w*.8,p[2]+w*.2];};

// ================= the ball (2011: a white match ball — design illustrative): paper, navy panels, a red accent, a blue shade =================
const BALL_R=.11;
function whiteBall(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number;duo?:boolean}={}){
 const{sq=0,dir=0,duo=false}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const rim:Pt[]=Array.from({length:28},(_,i)=>{const a=i/28*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),disc=polyPath(rim,true);
 s.knockout(disc);if(duo)s.fill(Y,disc,.2);
 s.save();s.clip(disc);
 s.tone(duo?K:B,crescent(0,0,r*1.02,[-.4,-.45]),duo?.32:.45);
 const pan=new Path2D(),acc=new Path2D();for(let k=0;k<3;k++){const a=spin+k*TAU/3,cx=Math.cos(a)*r*.58,cy=Math.sin(a)*r*.58*Math.cos(spin*.6);const tri:Pt[]=[];for(let j=0;j<3;j++){const b=a+j*TAU/3+.3;tri.push([cx+Math.cos(b)*r*.3,cy+Math.sin(b)*r*.3]);}pan.addPath(polyPath(tri,true));}
 const aa=spin*.8;acc.addPath(ribbon([[Math.cos(aa)*r*.1,Math.sin(aa)*r*.1],[Math.cos(aa+.9)*r*.45,Math.sin(aa+.9)*r*.45],[Math.cos(aa+1.8)*r*.2,Math.sin(aa+1.8)*r*.2]],Math.max(2,r*.16),{taper:.6,wobble:0}));
 s.fill(K,pan,.95);if(!duo)s.fill(R,acc,.95);
 s.restore();
 s.fill(K,ribbon(rim,Math.max(3,r*.09),{close:true,pressure:.5,wobble:r*.02}));
 s.restore();
}
function ballShadow(s:Sheet,c:Camera,b:V3){const pts:Pt[]=[],rad=.18+b[1]*.03;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[b[0]+Math.cos(a)*rad,.02,b[2]+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.55-b[1]*.06,.2,.55));}

// ================= kits (2011: Japan all blue, the USA all white) and the figure adapter =================
const SKIN_J:AthleteStyle['skin']=[[Y,.42],[R,.22]],SKIN_L:AthleteStyle['skin']=[[Y,.32],[R,.2]],SKIN_D:AthleteStyle['skin']=[[R,.42],[Y,.5],[K,.22]];
type Kit=AthleteStyle;
/** women footballers: athletic builds (bulk ≈ .9), ponytails unless the player wore her hair short */
const JPN=(n:number,o:Partial<Kit>={}):Kit=>({shirt:B,shorts:B,socks:B,boots:K,skin:SKIN_J,hair:K,hairStyle:'ponytail',line:K,shade:[K,.32],sleeves:'short',number:n,numberInk:'paper',build:{height:1.63,bulk:.9},seed:40+n,...o});
const USA=(n:number,o:Partial<Kit>={}):Kit=>({shirt:'paper',shorts:'paper',socks:'paper',trim:K,boots:K,skin:SKIN_L,hair:[Y,.7],hairStyle:'ponytail',line:K,shade:[K,.26],sleeves:'short',number:n,numberInk:K,build:{height:1.72,bulk:.92},seed:70+n,...o});
const SAWA:Kit=JPN(10,{build:{height:1.65,bulk:.9,thighs:1.02},hair:[K,.95],seed:10});
const MIYAMA:Kit=JPN(8,{build:{height:1.57,bulk:.88},seed:8});
const WAMBACH:Kit=USA(20,{hair:[Y,.55],hairStyle:'short',build:{height:1.8,bulk:1.02},seed:20});
const SOLO:Kit={shirt:[R,.8],shorts:[K,.85],socks:[R,.8],boots:K,skin:SKIN_L,hair:[Y,.75],hairStyle:'ponytail',gloves:[Y,.9],line:K,sleeves:'long',shade:[K,.26],number:1,numberInk:'paper',build:{height:1.75,bulk:.95},seed:1};
const REF:Kit={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],trim:'paper',boots:K,skin:SKIN_L,hair:[Y,.7],hairStyle:'ponytail',line:K,sleeves:'short',build:{height:1.8,bulk:.92},seed:33};
/** duotone versions for the lesson chapter (navy + yellow only) */
const duo=(st:Kit,lead=false):Kit=>({...st,shirt:lead?[K,.45]:[Y,.6],shorts:lead?[K,.45]:[K,.32],socks:lead?[K,.45]:[Y,.6],trim:lead?'paper':K,skin:lead?[[Y,.6],[K,.2]]:[[Y,.35]],hair:lead?[K,.9]:K,shade:[K,.2],numberInk:lead?'paper':K,gloves:null});
/** a halftone echo print of a pose (chronophotograph stamps) */
const ECHO:Kit={shirt:[Y,.45],shorts:[Y,.3],socks:[Y,.3],boots:[K,.6],skin:[[Y,.3]],hair:[K,.5],hairStyle:'ponytail',line:K,shade:null,shadow:false,lineWeight:.8,detail:'low',sleeves:'short',build:{height:1.65,bulk:.9},seed:99};

/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, one continuous organic silhouette). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:Kit,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean;detail?:Detail}={}){
 const st:AthleteStyle=o.detail?{...style,detail:o.detail}:style;
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,st,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,st,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 Miyama strikes the corner) =================
const SB:Build=SAWA.build!;
const CORNER:V3=[-.5,.11,-33.5];// Japan's left corner (attacking +x, their left is −z)
const TF=1.4;// the low corner's flight to the near post
/** the outside of the right boot (foot frame: x toe, y up, z to her right) */
const outsideBoot=(sk:Skeleton):V3=>add(sk.rAn,mv3(sk.fr.rFt as unknown as number[],[.075*sk.s,-.045*sk.s,.055*sk.s]));
// ---- Sawa: loiters at the penalty spot → sprints to the near post → outside-of-the-right-boot flick → runs away celebrating ----
const SK_AIM:[number,number]=[-2.3,-4.7];// where she meets it: 2.3 m out, a metre outside the near post (z = −3.66)
const YF=YAW(CORNER[0]-SK_AIM[0],CORNER[2]-SK_AIM[1]);// facing the ball as it comes in: her RIGHT side is to the goal
const FW0=.42,FW1=.5,FC=FW0/(FW0+FW1);// flick window around contact (τ = TF)
const FLICK_KEYS:[number,Pose][]=[
 [0,posed({lHipF:34,lKnee:30,lAnk:-6,rHipF:-24,rKnee:86,rAnk:34,lShF:-30,rShF:40,lElb:80,rElb:84,lean:14,pitch:8,air:.03})],
 [FC*.5,posed({lHipF:14,lKnee:40,lAnk:4,rHipF:6,rHipA:16,rKnee:72,rAnk:30,rHipR:-10,lean:12,pitch:4,bend:8,lShA:52,lShF:14,lElb:40,rShA:40,rShF:-10,rElb:44,neckP:32,neckY:6})],
 [FC,posed({lHipF:8,lKnee:32,lAnk:12,rHipF:22,rHipA:44,rHipR:-34,rKnee:34,rAnk:22,bend:-16,roll:-6,lean:8,twist:-10,lShA:74,lShF:8,lElb:30,rShA:62,rShF:18,rElb:36,neckP:36,neckY:-22})],
 [FC+.22,posed({lHipF:2,lKnee:26,lAnk:34,air:.07,rHipF:30,rHipA:34,rHipR:-18,rKnee:44,rAnk:26,bend:-12,roll:-4,lean:2,twist:-18,lShA:66,lShF:-10,rShA:50,rShF:26,rElb:40,neckP:8,neckY:-48})],
 [1,posed({lHipF:-8,lKnee:42,lAnk:20,rHipF:14,rHipA:12,rKnee:34,lean:6,twist:-20,lShA:40,rShA:40,lElb:50,rElb:50,neckP:-4,neckY:-60})],
];
const FLICK=(u:number)=>keyPoses(u,FLICK_KEYS);
const F_SK0=solve(FLICK(FC),SB,{yaw:YF}),OB0=outsideBoot(F_SK0);
const SPL:[number,number]=[SK_AIM[0]-OB0[0],SK_AIM[1]-OB0[2]];// her place at contact
const RIGHT:[number,number]=[Math.sin(YF),Math.cos(YF)];// her right side on the ground (toward the goal)
const HIT:V3=[SK_AIM[0]+RIGHT[0]*.09,Math.max(.22,OB0[1]+.02),SK_AIM[1]+RIGHT[1]*.09];// the ball centre at contact, against the outside of the boot
const F_SK=solve(FLICK(FC),SB,{x:SPL[0],z:SPL[1],yaw:YF});
// ---- Wambach: marking the near-post zone, facing the corner; the flick clips her right shoulder ----
const WB:Build=WAMBACH.build!;
const WPL:[number,number]=[-1.2,-3.45],YW=YAW(CORNER[0]-WPL[0],CORNER[2]-WPL[1]);
const WAMBACH_MARK=posed({lHipF:30,rHipF:26,lKnee:38,rKnee:32,lean:16,pitch:4,lShA:34,rShA:30,lShF:20,rShF:14,lElb:56,rElb:50,neckP:8,neckY:6});
const W_SK=solve(WAMBACH_MARK,WB,{x:WPL[0],z:WPL[1],yaw:YW});
const WD:V3=add(W_SK.rSh,[Math.cos(YW)*.16+.05,.04,-Math.sin(YW)*.16]);// the clip, just in front of her right shoulder
const NET_TO:V3=[1.05,2.22,-2.55];// high, just inside the near post, into the roof of the net
const TD1=.12,TD2=.24,T_CLIP=TF+TD1,T_NET=T_CLIP+TD2,T_LINE=T_CLIP+TD2*(-WD[0]/(NET_TO[0]-WD[0]));
/** Sawa's run: from the penalty spot, curving onto the near post so she arrives facing the ball */
const SP0:[number,number]=[-9.4,-.9];
const SRUN:[number,number,number][]=[[-10,-9.8,-.4],[-1.1,SP0[0],SP0[1]],[-.35,SP0[0]+.35,SP0[1]-.25],[TF-.8,SPL[0]-1.1,SPL[1]+2.5],[TF-.3,SPL[0],SPL[1]]];
const CEL:[number,number,number][]=[[TF+FW1,SPL[0],SPL[1]],[TF+1.5,SPL[0]-2.6,SPL[1]-4.2],[TF+2.8,SPL[0]-4.4,SPL[1]-8.2]];
type MKey=[number,number,number];// τ, x, z
function pathPos(p:MKey[],tau:number){let dist=0;if(tau<=p[0][0])return{x:p[0][1],z:p[0][2],vx:0,vz:0,dist:0};
 for(let i=0;i+1<p.length;i++){const a=p[i],b=p[i+1],L=Math.hypot(b[1]-a[1],b[2]-a[2]),dt=b[0]-a[0];if(tau<b[0]){const u=(tau-a[0])/dt;return{x:lerp(a[1],b[1],u),z:lerp(a[2],b[2],u),vx:(b[1]-a[1])/dt,vz:(b[2]-a[2])/dt,dist:dist+L*u};}dist+=L;}
 const l=p[p.length-1];return{x:l[1],z:l[2],vx:0,vz:0,dist};}
/** idle: a standing body that breathes and looks around (never a frozen hold) */
const idle=(tau:number,seed:number):Pose=>{const p=stand();p.neckY=.4*Math.sin(tau*.55+seed);p.twist=.08*Math.sin(tau*.4+seed*1.7);p.lKnee+=.05*Math.sin(tau*1.3+seed);return p;};
/** a running body: stride phase from distance run, speed from velocity, facing the run (or the ball when still) */
function runner(p:MKey[],tau:number,look:V3,seed=0,rest?:Pose):{pose:Pose;place:Place}{
 const q=pathPos(p,tau),v=Math.hypot(q.vx,q.vz),sp=clamp(v/7.5),run=runCycle(q.dist/(2.1+2.3*sp)+seed*.37,{speed:sp});
 const yaw=v>.6?YAW(q.vx,q.vz):YAW(look[0]-q.x,look[2]-q.z);return{pose:blendPose(rest??idle(tau,seed),run,clamp(v/1.2)),place:{x:q.x,z:q.z,yaw}};}
type Seg=[number,(t:number)=>{pose:Pose;place:Place}];
const SAWA_SEGS:Seg[]=[
 [-99,t=>runner(SRUN,t,CORNER,2,posed({lHipF:24,rHipF:20,lKnee:34,rKnee:30,lean:14,lShA:30,rShA:34,lElb:40,rElb:40,neckP:10}))],
 [TF-FW0,t=>({pose:FLICK(clamp((t-(TF-FW0))/(FW0+FW1))),place:{x:SPL[0],z:SPL[1],yaw:YF}})],
 [TF+FW1,t=>{const q=pathPos(CEL,t),v=Math.hypot(q.vx,q.vz);return{pose:celebrate(Math.max(0,q.dist)/3,{kind:'run'}),place:{x:q.x,z:q.z,yaw:v>.3?YAW(q.vx,q.vz):YAW(CEL[2][1]-CEL[1][1],CEL[2][2]-CEL[1][2])}};}],
 [TF+2.8,t=>{const e=CEL[CEL.length-1];return{pose:celebrate(Math.max(0,t-TF-2.8)/.9,{kind:'arms'}),place:{x:e[1],z:e[2],yaw:YAW(CEL[2][1]-CEL[1][1],CEL[2][2]-CEL[1][2])+.6}};}],
];
/** a segmented character at τ, crossfaded (both evaluated at τ) over ±.1 s at every boundary so no pose pops */
function segAt(S:Seg[],tau:number):{pose:Pose;place:Place}{
 let i=0;while(i+1<S.length&&tau>=S[i+1][0])i++;
 const mixSeg=(a:number,b:number,u:number)=>{const A=S[a][1](tau),Bq=S[b][1](tau);return{pose:blendPose(A.pose,Bq.pose,u),place:{x:lerp(A.place.x??0,Bq.place.x??0,u),z:lerp(A.place.z??0,Bq.place.z??0,u),yaw:lerpAng(A.place.yaw??0,Bq.place.yaw??0,u)}};};
 const st=S[i][0];if(i>0&&tau<st+.1)return mixSeg(i-1,i,sm(st-.1,st+.1,tau,easeInOutSine));
 const nx=S[i+1]?.[0];if(nx!==undefined&&tau>nx-.1)return mixSeg(i,i+1,sm(nx-.1,nx+.1,tau,easeInOutSine));
 return S[i][1](tau);}
const sawaAt=(tau:number)=>segAt(SAWA_SEGS,tau);

// ---- the ball: placed at the corner → a low, curling ball to the near post → flicked up off the outside of the boot → clips Wambach → the net ----
function ballAt(tau:number):V3{
 if(tau<0)return CORNER;
 if(tau<TF){const u=tau/TF,e=1.12*u-.12*u*u;return[lerp(CORNER[0],HIT[0],e)+.7*Math.sin(Math.PI*u),lerp(CORNER[1],HIT[1],e)+1.45*4*u*(1-u),lerp(CORNER[2],HIT[2],e)];}
 if(tau<T_CLIP)return mix3(HIT,WD,(tau-TF)/TD1);
 if(tau<T_NET){const u=(tau-T_CLIP)/TD2;const p=mix3(WD,NET_TO,u);p[1]+=.2*4*u*(1-u);return p;}
 const e=tau-T_NET,u=clamp(e/.14);if(u<1)return mix3(NET_TO,[1.75,2.0,-2.45],easeOut(u));
 const d=clamp((e-.14)/.5),h=2.0*(1-d*d)+.11*d*d;return[1.75-.3*d,Math.max(.11,h)+(d>=1?.08*Math.abs(Math.sin((e-.64)*8))*Math.exp(-(e-.64)*3):0),-2.45+.25*d];}
const NET_HIT:V3=[2,1.9,-2.45];

// ---- everybody else ----
type Actor={style:Kit;at:(tau:number,ball:V3)=>{pose:Pose;place:Place}};
const mover=(style:Kit,p:MKey[],seed:number,rest?:Pose):Actor=>({style,at:(t,b)=>runner(p,t,b,seed,rest)});
/** Miyama: over the corner, runs in, strikes it with her right foot (contact at τ = 0), then jogs in and joins the celebration */
const MB:Build=MIYAMA.build!;
const YM=YAW(HIT[0]-CORNER[0],HIT[2]-CORNER[2])+10*D2R;
const M_SK=solve(strike(STRIKE_CONTACT,{power:.8}),MB,{yaw:YM});
const MPL:[number,number]=[CORNER[0]-M_SK.rToe[0],CORNER[2]-M_SK.rToe[2]];
const mdir:[number,number]=[Math.cos(YM),-Math.sin(YM)];
const MIYA:MKey[]=[[-10,MPL[0]-mdir[0]*3.4+.6,MPL[1]-mdir[1]*3.4],[-1.5,MPL[0]-mdir[0]*3.4,MPL[1]-mdir[1]*3.4],[-.6,MPL[0]-mdir[0]*1.1,MPL[1]-mdir[1]*1.1],[.5,MPL[0]+mdir[0]*.5,MPL[1]+mdir[1]*.5],[T_NET+.3,MPL[0]-1.2,MPL[1]+5],[TF+4.4,SPL[0]-4.4,SPL[1]-9.6]];
/** Solo's late reach: a short spring off both feet, the right glove up — beaten high at the near post */
const SOLO_KEYS:[number,Pose][]=[
 [0,keeperSet(0)],
 [.3,posed({lHipF:58,rHipF:54,lHipA:14,rHipA:14,lKnee:84,rKnee:80,lean:18,pitch:6,lShA:40,rShA:44,lShF:40,rShF:70,lElb:60,rElb:50,neckP:-24,lHand:1,rHand:1})],
 [.58,posed({air:.32,lHipF:10,rHipF:24,lKnee:30,rKnee:56,lAnk:40,rAnk:40,lean:-6,pitch:-6,bend:-10,lShA:70,lShF:30,lElb:40,rShF:176,rShA:14,rElb:8,neckP:-46,neckY:-10,lHand:1,rHand:1,dx:-.2})],
 [.82,posed({air:.05,lHipF:30,rHipF:36,lKnee:50,rKnee:56,lean:4,lShA:50,lShF:30,rShF:120,rShA:30,rElb:30,neckP:-30,neckY:-40,twist:-20,lHand:1,rHand:1,dx:-.3})],
 [1,posed({lHipF:26,rHipF:28,lKnee:40,rKnee:42,lean:10,lShA:30,rShA:30,lElb:50,rElb:50,neckP:-10,neckY:-70,twist:-30,dx:-.3})],
];
const LOOK_MARK=posed({lHipF:28,rHipF:24,lKnee:36,rKnee:30,lean:14,pitch:3,lShA:28,rShA:30,lElb:52,rElb:48,neckP:6});
const ACTORS:Actor[]=[
 {style:MIYAMA,at:(t,b)=>{const r=runner(MIYA,t,b,1);if(t>-.7&&t<.7){const u=clamp((t+.62)/1.2);r.pose=blendPose(r.pose,strike(u,{power:.8}),Math.sin(clamp((t+.7)/1.4)*Math.PI));r.place.yaw=YM;}if(t>T_NET+.3)r.pose=blendPose(r.pose,celebrate(t*1.3,{kind:'run'}),sm(T_NET+.3,T_NET+.8,t));return r;}},// Aya Miyama (8)
 {style:WAMBACH,at:(t,b)=>{// Abby Wambach (20): marking the near post; the ball clips her; she turns to see it in
  const turn=sm(T_CLIP-.02,T_NET+.6,t),flinch=Math.exp(-Math.max(0,t-T_CLIP)*6)*(t>T_CLIP?1:0);
  const p=blendPose({...WAMBACH_MARK,neckY:(6-4*Math.sin(t*1.7))*D2R},posed({lHipF:18,rHipF:12,lKnee:26,rKnee:22,lean:4,lShA:20,rShA:24,lElb:40,rElb:40,neckP:-6,neckY:-50,twist:-24}),turn);
  p.twist-=.25*flinch;p.lean-=.12*flinch;return{pose:p,place:{x:WPL[0]-.05*Math.sin(t*1.3),z:WPL[1],yaw:YW}};}},
 {style:SOLO,at:(t,b)=>{// Hope Solo (1): set at the near post, beaten high as it goes over her
  const x=-.55,z=-2.75,yaw=YAW(b[0]-x,b[2]-z),u=clamp((t-(TF-.3))/.95);
  return{pose:blendPose(keeperSet(t*1.6),keyPoses(u,SOLO_KEYS),sm(TF-.35,TF-.15,t)),place:{x,z,yaw:t<TF?yaw:lerpAng(YAW(CORNER[0]-x,CORNER[2]-z),yaw,.3)}};}},
 mover(USA(7,{hair:[K,.8]}),[[-10,SP0[0]+.9,SP0[1]+.4],[-.15,SP0[0]+.8,SP0[1]+.5],[TF+.1,SPL[0]-1.9,SPL[1]+2.9],[TF+1.2,SPL[0]-1.3,SPL[1]+1.6]],3,LOOK_MARK),// Shannon Boxx, beaten to it
 mover(USA(3,{hair:[Y,.6]}),[[-10,-6.6,.6],[TF,-5,-.6],[TF+2,-4.6,-1]],4,LOOK_MARK),// Christie Rampone
 mover(USA(19,{hair:[K,.7]}),[[-10,-5.2,2.6],[TF,-4.2,1.2],[TF+2,-4,1]],5,LOOK_MARK),// Rachel Buehler
 mover(USA(6,{hair:[R,.5]}),[[-10,-3.4,-1.1],[TF,-2.9,-1.6]],6,LOOK_MARK),// Amy LePeilbet
 mover(USA(11,{hair:[Y,.6]}),[[-10,-2.4,3.9],[TF,-2.2,3.4]],7,LOOK_MARK),// Ali Krieger, far post
 mover(USA(10,{hair:[Y,.5]}),[[-10,-11.6,1.8],[TF,-9.8,.6],[TF+2,-9,0]],8,LOOK_MARK),// Carli Lloyd
 mover(USA(13,{hair:[K,.85]}),[[-10,-18.5,-3],[TF,-17.4,-3.4]],9),// Alex Morgan
 mover(USA(17,{hair:[K,.85],skin:SKIN_D}),[[-10,-7.4,-26.2],[0,-7.2,-26],[TF,-5.6,-22]],10),// Tobin Heath, ten yards from the corner
 mover(JPN(4,{build:{height:1.71,bulk:.92}}),[[-10,-7.6,1.6],[-.2,-7.6,1.4],[TF,-4.3,.8],[T_NET+.5,-4.2,.6],[TF+4.4,SPL[0]-3.2,SPL[1]-8]],11),// Saki Kumagai
 mover(JPN(3,{build:{height:1.62,bulk:.92}}),[[-10,-6.2,3.6],[-.2,-6.2,3.4],[TF,-3.2,2.6],[T_NET+.6,-3.2,2.4],[TF+4.6,SPL[0]-5.4,SPL[1]-7.2]],12),// Azusa Iwashimizu
 mover(JPN(9),[[-10,-10.8,-2.8],[-.2,-10.6,-2.6],[TF,-6.9,-1.5],[T_NET+.4,-6.4,-1.8],[TF+4.2,SPL[0]-3.6,SPL[1]-10.4]],13),// Nahomi Kawasumi
 mover(JPN(17,{build:{height:1.68,bulk:.93}}),[[-10,-4.4,-.2],[TF,-2.6,.2],[T_NET+.4,-2.5,.1],[TF+4.4,SPL[0]-5.8,SPL[1]-9.4]],14),// Yuki Nagasato
 mover(JPN(6,{build:{height:1.65,bulk:.92}}),[[-10,-20,2],[TF,-19,1.2],[TF+5,-12,-7]],15),// Mizuho Sakaguchi
 mover(JPN(2,{build:{height:1.61,bulk:.9}}),[[-10,-6.2,-30.5],[TF,-6.4,-29.4],[TF+5,SPL[0]-5,SPL[1]-11]],16),// Yukari Kinga, a short option
 mover(REF,[[-10,-15,-13],[TF,-14,-12],[TF+3,-12,-12]],17),// the referee
];
const IS_JPN=(st:Kit)=>st.shirt===B,IS_USA=(st:Kit)=>st.shirt==='paper';
type Item={depth:number;draw:()=>void};
/** everyone and the ball at τ, depth sorted. `hero` draws Sawa with motion smear + secondary motion; `cap` limits figure detail
 * (passages), small figures in wide shots print at 'low'. */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;glow?:number;cap?:boolean;skip?:number[]}){
 const ball=ballAt(tau),bp=ballAt(tp),items:Item[]=[],ppu=pxPer(s);
 const put=(style:Kit,st:{pose:Pose;place:Place},prev?:{pose:Pose;place:Place},smear=false)=>{const g:V3=[st.place.x??0,0,st.place.z??0],d=depthOf(c,g);if(d<(style===SAWA?1:2.2))return;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.2*kk)return;
  const hPx=1.8*kk*ppu;if(o.cap&&style!==SAWA&&hPx<34)return;const detail:Detail|undefined=hPx<62||(style!==SAWA&&hPx<(o.cap?150:105))?'low':o.cap?'mid':undefined;
  items.push({depth:d,draw:()=>drawPlayer(s,st.pose,c,style,st.place,{prev,smear:smear&&!o.cap,detail})});};
 ACTORS.forEach((a,i)=>{if(!o.skip?.includes(i))put(a.style,a.at(tp,bp));});
 const sw=sawaAt(tp);put(SAWA,sw,o.hero?sawaAt(tp-1/12):undefined,!!o.hero);
 items.push({depth:depthOf(c,ball),draw:()=>{if(depthOf(c,ball)<NEAR+.2)return;const a=P(c,ballAt(tau-.03)),q=P(c,ball),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,ball));ballShadow(s,c,ball);
  if(o.glow&&o.glow>.02)yRing(s,q[0],q[1],r*1.6,Math.max(3,r*.3*o.glow));
  whiteBall(s,q[0],q[1],r,tau*9,{sq:clamp(sp/(r*3),0,.35),dir:Math.atan2(dy,dx)});}});
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
 return{ball,sawa:sw};}
/** a ring on the grass round a player (team rings, "first there") */
function footRing(path:Path2D,c:Camera,x:number,z:number,g:number){const q=groundRing(c,x,z,.9*g);if(q.length>2)path.addPath(ribbon(q,Math.max(5,.12*kAt(c,[x,0,z])),{close:true,taper:0,wobble:.6}));}

// ================= chapter 1 (live, real time): the high main-stand camera; the teams, the clock, the corner, Sawa's run, the goal =================
const ch1q=()=>({fr:T(0,'Frankfurt'),wc:T(0,'World Cup final'),jp:T(0,'Japan'),bl:T(0,'in blue'),us:T(0,'the USA'),wh:T(0,'in white'),tm:T(0,'Three minutes left'),co:T(0,'Corner'),hs:T(0,'Homare Sawa'),sp:T(0,'sprints to the near post'),g:T(0,'goal'),end:SEC(0)});
/** the lead-in: τ = t − TL. The ball crosses the line on "goal" when the voice allows; the corner is never struck before "Corner". */
const ch1T=()=>{const q=ch1q(),TL=clamp(q.g-T_LINE+.05,q.co+.5,Math.max(q.co+.5,q.end-T_LINE-1));return{TL,end:q.end};};
const BCAM:V3=[-31,21,52];
/** before the corner the director's camera tells the story with the words: the bowl → the teams → the clock in the sky → the corner */
function ch1Pre(t:number):number[]{const q=ch1q();return key(t,mono([[0,-50,14,-30,1500],[q.fr,-40,8,-16,1900],[q.wc,-30,4,-8,2300],[q.jp,-7,1,-3,3300],[q.wh+.2,-7,1,-4,3500],[q.tm,CLK[0]+2,CLK[1]-14,CLK[2]+20,2300],[q.co-.1,-1.5,1,-27,5200]]),easeInOutSine,true);}
function ch1Play(tau:number):V3{const b=ballAt(Math.min(tau,T_NET+.3));
 if(tau<0)return[-1.8,1,-27];if(tau<TF)return mix3([-1.8,1,-27],[lerp(b[0],-3,.5),1.1,lerp(b[2],-5,.6)],sm(0,TF,tau));
 return mix3([-2.5,1.2,-4.6],[-4,1.1,-7],sm(T_NET+.3,T_NET+2,tau));}
function ch1Cam(t:number){const q=ch1q(),{TL}=ch1T(),tau=t-TL,w=sm(TL-1.5,TL-.2,t),av=(f:(x:number)=>V3)=>{const a=f(tau),b=f(tau-.2),c=f(tau-.4);return[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3] as V3;};
 const pre=ch1Pre(t),look=mix3([pre[0],pre[1],pre[2]],av(ch1Play),w);
 const Fp=key(tau,mono([[-1.5,5200],[0,4800],[TF*.6,3900],[TF,5600],[T_NET+.2,6000],[T_NET+1.5,4800]]),easeInOutSine);
 return cam(BCAM,look,lerp(pre[3],Fp,w));}
/** team rings: on "in blue" blue rings round the blue shirts, on "in white" navy rings round the white ones */
function teamRings(s:Sheet,c:Camera,tp:number,t:number){
 const q=ch1q(),rj=sm(q.jp,q.jp+.3,t,easeOutBack)*(1-sm(q.us,q.us+.6,t)),ru=sm(q.us,q.us+.3,t,easeOutBack)*(1-sm(q.tm,q.tm+.5,t));
 if(rj<.02&&ru<.02)return;const bp=ballAt(tp),pj=new Path2D(),pu=new Path2D();
 ACTORS.forEach(a=>{const p=a.at(tp,bp).place;if(IS_JPN(a.style)&&rj>.02)footRing(pj,c,p.x??0,p.z??0,rj);if(IS_USA(a.style)&&ru>.02)footRing(pu,c,p.x??0,p.z??0,ru);});
 if(rj>.02){const h=sawaAt(tp).place;footRing(pj,c,h.x??0,h.z??0,rj);}
 if(rj>.02){s.knockout(pj,.9);s.fill(B,pj,.95);}if(ru>.02){s.knockout(pu,.9);s.fill(K,pu,.9);}
}
/** "Three minutes left": a clock face stamped in the night sky, its last three minutes a yellow wedge (117′ → 120′) */
function clockStamp(s:Sheet,c:Camera,t:number){
 const q=ch1q(),a=sm(q.tm-.1,q.tm+.35,t,easeOutBack)*(1-sm(q.co-.2,q.co+.4,t));if(a<.02||depthOf(c,CLK)<5)return;
 const R0=9*a,k=kAt(c,CLK),[cx,cy]=P(c,CLK),r=R0*k,face=new Path2D();face.arc(cx,cy,r,0,TAU);s.knockout(face,.95);
 const wedge=new Path2D(),a0=-Math.PI/2+TAU*117/120,sweep=TAU*3/120*(1-.35*sm(q.tm+.3,q.co,t));wedge.moveTo(cx,cy);for(let i=0;i<=12;i++){const ang=a0+sweep*i/12;wedge.lineTo(cx+Math.cos(ang)*r*.92,cy+Math.sin(ang)*r*.92);}wedge.closePath();
 s.fill(Y,wedge,.95);
 const ticks=new Path2D();for(let i=0;i<12;i++){const ang=i/12*TAU;ticks.addPath(ribbon([[cx+Math.cos(ang)*r*.78,cy+Math.sin(ang)*r*.78],[cx+Math.cos(ang)*r*.9,cy+Math.sin(ang)*r*.9]],Math.max(3,r*.05),{taper:0,wobble:0}));}
 const hand=ribbon([[cx,cy],[cx+Math.cos(a0)*r*.8,cy+Math.sin(a0)*r*.8]],Math.max(4,r*.07),{taper:.3,wobble:0});ticks.addPath(hand);
 const rim:Pt[]=Array.from({length:30},(_,i)=>[cx+Math.cos(i/30*TAU)*r,cy+Math.sin(i/30*TAU)*r] as Pt);ticks.addPath(ribbon(rim,Math.max(4,r*.07),{close:true,taper:0,wobble:.5}));
 s.fill(K,ticks,.95);
}
const ch1:Scene={
 draw(s,t){const q=ch1q(),{TL}=ch1T(),tt=twos(t),c=ch1Cam(t),goalIn=t-TL-T_NET;frame(s);
  stadium(s,c,{t,lamps:.4+.6*sm(q.fr-.1,q.fr+.5,t),cheer:.12+.9*sm(0,.5,goalIn),flash:.15*sm(q.wc,q.wc+.3,t)*(1-sm(q.jp,q.jp+.6,t))+1.3*sm(0,.4,goalIn),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  clockStamp(s,c,t);
  teamRings(s,c,tt-TL,t);
  // "Corner": a yellow ring round the corner arc and Miyama over the ball
  const cr=sm(q.co,q.co+.3,tt,easeOutBack)*(1-sm(q.hs+.3,q.hs+.8,tt));if(cr>.02){const p=new Path2D();footRing(p,c,CORNER[0]-.4,CORNER[2]+.3,cr*1.6);yInk(s,p,.95);}
  // "sprints to the near post": her run printed as a dotted arrow onto the near post, and a yellow bracket on the post
  const ar=sm(q.sp,q.sp+.6,tt)*(1-sm(q.g+.2,q.g+.7,tt));if(ar>.02){groundArrow(s,c,[[SP0[0],.03,SP0[1]],[SRUN[3][1],.03,SRUN[3][2]],[SPL[0]+.4,.03,SPL[1]-.1]],ar,.22,9);
   const k=kAt(c,[0,1.2,-3.66]),a=P(c,[0,0,-3.66]),b=P(c,[0,2.44*ar,-3.66]);yInk(s,ribbon([a,b],Math.max(8,.14*k),{taper:0,wobble:.6}),.95);}
  const w=drawWorld(s,c,t-TL,tt-TL,{ballMin:12,cap:t>q.end-.7});
  // "Homare Sawa": a yellow ring on the grass under her
  const hr=sm(q.hs,q.hs+.3,tt,easeOutBack)*(1-sm(q.sp+.8,q.sp+1.4,tt));if(hr>.02){const p=new Path2D(),h=w.sawa.place;footRing(p,c,h.x??0,h.z??0,hr*1.1);yInk(s,p,.95);}
 },
 aperture(t){const{TL}=ch1T(),c=ch1Cam(t),p=ballAt(t-TL),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(14,BALL_R*kAt(c,p))*.95,12);},
 still:9,
};

// ================= chapter 2 (TV replay, slow motion, low and close, orbiting from the pitch round to Sawa's right side) =================
const ch2q=()=>({w:T(1,'Watch again'),sl:T(1,'slowly'),gf:T(1,'gets there first'),fl:T(1,'flicks it'),of:T(1,'outside of her right foot'),os:T(1,'over Hope Solo'),end:SEC(1)});
const tau2=(t:number)=>{const q=ch2q();return key(t,mono([[0,TF-1.25],[q.gf+.4,TF-.4],[q.fl+.3,TF-.03],[q.of+.9,TF+.05],[q.os+.4,T_CLIP+.1],[q.end,T_NET+.25]]),x=>x);};
const C2:V3=[SK_AIM[0],.5,SK_AIM[1]];
function ch2Cam(t:number){const q=ch2q(),orbit=sm(q.gf,q.of+.6,t,easeInOutSine),ang=lerp(-128,-62,orbit)*D2R,D=lerp(7.4,5.2,sm(0,q.of,t))+1.2*sm(q.os,q.end,t),h=lerp(.95,.75,orbit)+.5*sm(q.os,q.end,t);
 const tau=tau2(t),pos:V3=[C2[0]+Math.cos(ang)*D,h,C2[2]+Math.sin(ang)*D],b=ballAt(tau),sp=sawaAt(tau).place;
 const base=mix3([(sp.x??0),.95,(sp.z??0)],[C2[0]-.3,.85,C2[2]],sm(q.sl,q.gf+.6,t));
 const look=mix3(base,[b[0],Math.min(b[1],2.4),b[2]],.25+.45*sm(q.os-.2,q.end,t));
 const F=key(t,mono([[0,1300],[q.sl,1450],[q.gf,1500],[q.fl,1700],[q.of+.3,1950],[q.os,1500],[q.end,1250]]));return cam(pos,look,F);}
const ch2:Scene={
 draw(s,t){const q=ch2q(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),tp=tau2(tt);frame(s);
  stadium(s,c,{t,cheer:.1,flash:.05});
  // "slowly": her run printed as halftone echo stamps, one every tenth of a second behind her
  const ec=sm(q.sl,q.sl+.3,tt)*(1-sm(q.fl,q.fl+.5,tt));if(ec>.02)for(let k=1;k<=3;k++){const ts=tp-k*.14;if(ts<-.4)continue;const e=sawaAt(ts);drawPlayer(s,e.pose,c,ECHO,e.place,{detail:'low'});}
  const w=drawWorld(s,c,tau,tp,{ballMin:26,hero:true,glow:sm(q.fl-.1,q.fl+.3,tt)*(1-sm(q.of+.4,q.of+.9,tt)),cap:t>q.end-.7,skip:[7,8,9,10,15,16,17]});
  // "gets there first": a yellow ring under Sawa, navy rings under the two US players who are late (Wambach, Boxx)
  const gf=sm(q.gf,q.gf+.3,tt,easeOutBack)*(1-sm(q.fl+.2,q.fl+.7,tt));if(gf>.02){const py=new Path2D(),pn=new Path2D(),h=w.sawa.place;footRing(py,c,h.x??0,h.z??0,gf*.9);
   for(const i of[1,3]){const p=ACTORS[i].at(tp,ballAt(tp)).place;footRing(pn,c,p.x??0,p.z??0,gf*.8);}s.knockout(pn,.9);s.fill(K,pn,.9);yInk(s,py,.95);}
  // "outside of her right foot": a yellow ring on the outside of the right boot, and an arrow the way the ball is redirected
  const of=sm(q.of+.2,q.of+.5,tt,easeOutBack)*(1-sm(q.os+.2,q.os+.6,tt));if(of>.02){const sk=solve(w.sawa.pose,SB,w.sawa.place),ob=outsideBoot(sk),p=P(c,ob),k=kAt(c,ob);yRing(s,p[0],p[1],.2*k*of,Math.max(5,.035*k));
   const a0=P(c,add(HIT,[0,.05,0])),a1=P(c,mix3(HIT,WD,.8*of));const dx=a1[0]-a0[0],dy=a1[1]-a0[1],l=Math.hypot(dx,dy);if(l>8){const wA=Math.max(7,.05*k),ang=Math.atan2(dy,dx);yInk(s,ribbon([a0,a1],wA,{taper:.1,wobble:.6}),.95);yInk(s,polyPath([[a1[0]+Math.cos(ang)*wA*2.2,a1[1]+Math.sin(ang)*wA*2.2],[a1[0]+Math.cos(ang+2.4)*wA*1.7,a1[1]+Math.sin(ang+2.4)*wA*1.7],[a1[0]+Math.cos(ang-2.4)*wA*1.7,a1[1]+Math.sin(ang-2.4)*wA*1.7]],true),.95);}}
  // "over Hope Solo": her reach — a dashed line up from her glove — and the ball above it
  const os=sm(q.os,q.os+.3,tt,easeOutBack)*(1-sm(q.end-.9,q.end-.5,tt));if(os>.02){const gk=ACTORS[2].at(tp,ballAt(tp)),sk=solve(gk.pose,SOLO.build,gk.place),top=sk.rHa[1]>sk.lHa[1]?sk.rHa:sk.lHa,a=P(c,top),b=P(c,add(top,[0,.5*os,0])),k=kAt(c,top),gaps:[number,number][]=[];for(let u=.1;u<1;u+=.24)gaps.push([u,u+.1]);
   yInk(s,ribbon([a,b],Math.max(6,.05*k),{taper:0,wobble:0,gaps}),.95);yInk(s,ribbon([[b[0]-.25*k,b[1]],[b[0]+.25*k,b[1]]],Math.max(6,.05*k),{taper:.2,wobble:0}),.95);}
  // the flick: sparks at the contact, speed lines as it leaves
  if(tp>=TF&&tp<TF+.2){const p=P(c,HIT);sparkBurst(s,Y,p[0],p[1],90+90*sm(TF,TF+.08,tp,easeOut),{n:9,seed:10,g:1-sm(TF+.08,TF+.2,tp),width:10});}
  if(tp>=TF&&tp<T_NET&&depthOf(c,w.ball)>NEAR+.5){const a=P(c,ballAt(tp-.04)),b=P(c,w.ball);speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:4,seed:15,len:130,width:6,cov:.85});}
  // "Watch again": the replay stinger — a paper band with a yellow core sweeps across the frame
  const st=clamp(t/.55);if(st<1){const x0=lerp(-s.W,s.W,easeOut(st)),band=new Path2D();band.rect(x0-s.W*.18,-s.H,s.W*.36,s.H*2);s.knockout(band);const core=new Path2D();core.rect(x0-s.W*.07,-s.H,s.W*.14,s.H*2);s.fill(Y,core,.9);}
 },
 aperture(t){const c=ch2Cam(t),p=ballAt(tau2(t)),[x,y]=P(c,p),r=Math.max(24,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:5,
};

// ================= chapter 3 (replay from behind the goal, low through the net): the clip off Wambach, the net, the celebration, the awards =================
const ch3q=()=>({fb:T(2,'From behind'),cw:T(2,'clip Abby Wambach'),inn:T(2,'into the net'),ta:T(2,'Two all'),ws:T(2,'Japan won the shootout'),gb:T(2,'Golden Ball'),gt:T(2,'Golden Boot'),end:SEC(2)});
const tau3=(t:number)=>{const q=ch3q();return key(t,mono([[0,TF-.55],[q.cw+.25,T_CLIP],[q.inn+.2,T_NET],[q.ta+.2,T_NET+.9],[q.end,T_NET+.9+(q.end-q.ta-.2)*.85]]),x=>x);};
const GCAM:V3=[4.6,1.55,-2.4];
function ch3Cam(t:number){const q=ch3q(),tau=tau3(t),b=ballAt(Math.min(tau,T_NET-.02)),toCel=sm(q.ta,q.ws+.6,t,easeInOutSine);
 const s=sawaAt(tau).place,look0:V3=[SK_AIM[0]-.5,1,SK_AIM[1]-.3],look1:V3=[b[0]*.6+SK_AIM[0]*.4,clamp(b[1],.8,2.2),b[2]*.6+SK_AIM[1]*.4],look2:V3=[(s.x??0),1.3,(s.z??0)];
 const look=mix3(mix3(look0,look1,sm(q.fb,q.cw+.3,t)*(1-sm(q.inn+.3,q.ta,t))),look2,toCel);
 const pos:V3=add(GCAM,[.6*toCel,.5*toCel,-.8*toCel]),F=key(t,mono([[0,1500],[q.cw,1650],[q.inn,1400],[q.ta,1500],[q.ws+.6,2000],[q.gb,2300],[q.end,2400]]));return cam(pos,look,F);}
/** the award badges: a golden ball and a golden boot, printed above Sawa's head */
function badge(s:Sheet,c:Camera,at:V3,kind:'ball'|'boot',g:number,t:number){
 if(g<.02||depthOf(c,at)<NEAR+1)return;const k=kAt(c,at),[x,y]=P(c,at),r=clamp(.42*k,34,140)*g,bob=Math.sin(t*3)*r*.06;
 const star:Pt[]=[];for(let i=0;i<20;i++){const a=i/20*TAU-Math.PI/2,rr=i%2?r*1.05:r*1.42;star.push([x+Math.cos(a)*rr,y+bob+Math.sin(a)*rr]);}
 const sp=polyPath(star,true);s.knockout(sp);s.fill(Y,sp,.95);
 if(kind==='ball'){const d=new Path2D();d.arc(x,y+bob,r*.62,0,TAU);s.fill(K,d,.95);whiteBall(s,x,y+bob,r*.54,t*2,{duo:true});}
 else{const q:Pt[]=[[-.55,-.55],[-.1,-.55],[-.05,.02],[.6,.1],[.72,.38],[-.58,.4]].map(([u,v])=>[x+u*r,y+bob+v*r] as Pt),boot=polyPath(q,true);s.fill(K,ribbon([...q,q[0]],Math.max(4,r*.12),{taper:0,wobble:.4}),.95);s.fill(Y,boot,.95);
  const studs=new Path2D();for(const u of[-.45,-.15,.2,.5])studs.rect(x+u*r-r*.06,y+bob+r*.4,r*.12,r*.12);s.fill(K,studs,.95);}
}
const ch3:Scene={
 draw(s,t){const q=ch3q(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),tp=tau3(tt),goalIn=tau-T_NET,hitT=q.inn+.2;
  const shake=t>=hitT?7*settle(t,hitT,{freq:6,decay:6}):0;frame(s,shake,shake*.4);
  stadium(s,c,{t,cheer:.12+1.1*sm(0,.5,goalIn),flash:.1+1.4*sm(0,.4,goalIn)+.6*sm(q.ws,q.ws+.4,t),net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  const w=drawWorld(s,c,tau,tp,{ballMin:26,hero:false,cap:t>q.end-.7||t<.7,skip:[9,15,17]});
  // "clip Abby Wambach": a navy ring on the grass round her, a spark where it grazes her shoulder
  const cw=sm(q.cw,q.cw+.3,tt,easeOutBack)*(1-sm(q.ta,q.ta+.5,tt));if(cw>.02){const p=new Path2D(),wp=ACTORS[1].at(tp,ballAt(tp)).place;footRing(p,c,wp.x??0,wp.z??0,cw);s.knockout(p,.9);s.fill(K,p,.9);}
  if(tp>=T_CLIP-.02&&tp<T_CLIP+.25&&depthOf(c,WD)>NEAR+.5){const p=P(c,WD);sparkBurst(s,Y,p[0],p[1],70+70*sm(T_CLIP,T_CLIP+.1,tp,easeOut),{n:8,seed:21,g:1-sm(T_CLIP+.08,T_CLIP+.25,tp),width:9});}
  // the ball's path: dotted ink while it is in the air after the flick
  if(tp>TF&&tp<T_NET+.4){const dots=new Path2D();let n=0;for(let i=0;i<=14;i++){const t2=TF+(Math.min(tp,T_NET)-TF)*i/14,p=ballAt(t2);if(depthOf(c,p)<NEAR+.5)continue;const pp=P(c,p),r=clamp(.04*kAt(c,p),4,14);dots.moveTo(pp[0]+r,pp[1]);dots.arc(pp[0],pp[1],r,0,TAU);n++;}if(n)s.fill(K,dots,.6);}
  // "Japan won the shootout": paper, blue and yellow confetti drifting down the frame
  const cf=sm(q.ws,q.ws+.4,t);if(cf>.02){const r=rng(5),pc=[new Path2D(),new Path2D(),new Path2D()];for(let i=0;i<54;i++){const x=(r()-.5)*s.W*1.1,sp=.25+r()*.25,y=-s.H*.6+(((r()+(t-q.ws)*sp)%1+1)%1)*s.H*1.2,sz=10+r()*14,a=r()*TAU+(t-q.ws)*(2+r()*3);pc[i%3].addPath(polyPath([[x+Math.cos(a)*sz,y+Math.sin(a)*sz*.4],[x-Math.sin(a)*sz*.4,y+Math.cos(a)*sz],[x-Math.cos(a)*sz,y-Math.sin(a)*sz*.4],[x+Math.sin(a)*sz*.4,y-Math.cos(a)*sz]],true));}
   s.knockout(pc[0],.95*cf);s.knockout(pc[1],.95*cf);s.fill(B,pc[1],.95*cf);s.knockout(pc[2],.95*cf);s.fill(Y,pc[2],.95*cf);}
  // "Golden Ball", "Golden Boot": the badges pop above Sawa
  const hp=w.sawa.place,above:V3=[(hp.x??0),2.9,(hp.z??0)],side=c.r;
  badge(s,c,add(above,mul([side[0],0,side[2]],-.75)),'ball',sm(q.gb,q.gb+.35,tt,easeOutBack),t);
  badge(s,c,add(above,mul([side[0],0,side[2]],.75)),'boot',sm(q.gt,q.gt+.35,tt,easeOutBack),t);
 },
 aperture(t){const c=ch3Cam(t),p=sawaAt(tau3(t)).place,at:V3=[p.x??0,1.1,p.z??0],[x,y]=P(c,at),r=Math.max(30,.35*kAt(c,at));return apertureDisc(x,y,r*.92,12);},
 still:7,
};

// ================= chapter 4 (duotone lesson): attack the near post early; any part of your foot can redirect the ball =================
const ch4q=()=>({an:T(3,'Attack the near post'),ea:T(3,'early'),ap:T(3,'any part of your foot'),rd:T(3,'redirect the ball'),end:SEC(3)});
/** lesson clock: the run plays in real time from "early", the ball hangs at the boot under "any part of your foot", then redirects */
const tau4=(t:number)=>{const q=ch4q();return key(t,mono([[0,-1.2],[q.ea,-.35],[q.ap-.1,TF-.06],[q.rd,TF-.02],[q.rd+.25,TF+.02],[q.rd+.9,T_NET+.1],[q.end,T_NET+.4]]),x=>x);};
const SAWA4=duo(SAWA,true),SOLO4=duo(SOLO);
const LCAM=(t:number)=>{const q=ch4q(),v=key(t,mono([[0,-3.6,3.4,-18,1100],[q.an,-3.4,3.2,-17.5,1150],[q.ea,-3.2,2.5,-15.5,1300],[q.ap,-1.2,.9,-9.8,2500],[q.rd+.3,-1.8,1.1,-10.6,1900],[q.end,-2.6,1.4,-11.4,1700]]),easeInOutSine,true);
 const u=sm(q.ea,q.ap,t),look:V3=[lerp(-4.6,SK_AIM[0]+.3,u),lerp(.6,.55,u),lerp(-3.2,SK_AIM[1]+.3,u)];return cam([v[0],v[1],v[2]],look,v[3]);};
const ch4:Scene={
 draw(s,t){const q=ch4q(),tt=twos(t),c=LCAM(t),tau=tau4(t),tp=tau4(tt);frame(s);
  // the stage: a navy print, the grass as a paper-dotted navy floor, stepped yellow light round the near post
  s.field(K,.75,.5);
  const floor=new Path2D();addPoly(floor,clipPoly(c,[[-40,0,-40],[3,0,-40],[3,0,40],[-40,0,40]]));s.tone(K,floor,.2);
  const pool=(r:number)=>{const g=groundRing(c,-2.4,-4.2,r,40),p=new Path2D();if(g.length>2)p.addPath(polyPath(g,true));return p;};
  s.knockout(pool(5),.15);s.tone(Y,pool(2.6),.2);
  const lines=new Path2D();groundLine(lines,c,[0,-12],[0,12],.14);groundLine(lines,c,[0,-9.16],[-5.5,-9.16],.14);groundLine(lines,c,[-5.5,-9.16],[-5.5,9.16],.14);s.knockout(lines,.9);
  goal(s,c,tp>T_NET?netRipple(tp-T_NET,NET_HIT):undefined);
  // "Attack the near post": the near-post zone prints on the grass, a bracket lights the post
  const zn=sm(q.an,q.an+.4,tt,easeOut);if(zn>.02){const z=new Path2D();addPoly(z,clipPoly(c,[[0,.02,-3.66],[0,.02,-3.66-5.4*zn],[-5.5*zn,.02,-3.66-5.4*zn],[-5.5*zn,.02,-3.66]]));s.knockout(z,.5);s.fill(Y,z,.45);
   const k=kAt(c,[0,1.2,-3.66]),a=P(c,[0,0,-3.66]),b=P(c,[0,2.44*zn,-3.66]);yInk(s,ribbon([a,b],Math.max(8,.12*k),{taper:0,wobble:.6}),.95);}
  // "early": her run draws itself onto the near post as she makes it, before the ball arrives
  const ea=sm(q.ea-.1,q.ea+.9,tt);if(ea>.02&&tp<TF+.3)groundArrow(s,c,[[SP0[0],.03,SP0[1]],[SRUN[3][1],.03,SRUN[3][2]],[SPL[0]+.4,.03,SPL[1]-.1]],ea,.16,8);
  const items:Item[]=[],sw=sawaAt(tp),pv=sawaAt(tp-1/12),bp=ballAt(tp);
  for(const[i,st] of [[2,SOLO4]] as [number,Kit][]){const a=ACTORS[i].at(tp,bp);items.push({depth:depthOf(c,[a.place.x??0,0,a.place.z??0]),draw:()=>drawPlayer(s,a.pose,c,st,a.place,{detail:'mid'})});}
  items.push({depth:depthOf(c,[sw.place.x??0,0,sw.place.z??0]),draw:()=>drawPlayer(s,sw.pose,c,SAWA4,sw.place,{prev:pv,smear:true})});
  const bpos=ballAt(tau);items.push({depth:depthOf(c,bpos),draw:()=>{if(depthOf(c,bpos)<NEAR+.3)return;ballShadow(s,c,bpos);const b=P(c,bpos),a=P(c,ballAt(tau-.03)),r=Math.max(20,BALL_R*kAt(c,bpos));whiteBall(s,b[0],b[1],r,tau*9,{duo:true,sq:clamp(Math.hypot(b[0]-a[0],b[1]-a[1])/(r*3),0,.12),dir:Math.atan2(b[1]-a[1],b[0]-a[0])});}});
  items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
  // "any part of your foot": three rings pop on her right boot — the inside, the laces, the outside
  const ap=tt-q.ap;if(ap>-.05&&tt<q.rd+.35){const sk=solve(sw.pose,SB,sw.place),Ft=sk.fr.rFt as unknown as number[],s2=sk.s;
   const spots:V3[]=[add(sk.rAn,mv3(Ft,[.07*s2,-.045*s2,-.055*s2])),add(sk.rAn,mv3(Ft,[.1*s2,0,0])),outsideBoot(sk)];
   spots.forEach((p,i)=>{const g=sm(i*.28,i*.28+.3,ap,easeOutBack)*(1-sm(q.rd-q.ap+.1,q.rd-q.ap+.35,ap)*(i<2?1:.4));if(g<.02)return;const pp=P(c,p),k=kAt(c,p);yRing(s,pp[0],pp[1],.075*k*g*(i===2?1.35:1),Math.max(4,.022*k));});}
  // "redirect the ball": the new path draws itself off the outside of the boot, into the goal
  const rd=sm(q.rd,q.rd+.8,tt,easeOut);if(rd>.02){const pts:Pt[]=[];for(let i=0;i<=20;i++){const tb=TF+(T_NET-TF)*i/20*rd,p=ballAt(tb);if(depthOf(c,p)>NEAR)pts.push(P(c,p));}
   const inn:Pt[]=[];for(let i=0;i<=12;i++){const p=ballAt(TF*(.55+.45*i/12));if(depthOf(c,p)>NEAR)inn.push(P(c,p));}
   if(inn.length>1)s.fill(K,ribbon(inn,Math.max(6,.04*kAt(c,HIT)),{taper:.6,wobble:.5,gaps:[[.1,.2],[.3,.4],[.5,.6],[.7,.8]]}),.7);
   if(pts.length>1)yInk(s,ribbon(pts,Math.max(9,.07*kAt(c,HIT)),{taper:.2,wobble:1}),.95);}
  if(tp>=TF&&tp<TF+.22){const p=P(c,HIT);sparkBurst(s,Y,p[0],p[1],110,{n:9,seed:41,g:1-sm(TF+.08,TF+.22,tp),width:11});}
 },
 still:4.5,
};

const story:RisoStory={
 id:'sawa-final-2011',format:'11v11',title:"Sawa's near-post flick",
 theme:'Attack the near post early, and use any part of your foot to redirect the ball.',
 ageNote:"Women's World Cup final, Japan 2–2 USA (Japan won 3–1 on penalties), Frankfurt, 17 July 2011. The 117th-minute equaliser.",
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a near-post flick — the ball kicks sideways off the point with a yellow ring on the grass. Reduced motion: the ball and ring, still. */
 touch(s,x,y,age,seed){
  const u=age<=0?0:clamp(age/.8),dx=Math.sin(u*Math.PI*.5)*150,up=Math.sin(u*Math.PI)*110,g=age<=0?1:easeOutBack(clamp(age/.25));
  s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>{const q=i/20*TAU;return[x+Math.cos(q)*100*g,y+Math.sin(q)*30*g] as Pt;}),true),12,.95);
  if(age>0&&age<.35)sparkBurst(s,Y,x,y,110*g,{n:8,seed,g:1-clamp(age/.35),width:11});
  whiteBall(s,x+dx,y-up,52,age*10+hash(seed,3)*TAU,{sq:age>0?.16*Math.max(0,1-age*5):0,dir:-Math.PI/4});
 },
};
export default story;
