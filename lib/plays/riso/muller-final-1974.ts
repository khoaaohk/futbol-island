/** Iconic play film: Gerd Müller's winning goal in the 1974 World Cup final. Netherlands 1–2 West Germany, Olympiastadion, Munich,
 * 7 July 1974, the 43rd minute (just before half-time, at 1–1). A RisoStory (chapters mode) played by the card window and StoryFilmPlayer.
 * Narration text: public/plays/narration/muller-final-1974/script.json. The lead voices it later with local Kokoro. Until then every chapter
 * runs on provisional cue times (≈2.6 words/s, see prov()). EVERY action time is read from cue onsets and chapter seconds, so once
 * timing.json exists `withTiming` re-times the whole film through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/muller-final-1974/timing.json exists, replace the `VOICE` constant below with
 *   import timingJson from '../../../public/plays/narration/muller-final-1974/timing.json';  const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
 *
 * SOURCES (read Sept 2026 with curl; cached in scratchpad/films/src-cache; the footage itself was not watched):
 *  - Wikipedia, "1974 FIFA World Cup final" (raw wikitext) https://en.wikipedia.org/wiki/1974_FIFA_World_Cup_final
 *  - Wikipedia (de), "Fußball-Weltmeisterschaft 1974", section Finale (match narrative + kit template)
 *    https://de.wikipedia.org/wiki/Fu%C3%9Fball-Weltmeisterschaft_1974
 *  - Wikipedia, "Gerd Müller" (en) and (de); Wikipedia (de), "Rainer Bonhof"
 *  - read-only: lib/plays/riso/cruyff-turn-1974.ts (same tournament: the Dutch 1974 adidas kit research)
 * CONFIRMED by those pages: 7 July 1974, Olympiastadion Munich, 16:00, 78,200, referee Jack Taylor (England); Neeskens pen 2', Breitner
 *  pen 25' (1–1), Müller 43' (2–1, the winner, his 14th World Cup goal and last international goal). The goal: Rainer Bonhof played the
 *  ball into the middle to Müller; Müller, pressed by TWO Dutch players, first let the ball bounce off him a little, turned on the spot
 *  ("drehte sich um die eigene Achse"), caught keeper Jan Jongbloed on the wrong foot, and the ball rolled LOW into the LEFT corner.
 *  Numbers: Müller 13, Bonhof 16, Jongbloed 8, Krol 12, Haan 2, Rijsbergen 17, Grabowski 9, Hölzenbein 17, Overath 12, Beckenbauer 5.
 *  West Germany: white shirts with black collar and cuffs, BLACK shorts, white socks (both wikis agree). Netherlands: orange shirts with
 *  black trim, orange socks with three black stripes. Müller was short and squat with a low centre of gravity and famously strong thighs
 *  (David Winner, quoted on en.wiki).
 * SOURCES DISAGREE: the Dutch shorts (en.wiki kit template orange, de.wiki white with orange side stripes). Printed white (de.wiki, and the
 *  1974 Dutch home kit as in the Cruyff film); never narrated.
 * FROM THE BRIEF / COMMON ACCOUNTS, NOT IN THE FETCHED PAGES: Bonhof came down the RIGHT and crossed/cut it back from near the byline.
 * INFERRED / ILLUSTRATIVE: every position, distance, speed and run in metres; the build-up (Beckenbauer → Overath → Bonhof); that Haan chased
 *  Bonhof; which two defenders pressed Müller (printed as Krol, goal-side, and Rijsbergen closing from the far side); that the pass arrived
 *  on Müller's right foot and bounced off toward goal; the ~100° turn to the LEFT over his planted left foot and the RIGHT-footed shot
 *  (not narrated); which goal West Germany attacked and so which side the TV camera saw the cross from (here: the main-stand camera sees
 *  West Germany attack to screen right, Bonhof on the far touchline, the shot into the near-side "left" corner); Jongbloed's kit (yellow
 *  shirt, black shorts) and his weight going the wrong way; Müller's celebration; the referee's black kit; Müller's and Bonhof's hair;
 *  the Telstar-style ball; the weather; the stadium's look (the sunken oval bowl with the running track, the acrylic tent roof over the
 *  main stand, masts, the Olympic Tower beyond the north-east curve); crowd colours and flags; ad boards (no lettering); every camera
 *  position and lens and the slow-motion speed of the replay.
 *
 * STRUCTURE (the approved standard: a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): the play is ONE
 * simulation on a real clock τ (seconds; τ = 0 the moment Müller's right boot meets the ball):
 *  ch1 = LIVE, the high main-stand camera in real time (the build-up, Bonhof down the right, the cut-back, the turn, the shot, the net);
 *  ch2 = the TV slow-motion REPLAY from a low, close camera on the near side (the pass bounces off him, the two defenders, the spin on the
 *        spot, the low early shot into the corner, the keeper wrong-footed);
 *  ch3 = the lesson, a duotone (blue + navy) replay on an empty print: in the box, turn quickly and shoot early, before defenders block it.
 * Seams are forward passages into the ball. The ball meets the solved boots (placeFor() puts each striker so his foot lands on the ball);
 * Müller's standing foot is locked to the ground through the pivot and the strike. Figures: lib/plays/riso/athlete.ts through ONE adapter,
 * drawPlayer(). World: right-handed metres like athlete.ts (no projector wrap): the Dutch goal line x = 0, the pitch runs to x = −105,
 * West Germany attack +x, their right flank is +z (the far touchline); the TV gantry is on the main stand (−z side).
 * Inks: yellow (skin, grass with blue, flags, the keeper), orange (Netherlands, running track), blue (sky, grass, tent roof), navy (key line,
 * West Germany's shorts). Scenes read only their local t; drawn objects pose on twos, cameras on ones; all randomness is seeded.
 * Framing: the full sheet (card window 1.45:1 down to square), never sheet.safe; subjects stay inside ±540 units of the centre.
 * Phone heat: ≈4 plates, the bowl crowd batched per ink; small figures print at 'low' detail in the wide shot and every figure is capped
 * during passages (two scenes print at once). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,blob,ribbon,polyPath,smoothPts,partial,easeOut,easeIO,easeOutBack,easeInOutSine,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,posed,keyPoses,blendPose,runCycle,stand,lunge,keeperSet,keeperDive,strike,celebrate,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Camera,type Place,type Build,type V3,type Detail} from './athlete';

const O='orange',Y='yellow',B='blue',K='navy';
const D2R=Math.PI/180;
/** Frame the FULL sheet: world (dx,dy) lands on the sheet centre at `zoom`, ignoring safe/fit (the card window is small). */
function frame(s:Sheet,zoom=1,dx=0,dy=0){const S=zoom*s.arrival;s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,zoom/s.fit,0);}

// ================= narration (script.json mirrors it) =================
/** Provisional cue onsets: ≈2.6 words/s plus sentence pauses; replaced by measured Kokoro onsets once timing.json exists. */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/2.6+(/[.!?]$/.test(w)?.4:/[,;]$/.test(w)?.18:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`muller film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
/** VOICE: null until the lead records the narration with Kokoro; then the timing.json import goes here (see the header). */
import timingJson from '../../../public/plays/narration/muller-final-1974/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Live',"Munich, 1974, the World Cup final. West Germany, in white, play the Netherlands, in orange. It's one each, just before half-time. Rainer Bonhof races down the right and passes. Gerd Müller turns and shoots. Goal!",
  ['Munich','the World Cup final','West Germany','in white','the Netherlands','in orange',"It's one each",'just before half-time','Rainer Bonhof','races down the right','passes','Gerd Müller','turns','shoots','Goal']),
 prov('The replay','Watch it again. The pass bounces off Müller, and two defenders close in. No time to think! He spins on the spot and hits it low, early, into the corner. The keeper is wrong-footed.',
  ['Watch it again','The pass','bounces off Müller','two defenders','close in','No time','spins on the spot','hits it low','early','into the corner','keeper','wrong-footed']),
 prov('Your turn',"Müller's goal won the World Cup. In the box, turn quickly and shoot early, before defenders can block it.",
  ["Müller's goal",'won the World Cup','In the box','turn quickly','shoot early','before defenders','block it']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`muller film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a retime can never reorder a camera) */
function mono(K0:number[][]):Key[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});}
/** true while two scenes print at once (the departing .65 s or the arriving .72 s): figures are capped a detail step */
const busy=(ch:number,t:number)=>t>SEC(ch)-.65||(ch>0&&t<.72);

// ================= 3D helpers over athlete.ts cameras (right-handed, metres, y up) =================
const sub=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const add=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const mul=(a:V3,k:number):V3=>[a[0]*k,a[1]*k,a[2]*k];
const dot=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const mix3=(a:V3,b:V3,u:number):V3=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u];
/** a camera from position, look point and focal length F (sheet units) */
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
const dirOf=(yaw:number):[number,number]=>[Math.cos(yaw),-Math.sin(yaw)];
/** the right-hand side of a body at this yaw (athlete: at yaw 0 the right side is +z) */
const rightOf=(yaw:number):[number,number]=>[Math.sin(yaw),Math.cos(yaw)];
const lerpAng=(a:number,b:number,u:number)=>{let d=b-a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return a+d*u;};
const n2=(x:number,z:number):[number,number]=>{const l=Math.hypot(x,z)||1;return[x/l,z/l];};

// ================= the Olympiastadion: a sunken oval bowl round a running track, the tent roof over the main stand, the Olympic Tower =================
const CX=-52.5;// the centre spot
/** a point on a rounded oval (superellipse) round the centre spot: a along x, b along z, height y, angle th (0 = +x end) */
function ov(a:number,b:number,y:number,th:number):V3{const c=Math.cos(th),s=Math.sin(th),e=.8;return[CX+a*Math.sign(c)*Math.pow(Math.abs(c),e),y,b*Math.sign(s)*Math.pow(Math.abs(s),e)];}
const IN:[number,number,number]=[64,45,.9],OUT:[number,number,number]=[98,76,19];// the bowl's front edge and rim
const NSEG=44;
const bowlPt=(th:number,v:number):V3=>mix3(ov(IN[0],IN[1],IN[2],th),ov(OUT[0],OUT[1],OUT[2],th),v);
/** crowd: [u round the bowl, v up the terrace, ink 0 paper / 1 navy / 2 orange (Dutch fans) / 3 yellow / 4 blue, phase] */
const CROWD=(()=>{const r=rng(1974),o:[number,number,number,number][]=[];for(let i=0;i<2300;i++){const c=r();o.push([r(),.03+r()*.94,c<.36?0:c<.6?1:c<.82?2:c<.93?3:4,r()*TAU]);}return o;})();
/** flags in the crowd: [u, v, 1 Dutch (orange-paper-blue) / 0 German (navy-orange-yellow)] */
const FLAGS:[number,number,number][]=(()=>{const r=rng(707),o:[number,number,number][]=[];for(let i=0;i<30;i++)o.push([r(),.12+r()*.7,r()<.45?1:0]);return o;})();
type Crowd={cheer?:number;flash?:number;dutch?:number;german?:number;t:number};
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{cheer=0,flash=0,dutch=0,german=0,t}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5;
 // a pale July sky, cloud banks knocked out
 s.field(B,.2,.7);
 {const cl=new Path2D(),r=rng(77);for(let i=0;i<6;i++){const x=(r()-.5)*Bnd*1.4,y=-Bnd*.5-r()*300,w=300+r()*420;cl.addPath(polyPath(Array.from({length:18},(_,k)=>{const a=k/18*TAU;return[x+Math.cos(a)*w,y+Math.sin(a)*w*.18*(1+.3*Math.sin(a*3+i))] as Pt;}),true));}s.knockout(cl,.5);}
 // the Olympic Tower beyond the north-east curve: shaft, the observation drum, the antenna
 {const base:V3=[CX-330,0,330],drum:V3=[CX-330,185,330],top:V3=[CX-330,291,330];if(depthOf(c,base)>50){const k=kAt(c,drum),pb=P(c,base),pd=P(c,drum),pt=P(c,top);
  if(Math.abs(pd[0])<Bnd&&pd[1]>-Bnd){const tw=new Path2D();tw.addPath(ribbon([pb,pd],Math.max(3,9*k),{taper:.3,wobble:0}));tw.addPath(ribbon([pd,pt],Math.max(2,2.2*k),{taper:.6,wobble:0}));tw.addPath(polyPath(blob(pd[0],pd[1]-4*k,Math.max(4,17*k),Math.max(3,7*k),5,{amp:.02,n:18}),true));s.tone(K,tw,.55);}}}
 // the bowl: knocked out, a navy screen, stepped terraces; the far half is open to the sky
 const bowl=new Path2D(),steps=new Path2D(),rim=new Path2D();
 for(let i=0;i<NSEG;i++){const a0=i/NSEG*TAU,a1=(i+1)/NSEG*TAU;addPoly(bowl,clipPoly(c,[bowlPt(a0,0),bowlPt(a1,0),bowlPt(a1,1),bowlPt(a0,1)]));
  for(let k=0;k<12;k+=2)addPoly(steps,clipPoly(c,[bowlPt(a0,k/12),bowlPt(a1,k/12),bowlPt(a1,(k+1)/12),bowlPt(a0,(k+1)/12)]));
  addPoly(rim,clipPoly(c,[bowlPt(a0,1),bowlPt(a1,1),add(bowlPt(a1,1),[0,1.6,0]),add(bowlPt(a0,1),[0,1.6,0])]));}
 s.knockout(bowl);s.tone(K,bowl,.4);s.tone(O,steps,.14);s.tone(K,steps,.18);s.fill(K,rim,.8);
 // crowd heads (they bob on the twos when the crowd roars)
 const heads=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()],seen=[0,0,0,0,0];
 for(const[u,v,col,ph] of CROWD){const p=bowlPt(u*TAU,v);p[1]+=.35+(cheer>0?cheer*.8*Math.abs(Math.sin(ph+tt*9)):0);if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.55*k,5,20),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.6,sz,sz*1.15);seen[col]++;}
 if(seen[0])s.knockout(heads[0],.9);if(seen[1])s.fill(K,heads[1],.85);if(seen[2])s.fill(O,heads[2],.95);if(seen[3])s.fill(Y,heads[3],.95);if(seen[4])s.fill(B,heads[4],.95);
 // flags: Dutch tricolours (orange / paper / blue) rise on "the Netherlands", German ones (navy / orange / yellow) on "West Germany"
 {const pole=new Path2D(),blu=new Path2D(),yel=new Path2D(),org=new Path2D(),pap=new Path2D(),nav=new Path2D();
  FLAGS.forEach(([u,v,d],i)=>{const lift=d?dutch:german,b=bowlPt(u*TAU,v);b[1]+=1.2+1.4*lift;if(depthOf(c,b)<4)return;const k=kAt(c,b),pb=P(c,b);if(Math.abs(pb[0])>Bnd||Math.abs(pb[1])>Bnd)return;
   const pt:Pt=[pb[0],pb[1]-1.6*k],w=2.2*k,h=1.4*k,wv=(q:number)=>Math.sin(tt*(5+3*lift)+i+q*4)*h*(.1+.15*lift)*q;pole.addPath(ribbon([pb,pt],Math.max(2,.12*k),{taper:0,wobble:0}));
   const cloth=(v0:number,v1:number)=>polyPath([[pt[0],pt[1]+h*v0+wv(0)],[pt[0]+w,pt[1]+h*v0+wv(1)],[pt[0]+w,pt[1]+h*v1+wv(1)],[pt[0],pt[1]+h*v1+wv(0)]],true);
   if(d){org.addPath(cloth(0,.34));pap.addPath(cloth(.34,.67));blu.addPath(cloth(.67,1));}else{nav.addPath(cloth(0,.34));org.addPath(cloth(.34,.67));yel.addPath(cloth(.67,1));}});
  s.fill(K,pole,.9);s.knockout(blu);s.knockout(org);s.knockout(pap);s.knockout(nav);s.knockout(yel);s.fill(B,blu,.95);s.fill(O,org,.95);s.fill(K,nav,.95);s.fill(Y,yel,.95);}
 // flashbulbs when the crowd roars
 if(flash>0){const fp=new Path2D(),r=rng(700+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(22*flash);i++){const p=bowlPt(r()*TAU,.05+r()*.6);if(depthOf(c,p)<3)continue;const[x,y]=P(c,p),sz=clamp(1*kAt(c,p),8,22);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 // the acrylic tent roof over the main stand (−z): hung panels on cables from masts, printed as a blue screen with navy cable lines
 {const roof=new Path2D(),cab=new Path2D(),mast=new Path2D();const R0=.62*Math.PI*2,R1=.88*Math.PI*2,n=10;
  for(let i=0;i<n;i++){const a0=R0+(R1-R0)*i/n,a1=R0+(R1-R0)*(i+1)/n,sag=(a:number)=>2.5*Math.sin((a-R0)/(R1-R0)*Math.PI*n);
   const q:V3[]=[ov(70,52,27-sag(a0),a0),ov(70,52,27-sag(a1),a1),ov(104,84,34,a1),ov(104,84,34,a0)];addPoly(roof,clipPoly(c,q));
   const e0=ov(70,52,27,a0),e1=ov(104,84,34,a0);if(depthOf(c,e0)>NEAR&&depthOf(c,e1)>NEAR)cab.addPath(ribbon([P(c,e0),P(c,e1)],Math.max(2,.06*kAt(c,e0)),{taper:0,wobble:0}));}
  for(const a of[R0-.05,(R0+R1)/2,R1+.05]){const b=ov(112,90,0,a),tp=ov(112,90,58,a);if(depthOf(c,b)>NEAR&&depthOf(c,tp)>NEAR)mast.addPath(ribbon([P(c,b),P(c,tp)],Math.max(2,.5*kAt(c,b)),{taper:.4,wobble:0}));}
  s.knockout(roof,.6);s.tone(B,roof,.34);s.fill(K,cab,.6);s.fill(K,mast,.85);}
 // the running track (tartan, printed orange with a navy screen) and ad boards at the pitch edge (no lettering)
 {const trk=new Path2D(),q:V3[]=[];for(let i=0;i<48;i++)q.push(ov(IN[0],IN[1],.02,i/48*TAU));addPoly(trk,clipPoly(c,q));s.knockout(trk);s.tone(O,trk,.62);s.tone(K,trk,.14);}
 {const bd=new Path2D(),blk=[new Path2D(),new Path2D(),new Path2D()];
  for(const z of[-36,36])for(let x=-104;x<0;x+=6){addPoly(bd,clipPoly(c,[[x+.2,0,z],[x+5.8,0,z],[x+5.8,.9,z],[x+.2,.9,z]]));const i=Math.abs(Math.round(x/6))%3;addPoly(blk[i],clipPoly(c,[[x+.8,.2,z],[x+4.2,.2,z],[x+4.2,.7,z],[x+.8,.7,z]]));}
  s.knockout(bd);s.stroke(K,bd,3,.7);s.fill(O,blk[0],.9);s.fill(B,blk[1],.9);s.fill(Y,blk[2],.95);}
 // grass: yellow × blue = green, mowing stripes, paper lines
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-109,0,-35.5],[4,0,-35.5],[4,0,35.5],[-109,0,35.5]]));s.knockout(gp);s.fill(Y,gp,.88);s.tone(B,gp,.6);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5,0,-34],[x+5,0,34],[x,0,34]]));s.tone(B,stripes,.2);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.16);
 Ln([-105,-34],[0,-34]);Ln([-105,34],[0,34]);Ln([0,-34],[0,34]);Ln([-52.5,-34],[-52.5,34]);
 Ln([0,-20.16],[-16.5,-20.16]);Ln([-16.5,-20.16],[-16.5,20.16]);Ln([-16.5,20.16],[0,20.16]);
 Ln([0,-9.16],[-5.5,-9.16]);Ln([-5.5,-9.16],[-5.5,9.16]);Ln([-5.5,9.16],[0,9.16]);
 {let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=Math.PI-.927+i/10*1.854,pt:[number,number]=[-11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 {let prev:[number,number]|null=null;for(let i=0;i<=24;i++){const a=i/24*TAU,pt:[number,number]=[-52.5+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 addPoly(lines,clipPoly(c,[[-11.15,.02,-.15],[-10.85,.02,-.15],[-10.85,.02,.15],[-11.15,.02,.15]]));
 s.knockout(lines,.95);
 // corner flags at the Dutch goal line (put back just before kick-off that day)
 for(const z of[-34,34]){const b:V3=[0,0,z],top:V3=[0,1.6,z];if(depthOf(c,b)>2){const pb=P(c,b),pt=P(c,top),k=kAt(c,b);if(Math.abs(pb[0])>Bnd)continue;s.fill(K,ribbon([pb,pt],Math.max(2,.05*k),{taper:0,wobble:0}),.95);const fl=polyPath([pt,[pt[0]-.5*k,pt[1]+.15*k+Math.sin(tt*6+z)*.05*k],[pt[0],pt[1]+.35*k]],true);s.knockout(fl);s.fill(O,fl,.95);}}
}
/** the Dutch goal at x = 0: square posts, a box net held by rear stanchions; `bulge` pushes the back net out round (bz, by) */
function goal(s:Sheet,c:Camera,bulge=0,bz=0,by=.4){
 const W=3.66,H=2.44,Dp=2,vol=new Path2D(),mesh=new Path2D();
 const bx=(z:number,y:number)=>Dp+bulge*.7*Math.exp(-Math.pow((z-bz)/1.4,2)-Math.pow((y-by)/1.1,2));
 const back=(u:number,v:number):V3=>{const z=lerp(-W,W,u),y=lerp(H,0,v);return[bx(z,y),y,z];},top=(u:number,v:number):V3=>[lerp(0,Dp,v),H,lerp(-W,W,u)],side=(z:number)=>(u:number,v:number):V3=>[lerp(0,Dp,u),lerp(H,0,v),z];
 const grid=(f:(u:number,v:number)=>V3,nu:number,nv:number)=>{const poly:V3[]=[];for(let i=0;i<=nu;i++)poly.push(f(i/nu,0));for(let j=1;j<=nv;j++)poly.push(f(1,j/nv));for(let i=nu-1;i>=0;i--)poly.push(f(i/nu,1));for(let j=nv-1;j>0;j--)poly.push(f(0,j/nv));addPoly(vol,clipPoly(c,poly));
  for(let i=0;i<=nu;i++){let on=false;for(let j=0;j<=nv;j++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}
  for(let j=0;j<=nv;j++){let on=false;for(let i=0;i<=nu;i++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}};
 grid(back,14,6);grid(top,12,3);grid(side(-W),3,5);grid(side(W),3,5);
 s.knockout(vol,.3);s.tone(K,vol,.2);s.stroke(K,mesh,Math.max(2,.028*kAt(c,[0,1,0])),.7);
 const frameP=new Path2D(),edge=new Path2D(),bar=(a:V3,b:V3,w0=.12)=>{if(depthOf(c,a)<NEAR||depthOf(c,b)<NEAR)return;const pa=P(c,a),pb=P(c,b),w=w0*kAt(c,mix3(a,b,.5));frameP.addPath(ribbon([pa,pb],Math.max(2,w),{taper:0,pressure:0,wobble:.5}));edge.addPath(ribbon([pa,pb],Math.max(2,w)+Math.max(2,w*.4),{taper:0,pressure:0,wobble:.5}));};
 bar([0,0,-W],[0,H+.06,-W]);bar([0,0,W],[0,H+.06,W]);bar([0,H,-W-.06],[0,H,W+.06]);
 bar([Dp,0,-W],[Dp,H,-W],.06);bar([Dp,0,W],[Dp,H,W],.06);
 s.fill(K,edge,.9);s.knockout(frameP);
}

// ================= the 1974 ball: white with black pentagons (Telstar style), navy shade, rim, glint =================
const BALL_R=.11;
function ball(s:Sheet,x:number,y:number,r:number,rot:number,o:{sq?:number;dir?:number}={}){
 const{sq=0,dir=0}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const pts=blob(0,0,r,r,11,{amp:.02,n:30}),disc=polyPath(pts,true);s.knockout(disc);
 if(r<12){s.fill(K,ribbon(pts,Math.max(3,r*.22),{seed:12,close:true,wobble:.4}));s.restore();return;}
 s.save();s.clip(disc);s.tone(K,crescent(0,0,r*1.02,[-.42,-.45]),.24);
 const pan=new Path2D(),pent=(cx:number,cy:number,pr:number,a0:number)=>{const q:Pt[]=[];for(let i=0;i<5;i++){const a=a0+i/5*TAU;q.push([cx+Math.cos(a)*pr,cy+Math.sin(a)*pr]);}return polyPath(smoothPts(q,true,6,2.5),true);};
 const cr=Math.cos(rot*.7)*r*.12,sr=Math.sin(rot*.7)*r*.1;pan.addPath(pent(cr,sr,r*.3,rot-Math.PI/2));
 for(let i=0;i<5;i++){const a=rot-Math.PI/2+Math.PI/5+i/5*TAU;pan.addPath(pent(cr+Math.cos(a)*r*.86,sr+Math.sin(a)*r*.86,r*.28,a+Math.PI));}
 s.fill(K,pan,.92);s.restore();
 s.fill(K,ribbon(pts,Math.max(3.5,r*.075),{seed:12,close:true,pressure:.5,wobble:r*.02}));
 if(r>=22)s.knockout(polyPath(blob(-r*.4,-r*.42,r*.13,r*.09,13,{amp:.05,n:12}),true));
 s.restore();
}
function ballShadow(s:Sheet,c:Camera,b:V3,cov=.5){const pts:Pt[]=[],rad=.17+b[1]*.03;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[b[0]+Math.cos(a)*rad*1.2,.02,b[2]+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(cov-b[1]*.05,.2,.55));}

// ================= kits (7 July 1974) and the figure adapter =================
const SKIN:AthleteStyle['skin']=[[Y,.52],[O,.3]];
/** West Germany: white shirts, black collar and cuffs, black shorts, white socks */
const GER=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:K,socks:'paper',trim:K,boots:K,skin:SKIN,hair:[K,.7],hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:K,...o});
/** the Netherlands: orange shirts with black trim, white shorts (see SOURCES DISAGREE), orange socks */
const NED=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:O,shorts:'paper',socks:O,trim:K,boots:K,skin:SKIN,hair:[K,.6],hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:K,...o});
/** Müller: short and squat, a low centre of gravity, huge thighs */
const MB:Build={height:1.76,bulk:1.12,thighs:1.3};
const BB:Build={height:1.8,bulk:1.02,thighs:1.05};
const MULLER:AthleteStyle=GER({number:13,hair:K,build:MB,seed:13});
const BONHOF:AthleteStyle=GER({number:16,hair:[O,.55],build:BB,seed:16});
const KROL:AthleteStyle=NED({number:12,hair:[K,.8],build:{height:1.85,bulk:1},seed:12});
const RIJS:AthleteStyle=NED({number:17,hair:[K,.75],hairStyle:'curly',build:{height:1.83,bulk:1},seed:17});
const KEEPER:AthleteStyle={shirt:Y,shorts:K,socks:[K,.85],boots:K,skin:SKIN,hair:[K,.7],line:K,sleeves:'long',gloves:'paper',shade:[K,.26],number:8,numberInk:K,seed:8};
const REF:AthleteStyle={shirt:[K,.92],shorts:[K,.92],socks:[K,.92],trim:'paper',boots:K,skin:SKIN,hair:[K,.5],hairStyle:'balding',line:K,sleeves:'short',seed:33};
/** duotone kits for the lesson (blue + navy only) */
const MULLER_DUO:AthleteStyle={...MULLER,skin:[[B,.2]],shade:[K,.22]};
const GHOST=(st:AthleteStyle):AthleteStyle=>({...st,shirt:[K,.4],shorts:[K,.25],socks:[K,.4],trim:K,skin:[[B,.16]],hair:[K,.3],shade:[K,.16],shadow:[K,.15],number:null});
const LEVEL:Record<Detail,number>={low:0,mid:1,high:2};
/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, one continuous organic silhouette).
 * prev = the pose one drawn frame earlier (hair / hem secondary motion); smear = motion echo of fast feet; detail / cap = phone heat. */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:AthleteStyle,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean;detail?:'auto'|Detail;cap?:Detail}={}){
 let detail:'auto'|Detail=o.detail??style.detail??'auto';
 if(o.cap){if(detail==='auto'){const h=1.8*kAt(c,[place.x??0,1,place.z??0])*s.unit*s.arrival;detail=h<50?'low':h<170?'mid':'high';}if(LEVEL[detail]>LEVEL[o.cap])detail=o.cap;}
 const st={...style,detail};
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,st,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,st,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 Müller's right boot meets the ball) =================
type MKey=[number,number,number];// τ, x, z
/** position along a keyed path: linear between keys (steady running), eased into the first key and out of the last */
function pathPos(p:MKey[],tau:number){let dist=0;if(tau<=p[0][0])return{x:p[0][1],z:p[0][2],vx:0,vz:0,dist:0};const n=p.length;
 for(let i=0;i+1<n;i++){const a=p[i],b=p[i+1],L=Math.hypot(b[1]-a[1],b[2]-a[2]),dt=b[0]-a[0];if(tau<b[0]){const u=(tau-a[0])/dt,first=i===0,last=i===n-2;
   const ee=first&&last?easeInOutSine(u):first?.5*u*u+.5*u:last?1-.5*(1-u)*(1-u)-.5*(1-u):u,ev=first&&last?Math.PI/2*Math.sin(Math.PI*u):first?u+.5:last?1.5-u:1;
   return{x:lerp(a[1],b[1],ee),z:lerp(a[2],b[2],ee),vx:(b[1]-a[1])/dt*ev,vz:(b[2]-a[2])/dt*ev,dist:dist+L*ee};}dist+=L;}
 const l=p[n-1];return{x:l[1],z:l[2],vx:0,vz:0,dist};}
type St={pose:Pose;place:Place};
/** a running body: stride phase from distance run, speed from velocity, facing the run (or `look` when still) */
function runner(p:MKey[],tau:number,look:V3,idle:Pose=stand()):St{
 const q=pathPos(p,tau),v=Math.hypot(q.vx,q.vz),sp=clamp(v/8),run=runCycle(q.dist/(2.2+2.4*sp),{speed:sp});
 const yaw=v>.6?YAW(q.vx,q.vz):YAW(look[0]-q.x,look[2]-q.z);return{pose:blendPose(idle,run,clamp(v/1.2)),place:{x:q.x,z:q.z,yaw}};}
const mixSt=(A:St,Bq:St,u:number):St=>({pose:blendPose(A.pose,Bq.pose,u),place:{x:lerp(A.place.x??0,Bq.place.x??0,u),z:lerp(A.place.z??0,Bq.place.z??0,u),yaw:lerpAng(A.place.yaw??0,Bq.place.yaw??0,u)}});
/** segments on τ, crossfaded (both evaluated at τ) over ±.1 s at every boundary so no pose pops */
function segAt(segs:[number,(t:number)=>St][],tau:number):St{
 let i=0;while(i+1<segs.length&&tau>=segs[i+1][0])i++;
 const st=segs[i][0];if(i>0&&tau<st+.1)return mixSt(segs[i-1][1](tau),segs[i][1](tau),sm(st-.1,st+.1,tau,easeInOutSine));
 const nx=segs[i+1]?.[0];if(nx!==undefined&&tau>nx-.1)return mixSt(segs[i][1](tau),segs[i+1][1](tau),sm(nx-.1,nx+.1,tau,easeInOutSine));
 return segs[i][1](tau);}
/** the ball's spot against a solved right boot (between ankle and toe, a ball radius ahead of the instep) */
function footBall(pose:Pose,build:Build,place:Place):V3{const sk=solve(pose,build,place),f=dirOf(place.yaw??0);return[(sk.rAn[0]+sk.rToe[0])/2+f[0]*.1,BALL_R,(sk.rAn[2]+sk.rToe[2])/2+f[1]*.1];}
/** where to stand (at this yaw) so that this pose's right boot meets the ball at `target` */
function placeFor(pose:Pose,build:Build,yaw:number,target:[number,number]):Place{const b=footBall(pose,build,{x:0,z:0,yaw});return{x:target[0]-b[0],z:target[1]-b[2],yaw};}

// ---- the key spots (all inferred; see the header) ----
const BP:[number,number]=[-8.1,17.1];// where Bonhof plays the cut-back, near the byline on the right of the box
const RECV:[number,number]=[-11.0,2.35];// where the pass meets Müller's right foot, near the penalty spot
const BSHOT:[number,number]=[-10.45,1.85];// where it has bounced to when he shoots (toward goal, a step to his left)
const NETL:V3=[0,.22,-2.95];// it crosses the line low, inside the left post
const NETB:V3=[1.65,.3,-3.2];// and stops in the back of the net
const Y_REC=YAW(BP[0]-RECV[0],BP[1]-RECV[1]);// facing the pass
const DSHOT=n2(NETL[0]-BSHOT[0],NETL[2]-BSHOT[1]),Y_SHOT=YAW(DSHOT[0],DSHOT[1]);
const T_P=-1.5,T_R=-.62,T_LINE=.6,T_NET=.72;// Bonhof's pass, it reaches Müller, it crosses the line, it hits the net

// ---- Müller: the checking run, the first touch that bounces off, the spin on the spot over the planted left foot, the right-footed shot ----
const TRAP=posed({lHipF:24,lKnee:38,lAnk:-6,rHipF:30,rKnee:32,rHipR:30,rAnk:-8,lean:16,pitch:4,lShA:42,rShA:36,lElb:42,rElb:40,neckP:38});
const PIVOT=posed({lHipF:30,lKnee:42,lAnk:-6,rHipF:-12,rKnee:74,rAnk:30,rHipA:10,lean:18,pitch:5,twist:16,lShA:64,lShF:12,lElb:38,rShA:42,rShF:-22,rElb:48,neckP:36,neckY:-24,bend:-6});
const MKEYS:[number,Pose][]=[[T_R,TRAP],[-.38,PIVOT],[-.13,strike(.4,{foot:'r',power:.7})],[0,strike(.52,{foot:'r',power:.7})],[.22,strike(.7,{foot:'r',power:.7})],[.45,strike(.85,{foot:'r',power:.7})],[.75,strike(1,{foot:'r',power:.7})]];
const mPose=(tau:number)=>keyPoses(clamp(tau,T_R,.75),MKEYS);
const PL_R=placeFor(TRAP,MB,Y_REC,RECV),PL_C=placeFor(strike(.52,{foot:'r',power:.7}),MB,Y_SHOT,BSHOT);
const ANCHOR=solve(mPose(0),MB,PL_C).lAn;// the planted left foot at contact
function mPlace(tau:number):Place{
 const u=sm(-.55,-.12,tau,easeIO),b:Place={x:lerp(PL_R.x??0,PL_C.x??0,sm(-.55,-.2,tau)),z:lerp(PL_R.z??0,PL_C.z??0,sm(-.55,-.2,tau)),yaw:lerpAng(Y_REC,Y_SHOT,u)};
 const w=sm(-.42,-.24,tau)*(1-sm(.28,.5,tau));if(w<=0)return b;
 const sk=solve(mPose(tau),MB,b);return{x:(b.x??0)+(ANCHOR[0]-sk.lAn[0])*w,z:(b.z??0)+(ANCHOR[2]-sk.lAn[2])*w,yaw:b.yaw};}
const MPATH:MKey[]=[[-18,-25,-3],[-9,-18.5,3.2],[-3,-13.2,3.8],[T_R-.3,PL_R.x??0,PL_R.z??0]];
const CELEB=(tau:number)=>celebrate((tau-1.25)*1.25,{kind:'arms'});
const MULLER_SEGS:[number,(t:number)=>St][]=[
 [-99,t=>runner(MPATH,t,[BP[0],0,BP[1]])],
 [T_R-.3,t=>({pose:blendPose(stand(),TRAP,sm(T_R-.3,T_R,t)),place:{...PL_R}})],
 [T_R,t=>({pose:mPose(t),place:mPlace(t)})],
 [.75,t=>({pose:blendPose(strike(1,{foot:'r',power:.7}),{...stand(),neckY:-30*D2R,neckP:-8*D2R},sm(.75,1.1,t)),place:mPlace(.75)})],
 [1.25,t=>({pose:CELEB(t),place:mPlace(.75)})],
];
const mullerAt=(tau:number)=>segAt(MULLER_SEGS,tau);

// ---- Bonhof: down the right, past Haan, the cut-back with his right foot from near the byline, then he celebrates ----
const Y_BP=YAW(RECV[0]-BP[0],RECV[1]-BP[1]);
const BON_C=placeFor(strike(.52,{foot:'r',power:.55}),BB,Y_BP,BP);
const BON_DUR=.9,BON_T0=T_P-STRIKE_CONTACT*BON_DUR;
const BONPATH:MKey[]=[[-20,-47,24.5],[-8.8,-41,23.8],[-7.4,-38.5,23.3],[-4,-21,20.6],[BON_T0-.05,BON_C.x??0,BON_C.z??0]];
const BONHOF_SEGS:[number,(t:number)=>St][]=[
 [-99,t=>runner(BONPATH,t,[RECV[0],0,RECV[1]])],
 [BON_T0,t=>({pose:strike(clamp((t-BON_T0)/BON_DUR),{foot:'r',power:.55}),place:{...BON_C}})],
 [BON_T0+BON_DUR,t=>({pose:blendPose(strike(1,{foot:'r',power:.55}),{...stand(),neckY:-40*D2R},sm(BON_T0+BON_DUR,BON_T0+BON_DUR+.4,t)),place:{...BON_C,yaw:lerpAng(Y_BP,YAW(-BON_C.x!,-3-BON_C.z!),sm(-.4,.4,t))}})],
 [1.3,t=>{const s=t-1.3;return{pose:celebrate(s*1.1,{kind:'run'}),place:{x:(BON_C.x??0)-s*3.2,z:(BON_C.z??0)-s*3.8,yaw:YAW(-3.2,-3.8)}};}],
];
const bonhofAt=(tau:number)=>segAt(BONHOF_SEGS,tau);

// ---- the ball ----
type Carry={p:MKey[];t0:number;t1:number};
const BECK:MKey[]=[[-18,-66,-8],[-13.2,-60,-4.2]];
const OVER:MKey[]=[[-12,-50.5,4],[-8.8,-43.5,9],[-4,-37,8]];
/** the ball at a carrier's feet: ahead along the run, a little tap wobble */
function carried(p:MKey[],tau:number,fallback:[number,number]):V3{const q=pathPos(p,tau),v=Math.hypot(q.vx,q.vz),d=v>.3?[q.vx/v,q.vz/v]:fallback,tap=.4+.28*Math.abs(Math.sin(q.dist*.9));return[q.x+d[0]*tap,BALL_R,q.z+d[1]*tap];}
const passLeg=(a:V3,b:V3,u:number):V3=>{const e=1-Math.pow(1-clamp(u),1.4);return[lerp(a[0],b[0],e),BALL_R,lerp(a[2],b[2],e)];};
const B_BECK=(t:number)=>carried(BECK,t,[1,.4]),B_OVER=(t:number)=>carried(OVER,t,[.8,.6]),B_BON=(t:number)=>carried(BONPATH,t,n2(1,-.2));
const T_BO=-13.2,T_BO_R=-12,T_OB=-8.8,T_OB_R=-7.5;
function ballAt(tau:number):V3{
 if(tau<T_BO)return B_BECK(tau);
 if(tau<T_BO_R)return passLeg(B_BECK(T_BO),B_OVER(T_BO_R),(tau-T_BO)/(T_BO_R-T_BO));
 if(tau<T_OB)return B_OVER(tau);
 if(tau<T_OB_R)return passLeg(B_OVER(T_OB),B_BON(T_OB_R),(tau-T_OB)/(T_OB_R-T_OB));
 if(tau<T_P){const c=B_BON(tau);return mix3(c,[BP[0],BALL_R,BP[1]],sm(T_P-.9,T_P-.05,tau));}
 if(tau<T_R)return passLeg([BP[0],BALL_R,BP[1]],[RECV[0],BALL_R,RECV[1]],(tau-T_P)/(T_R-T_P));
 if(tau<0){const u=clamp((tau-T_R)/(-.06-T_R)),e=1-Math.pow(1-u,2.2);return[lerp(RECV[0],BSHOT[0],e),BALL_R,lerp(RECV[1],BSHOT[1],e)];}
 if(tau<T_LINE){const u=tau/T_LINE,e=u*(1.12-.12*u);return[lerp(BSHOT[0],NETL[0],e),BALL_R+.1*Math.sin(Math.PI*u)+(NETL[1]-BALL_R)*u*.5,lerp(BSHOT[1],NETL[2],e)];}
 if(tau<T_NET){const u=(tau-T_LINE)/(T_NET-T_LINE);return mix3([NETL[0],BALL_R+(NETL[1]-BALL_R)*.5,NETL[2]],NETB,u);}
 const s=tau-T_NET,drop=Math.max(BALL_R,NETB[1]-4.9*s*s);return[NETB[0]-.35*(1-Math.exp(-s*3)),drop,NETB[2]+.1*(1-Math.exp(-s*3))];
}
/** the back net bulges as the ball hits it */
const bulgeAt=(tau:number)=>tau<T_NET-.04?0:Math.exp(-(tau-T_NET)*2.4)*(1+.3*Math.sin((tau-T_NET)*14))*sm(T_NET-.04,T_NET+.04,tau,x=>x);

// ---- the two defenders who close in (printed as Krol, goal-side, and Rijsbergen from the far side; both lunge a moment too late) ----
const KR_OFF=(p:Place):[number,number]=>[(p.x??0)+1.2,(p.z??0)+.45];
const KROL_SEGS:[number,(t:number)=>St][]=[
 [-99,t=>{const m=mullerAt(t).place,[x,z]=KR_OFF(m);return{pose:blendPose(runner(MPATH.map(k=>[k[0],k[1]+1.2,k[2]+.45] as MKey),t,[m.x??0,0,m.z??0]).pose,stand(),.15),place:{x,z,yaw:YAW((m.x??0)-x,(m.z??0)-z)}};}],
 [T_R,t=>{const[x,z]=KR_OFF(PL_R),d=sm(T_R,-.2,t);return{pose:blendPose({...stand(),lean:24*D2R,neckP:-4*D2R},lunge(clamp((t+.28)/.6),{side:'r'}),sm(-.3,-.2,t)),place:{x:x-.35*d,z:z-.1*d,yaw:YAW(-1,.2)}};}],
];
const krolAt=(tau:number)=>segAt(KROL_SEGS,tau);
const RIJ_PATH:MKey[]=[[-12,-15,10],[-3,-9,7.6],[T_P,-7.6,6.2],[-.2,-8.7,4.3]];
const RIJ_SEGS:[number,(t:number)=>St][]=[
 [-99,t=>runner(RIJ_PATH,t,[RECV[0],0,RECV[1]])],
 [-.25,t=>({pose:lunge(clamp((t+.25)/.62),{side:'r'}),place:{x:-8.7,z:4.3,yaw:YAW(RECV[0]+8.7,RECV[1]-4.3)}})],
];
const rijsAt=(tau:number)=>segAt(RIJ_SEGS,tau);

// ---- Jongbloed: covers the near post for the cross, comes back across, his weight goes left (+z), then the late dive right ----
function keeperAt(tau:number):St{
 const b=ballAt(tau),z0=tau<T_P?clamp(b[2]*.1,-1,1.8):lerp(1.8,1.05,sm(T_P,T_R+.2,tau)),lean=sm(-.35,0,tau)*(1-sm(.1,.2,tau));
 const set:St={pose:keeperSet(tau*1.4),place:{x:-1.35,z:z0+.3*lean,yaw:YAW(b[0]+1.35,b[2]-z0)}};
 if(tau<.1)return{pose:blendPose(set.pose,{...keeperSet(0),roll:-9*D2R,lHipA:26*D2R,rKnee:40*D2R},lean),place:set.place};
 const u=clamp((tau-.1)/1.05);return{pose:keeperDive(u,{side:'r',height:.12}),place:{x:-1.35,z:z0+.3,yaw:YAW(BSHOT[0]+1.35,BSHOT[1]-z0)}};}

// ---- everybody else (illustrative: who stood where is not documented) ----
type Actor={style:AthleteStyle;at:(tau:number,ball:V3)=>St};
const mover=(style:AthleteStyle,p:MKey[],idle?:Pose):Actor=>({style,at:(t,b)=>runner(p,t,b,idle)});
const ACTORS:Actor[]=[
 mover(GER({number:5,hair:[K,.55],seed:5}),[[-18,-70,-10],[-13,-64,-7],[-4,-55,-4],[2,-50,-3]]),// Beckenbauer, the build-up
 mover(GER({number:12,hair:[K,.7],hairStyle:'balding',seed:22}),OVER),// Overath
 mover(GER({number:14,hair:[Y,.7],seed:24}),[[-18,-55,-12],[-8,-40,-8],[0,-27,-5],[2,-24,-5]]),// Hoeneß
 mover(GER({number:9,hair:[K,.6],build:{height:1.73},seed:9}),[[-18,-40,14],[-9,-26,11],[-2.5,-11,8.5],[0,-6.5,7],[2,-4,6]]),// Grabowski, far post
 mover(GER({number:17,hair:[K,.7],hairStyle:'long',seed:27}),[[-18,-42,-20],[-9,-30,-17],[-2,-19,-13],[2,-15,-10]]),// Hölzenbein, left side
 mover(NED({number:2,hair:[K,.65],seed:32}),[[-18,-45,21],[-8.8,-38,21.5],[-7.4,-36,21.2],[-4,-19.5,18.5],[-1.6,-10.2,15.8],[1,-8,13.5]]),// Haan, chasing Bonhof
 mover(NED({number:20,hair:[Y,.7],seed:40}),[[-18,-36,12],[-9,-23,9],[-2.5,-9,7],[0,-5,6.2],[2,-3,5.5]]),// Suurbier, on Grabowski
 mover(NED({number:6,hair:[O,.5],seed:36}),[[-18,-45,-2],[-9,-31,1],[-2,-21,2.5],[2,-18,2]]),// Jansen, tracking back
 mover(NED({number:13,hair:[Y,.8],seed:43}),[[-18,-52,6],[-9,-38,4],[-2,-24,2],[2,-20,1]]),// Neeskens
 mover(REF,[[-18,-58,4],[-9,-40,5],[-2,-24,7],[2,-20,7]]),// the referee, Jack Taylor
];
type Item={depth:number;draw:()=>void};
/** everyone and the ball at τ, depth sorted. `hero` draws the defenders with secondary motion (+ smear on Müller's fast feet). */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;prevDt?:number;cap?:boolean;smear?:boolean;others?:boolean}){
 const bl0=ballAt(tau),bp=ballAt(tp),items:Item[]=[],dt=o.prevDt??1/12;
 const put=(style:AthleteStyle,st:St,prev?:St,smear=false,low=false)=>{const g:V3=[st.place.x??0,0,st.place.z??0],d=depthOf(c,g);if(d<1)return;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.2*kk)return;
  items.push({depth:d,draw:()=>drawPlayer(s,st.pose,c,style,st.place,{prev,smear,detail:low?'low':'auto',cap:o.cap?(low?'low':'mid'):undefined})});};
 if(o.others!==false)for(const a of ACTORS)put(a.style,a.at(tp,bp),undefined,false,!o.hero);
 put(KEEPER,keeperAt(tp),keeperAt(tp-dt),false,!o.hero);
 put(BONHOF,bonhofAt(tp),bonhofAt(tp-dt),false,!o.hero);
 put(RIJS,rijsAt(tp),rijsAt(tp-dt));
 put(KROL,krolAt(tp),krolAt(tp-dt));
 put(MULLER,mullerAt(tp),mullerAt(tp-dt),(o.smear??true)&&tp>-.5&&tp<.45);
 items.push({depth:depthOf(c,bl0),draw:()=>{const a=P(c,ballAt(tau-.03)),q=P(c,bl0),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,bl0));ballShadow(s,c,bl0);
  ball(s,q[0],q[1],r,spinAt(tau),{sq:clamp(sp/(r*4),0,.5),dir:Math.atan2(dy,dx)});}});
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
 return{ball:bl0};}
/** ball spin: rolls with its distance travelled */
const spinAt=(tau:number)=>{const a=ballAt(tau-.1),b=ballAt(tau);return tau*1.3+Math.hypot(b[0]-a[0],b[2]-a[2])*20;};

// ================= chapter 1 (LIVE, real time): the high main-stand camera; the build-up, Bonhof down the right, the turn, the shot, the net =================
const BCAM:V3=[-36,15,-50];
const TL=()=>T(0,'shoots')+.12;// τ = 0 lands just after the cue word "shoots"
function ch1Look(tau:number):V3{const b=ballAt(tau),m=mullerAt(tau).place,w=sm(T_P-.8,T_R,tau)*(1-sm(1.2,2.4,tau)*.5);
 return[lerp(b[0],(m.x??0)+2.5,w*.45)+1.5*sm(T_R,T_LINE,tau),3.2,lerp(b[2],(m.z??0)+1.5,w*.45)];}// aimed above the play so the crowd fills the top of the frame
function ch1Cam(t:number){const tau=t-TL(),a=ch1Look(tau),b=ch1Look(tau-.35),c=ch1Look(tau-.7),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const push=1+.07*sm(T(0,'in white'),T(0,'in white')+1.2,t)-.05*sm(T(0,"It's one each"),T(0,"It's one each")+1.2,t)+.08*sm(T(0,'Gerd Müller'),T(0,'Gerd Müller')+1,t)-.1*sm(T(0,'Goal')-.2,T(0,'Goal')+1.2,t);
 const F=key(tau,[[-18,2700],[-12,3000],[-8,3500],[-4,3900],[T_P,4300],[0,4600],[1.2,4600],[2.5,4200]])*push;return cam(BCAM,look,F);}
const ch1:Scene={
 draw(s,t){const tt=twos(t),c=ch1Cam(t),tl=TL(),goalT=T(0,'Goal');frame(s);
  const nl=T(0,'the Netherlands'),wg=T(0,'West Germany'),oe=T(0,"It's one each");
  stadium(s,c,{t,cheer:.2+.5*sm(0,.8,t)*(1-sm(1.5,3,t))+.3*sm(oe,oe+.4,t)*(1-sm(oe+1.4,oe+2.4,t))+1.2*sm(tl-.05,tl+.4,t),flash:.12+.6*sm(T(0,'the World Cup final'),T(0,'the World Cup final')+.3,t)*(1-sm(T(0,'the World Cup final')+1.2,wg,t))+1.3*sm(tl+.4,goalT+.3,t),
   german:sm(wg,wg+.5,t)*(1-.6*sm(nl,nl+1,t))+.6*sm(oe,oe+.4,t)*(1-sm(oe+1.6,oe+2.6,t))+sm(tl+.3,tl+.8,t),dutch:sm(nl,nl+.5,t)*(1-.6*sm(oe+1.6,oe+2.6,t))});
  const tau=t-tl;goal(s,c,bulgeAt(tau),NETB[2],NETB[1]);
  drawWorld(s,c,tau,tt-tl,{ballMin:12,cap:busy(0,t)});},
 aperture(t){const c=ch1Cam(t),p=ballAt(t-TL()),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(12,BALL_R*kAt(c,p))*.95,12);},
 still:13,
};

// ================= chapter 2 (TV slow-motion replay, low and close on the near side) =================
const ch2T=()=>({w:T(1,'Watch it again'),p:T(1,'The pass'),b:T(1,'bounces off Müller'),two:T(1,'two defenders'),cl:T(1,'close in'),nt:T(1,'No time'),sp:T(1,'spins on the spot'),h:T(1,'hits it low'),e:T(1,'early'),co:T(1,'into the corner'),k:T(1,'keeper'),wf:T(1,'wrong-footed'),end:SEC(1)});
/** replay clock: slow through the touch and the spin, the shot on "hits it low", the net on "into the corner" */
const tau2=(t:number)=>{const q=ch2T();return key(t,mono([[0,-2.3],[q.p,T_P-.05],[q.b+.35,T_R+.02],[q.two,-.52],[q.cl+.3,-.44],[q.nt+.3,-.36],[q.sp+.2,-.3],[q.h+.2,-.02],[q.e+.15,.07],[q.co+.5,T_LINE],[q.k+.4,T_NET+.08],[q.wf+.5,1.05],[q.end,1.35]]),x=>x);};
function ch2Cam(t:number){const q=ch2T(),tau=tau2(t),m=mullerAt(tau).place,b=ballAt(tau);
 const toGoal=sm(q.h,q.co+.3,t,easeIO),mz:V3=[m.x??0,.75,m.z??0];
 const focus:V3=mix3(mix3(mz,[b[0],.5,b[2]],.3),[-1.2,.7,-2.2],toGoal*.75);
 const pos:V3=[key(t,mono([[0,-17.5],[q.b,-16.2],[q.sp,-14.8],[q.h,-13.2],[q.co,-5.5],[q.end,-3.8]])),key(t,mono([[0,1.6],[q.sp,1.15],[q.co,1.0],[q.end,1.05]])),key(t,mono([[0,-5.5],[q.b,-5.4],[q.sp,-5.2],[q.h,-5.4],[q.co,-8.2],[q.end,-8.6]]))];
 const F=key(t,mono([[0,1500],[q.b,1900],[q.nt,2050],[q.sp,2000],[q.h,1850],[q.co,1650],[q.end,1600]]));
 return cam(pos,focus,F);}
/** a dashed ground path (one op) */
function groundDash(s:Sheet,c:Camera,pts:V3[],w:number,ink:string,seed:number,o:{cov?:number;dash?:number;progress?:number}={}){
 const{cov=1,dash=.22,progress=1}=o;let q=pts.filter(p=>depthOf(c,p)>NEAR).map(p=>P(c,p));if(progress<1)q=partial(q,progress);if(q.length<2)return;
 let L=0;for(let i=1;i<q.length;i++)L+=Math.hypot(q[i][0]-q[i-1][0],q[i][1]-q[i-1][1]);const k=kAt(c,pts[0]),n=Math.max(1,Math.floor(L/(dash*k*2))),gaps:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;gaps.push([u,u+.45/n]);}
 s.fill(ink,ribbon(q,w,{seed,pressure:.3,taper:.15,wobble:1,gaps}),cov);}
function arrowTip(s:Sheet,ink:string,a:Pt,b:Pt,size:number,cov=1){const ang=Math.atan2(b[1]-a[1],b[0]-a[0]),q:Pt[]=[[size*.4,0],[-size*.7,-size*.6],[-size*.4,0],[-size*.7,size*.6]].map(([x,y])=>[b[0]+x*Math.cos(ang)-y*Math.sin(ang),b[1]+x*Math.sin(ang)+y*Math.cos(ang)] as Pt);s.fill(ink,polyPath(q,true),cov);}
/** a halo round one leg (hip → knee → ankle → toe) printed BEFORE the figure, so only its rim shows round the leg */
function legHalo(s:Sheet,c:Camera,pose:Pose,place:Place,build:Build,side:'l'|'r',ink:string,g:number,cov=.8){
 if(g<=.02)return;const sk=solve(pose,build,place),js=side==='l'?[sk.lHip,sk.lKn,sk.lAn,sk.lToe]:[sk.rHip,sk.rKn,sk.rAn,sk.rToe],k=kAt(c,sk.pelvis);
 s.fill(ink,ribbon(js.map(j=>P(c,j)),(.26+.08*g)*k*g,{taper:.05,pressure:0,wobble:1,seed:side==='l'?71:72}),cov);}
/** a flat ring on the ground (x, z, radius) as projected points */
const groundRing=(c:Camera,x:number,z:number,rx:number,rz=rx,n=24)=>{const o:V3[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;o.push([x+Math.cos(a)*rx,.02,z+Math.sin(a)*rz]);}return o;};
const ringPath=(c:Camera,pts:V3[])=>pts.filter(p=>depthOf(c,p)>NEAR).map(p=>P(c,p));
/** the ground points of a straight run a → b */
const seg=(a:[number,number],b:[number,number],n=12):V3[]=>Array.from({length:n+1},(_,i)=>[lerp(a[0],b[0],i/n),.02,lerp(a[1],b[1],i/n)] as V3);
/** the spin arc round the planted left foot: a left turn from the pass to the shot */
function spinArc(c:Camera,an:V3,g:number,r:number):Pt[]{const pts:V3[]=[],y0=Y_REC,y1=Y_SHOT;for(let i=0;i<=18;i++){const a=lerpAng(y0,y1,(i/18)*g),d=dirOf(a);pts.push([an[0]+d[0]*r,.02,an[2]+d[1]*r]);}return ringPath(c,pts);}
const ch2:Scene={
 draw(s,t){const q=ch2T(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),tp=tau2(tt),prevDt=tp-tau2(tt-1/12);frame(s);
  stadium(s,c,{t,cheer:.15+.9*sm(q.co,q.co+.4,t),flash:.1+.8*sm(q.co,q.co+.4,t),german:sm(q.co,q.co+.6,t)});
  goal(s,c,bulgeAt(tau),NETB[2],NETB[1]);
  // "The pass": Bonhof's cut-back prints as a dashed yellow lane into Müller's feet
  const lane=sm(q.p-.1,q.p+.6,tt,easeOut)*(1-sm(q.sp,q.sp+.6,tt));
  if(lane>.02){const pts=seg(BP,RECV,14);groundDash(s,c,pts,14,Y,31,{progress:lane,cov:.95});if(lane>.95){const pp=ringPath(c,pts);if(pp.length>2)arrowTip(s,Y,pp[pp.length-3],pp[pp.length-1],44,.95);}}
  // "bounces off Müller": a yellow ring where the ball comes off his boot and its little path toward goal
  const bo=sm(q.b-.05,q.b+.4,tt,easeOutBack)*(1-sm(q.nt,q.sp+.4,tt));
  if(bo>.02){s.fill(Y,ribbon(ringPath(c,groundRing(c,RECV[0],RECV[1],.34*bo,.26*bo)),10,{seed:34,close:true,wobble:1}),.95);groundDash(s,c,seg(RECV,BSHOT,6),9,Y,35,{progress:sm(q.b,q.b+.6,tt),dash:.08});}
  // "two defenders" / "close in": blue rings under both, navy arrows as they close on him; "No time": the space round him shrinks (orange)
  const kr=krolAt(tp).place,rj=rijsAt(tp).place,m=mullerAt(tp).place,two=sm(q.two-.1,q.two+.35,tt,easeOutBack)*(1-sm(q.sp+.3,q.h,tt));
  if(two>.02)for(const d of[kr,rj])s.fill(B,ribbon(ringPath(c,groundRing(c,d.x??0,d.z??0,.62*two,.45*two)),9,{seed:40,close:true,wobble:1.4}),.9);
  const clo=sm(q.cl-.1,q.cl+.4,tt,easeOut)*(1-sm(q.sp+.3,q.h,tt));
  if(clo>.02)for(const d of[kr,rj]){const a:[number,number]=[d.x??0,d.z??0],b:[number,number]=[lerp(a[0],m.x??0,.55*clo),lerp(a[1],m.z??0,.55*clo)],pp=ringPath(c,seg(a,b,4));if(pp.length>1){s.fill(K,ribbon(pp,12,{seed:41,taper:.1,wobble:1}),.9);arrowTip(s,K,pp[pp.length-2],pp[pp.length-1],40,.9);}}
  const nt=sm(q.nt-.1,q.nt+.3,tt,easeOut)*(1-sm(q.sp+.2,q.sp+.7,tt));
  if(nt>.02){const r=lerp(2.1,1.05,sm(q.nt,q.sp,tt,easeIO));s.fill(O,ribbon(ringPath(c,groundRing(c,m.x??0,m.z??0,r,r*.9,32)),11,{seed:42,close:true,wobble:1.2}),.9*nt);}
  // "spins on the spot": an orange arc prints round his planted left foot as he turns (arrow first)
  const mu=mullerAt(tp),skNow=solve(mu.pose,MB,mu.place),spin=sm(q.sp-.1,q.sp+.8,tt,easeOut)*(1-sm(q.co,q.co+.6,tt));
  if(spin>.02){const pp=spinArc(c,ANCHOR,spin,.85);if(pp.length>2){s.fill(O,ribbon(pp,14,{seed:36,taper:.2,wobble:1}),.95);arrowTip(s,O,pp[pp.length-2],pp[pp.length-1],44);}
   s.fill(O,ribbon(ringPath(c,groundRing(c,skNow.lAn[0],skNow.lAn[2],.22,.17)),9,{seed:37,close:true,wobble:1}),.9*spin);}
  // "hits it low": the halo round the kicking (right) leg; "into the corner": the shot's dashed line to the corner and a ring there
  legHalo(s,c,mu.pose,mu.place,MB,'r',Y,sm(q.h-.1,q.h+.3,tt,easeOut)*(1-sm(q.co,q.co+.5,tt)));
  const sh=sm(q.co-.2,q.co+.5,tt,easeOut)*(1-sm(q.wf+.3,q.end,tt));
  if(sh>.02){groundDash(s,c,seg(BSHOT,[NETL[0],NETL[2]],16),12,Y,38,{progress:sh,cov:.95});s.fill(Y,ribbon(ringPath(c,groundRing(c,NETL[0]+.3,NETL[2],.4*sh,.35*sh)),10,{seed:39,close:true,wobble:1}),.95);}
  // "wrong-footed": a navy arrow under the keeper toward where his weight went (+z), the ball the other way
  const wf=sm(q.wf-.1,q.wf+.5,tt,easeOut);if(wf>.02){const kp=keeperAt(-.05).place,a:[number,number]=[(kp.x??0)-.3,(kp.z??0)],b:[number,number]=[a[0],a[1]+1.6*wf],pp=ringPath(c,seg(a,b,4));if(pp.length>1){s.fill(K,ribbon(pp,13,{seed:43,taper:.1,wobble:1}),.9);arrowTip(s,K,pp[pp.length-2],pp[pp.length-1],42,.9);}}
  drawWorld(s,c,tau,tp,{ballMin:18,hero:true,prevDt,cap:busy(1,t),smear:true});
  // the "early" strike: a yellow burst at contact
  if(tp>-.03&&tp<.14){const p=P(c,ballAt(Math.max(0,tp)));sparkBurst(s,Y,p[0],p[1],80+70*sm(-.03,.08,tp),{n:8,seed:44,g:1-sm(.08,.14,tp),width:10});}
 },
 aperture(t){const c=ch2Cam(t),p=ballAt(tau2(t)),[x,y]=P(c,p),r=Math.max(18,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:9,
};

// ================= chapter 3 (duotone lesson): in the box, turn quickly and shoot early, before defenders can block it =================
const ch3T=()=>({g:T(2,"Müller's goal"),w:T(2,'won the World Cup'),b:T(2,'In the box'),tq:T(2,'turn quickly'),se:T(2,'shoot early'),bd:T(2,'before defenders'),bl:T(2,'block it'),end:SEC(2)});
/** lesson clock on τ: the pass arrives on "In the box", the spin on "turn quickly", the shot on "shoot early", the lunges on "before defenders" */
const tau3=(t:number)=>{const q=ch3T();return key(t,mono([[0,-1.35],[q.b,-1.05],[q.b+.9,T_R],[q.tq,-.5],[q.tq+.8,-.13],[q.se+.2,0],[q.se+.8,.3],[q.bd+.5,.45],[q.bl+.3,.62],[q.end,1.05]]),x=>x);};
const ch3:Scene={
 draw(s,t){const q=ch3T(),tt=twos(t),tau=tau3(tt),tp=tau,cap=busy(2,t);
  // camera: low front three-quarter from the near side, pushing in for the turn, swinging toward goal with the shot
  const mz=mullerAt(tau3(t)).place,g=sm(q.se,q.bl,t,easeIO);
  const pos:V3=[key(t,mono([[0,-16],[q.b,-15],[q.tq,-13.2],[q.se,-13],[q.bd+.4,-17.5],[q.end,-18.5]])),key(t,mono([[0,1.5],[q.tq,1.2],[q.se,1.3],[q.end,2.1]])),key(t,mono([[0,-5.2],[q.tq,-4.6],[q.se,-5.2],[q.bd+.4,-2.6],[q.end,-1.8]]))];
  const c=cam(pos,mix3([(mz.x??0),.8,(mz.z??0)],[-2.5,.8,-1],g*.42),key(t,mono([[0,1400],[q.b,1500],[q.tq,1750],[q.se,1500],[q.end,1300]])));frame(s);
  // the print: blue sky in bands, a navy floor with a stepped light pool; the box lines print on "In the box"; the goal in paper
  s.field(B,.3,.6);
  const hz=P(c,[c.eye[0]+c.f[0]*1e4,0,c.eye[2]+c.f[2]*1e4])[1],Bn=Math.max(s.W,s.H)*1.6;
  for(let i=0;i<4;i++)s.tone(B,polyPath([[-Bn,hz-120-i*170],[Bn,hz-120-i*170],[Bn,hz-40],[-Bn,hz-40]],true),.18);
  const floor=new Path2D();addPoly(floor,clipPoly(c,[[-60,0,-40],[20,0,-40],[20,0,40],[-60,0,40]]));s.knockout(floor);s.fill(K,floor,.72);
  const pool=(r:number)=>{const pa=new Path2D();addPoly(pa,clipPoly(c,groundRing(c,-10.6,1.9,r,r*.9,40)));return pa;};
  s.knockout(pool(3.4),.55);s.tone(B,pool(3.4),.25);s.tone(B,pool(1.9),.3);
  const box=sm(q.b-.1,q.b+.6,tt,easeOut);if(box>.02){const L=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(L,c,a,b,.16);Ln([0,-20.16],[-16.5*box,-20.16]);Ln([-16.5,-20.16],[-16.5,-20.16+40.32*box]);Ln([0,20.16],[-16.5*box,20.16]);Ln([0,-9],[0,9]);s.knockout(L,.9);}
  goal(s,c,bulgeAt(tau),NETB[2],NETB[1]);
  // "Müller's goal" / "won the World Cup": flashbulbs round the print and stamp rings under him
  const fl=sm(q.g,q.g+.3,tt)*(1-sm(q.w+1,q.b,tt));if(fl>.02){const fp=new Path2D(),r=rng(900+Math.floor(tt*6));for(let i=0;i<9;i++){const x=(r()-.5)*1400,y=hz-80-r()*420,sz=16+r()*20;fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));}s.knockout(fp,fl);}
  const mNow=mullerAt(tp),stamp=sm(q.w,q.w+.5,tt,easeOutBack)*(1-sm(q.b-.2,q.b+.3,tt));
  if(stamp>.02)for(let i=0;i<3;i++)s.fill(Y,ribbon(ringPath(c,groundRing(c,mNow.place.x??0,mNow.place.z??0,(.9+i*.45)*stamp,(.8+i*.4)*stamp,32)),12-i*3,{seed:50+i,close:true,wobble:1.2}),.95);
  // "turn quickly": the spin arc round the planted foot (paper on navy)
  const tq=sm(q.tq-.05,q.tq+.8,tt,easeOut)*(1-sm(q.bd,q.bl,tt));
  if(tq>.02){const pp=spinArc(c,ANCHOR,tq,.95);if(pp.length>2){s.knockout(ribbon(pp,16,{seed:57,taper:.2,wobble:1}),.95);arrowTip(s,Y,pp[pp.length-2],pp[pp.length-1],50);}}
  // "shoot early": the shot line prints to the corner, yellow
  const se=sm(q.se-.05,q.se+.6,tt,easeOut)*(1-sm(q.bl+.4,q.end,tt));
  if(se>.02){const pts=seg(BSHOT,[NETL[0],NETL[2]],16);groundDash(s,c,pts,16,Y,52,{progress:se,cov:.95});if(se>.95){const pp=ringPath(c,pts);if(pp.length>2)arrowTip(s,Y,pp[pp.length-3],pp[pp.length-1],52,.95);}}
  // "before defenders" / "block it": the two ghost defenders lunge — too late; a navy cross-out marks where the block arrives
  const late=sm(q.bl-.05,q.bl+.4,tt,easeOutBack);
  if(late>.02)for(const d of[krolAt(.35).place,rijsAt(.35).place]){const p=P(c,[d.x??0,.02,d.z??0]),r=38*late;s.fill(K,ribbon([[p[0]-r,p[1]-r*.6],[p[0]+r,p[1]+r*.6]],12,{seed:53}),.95);s.fill(K,ribbon([[p[0]+r,p[1]-r*.6],[p[0]-r,p[1]+r*.6]],12,{seed:54}),.95);}
  // figures, depth sorted: the ghost keeper and defenders, Müller (the kicking-leg halo first), the ball
  const items:Item[]=[],dt=1/12,ghostPut=(st:AthleteStyle,f:(t:number)=>St)=>{const a=f(tp),b=f(tp-dt);items.push({depth:depthOf(c,[a.place.x??0,0,a.place.z??0]),draw:()=>drawPlayer(s,a.pose,c,GHOST(st),a.place,{prev:b,cap:cap?'mid':undefined})});};
  ghostPut(KROL,krolAt);ghostPut(RIJS,rijsAt);ghostPut(KEEPER,keeperAt);
  const mp=mullerAt(tp-dt);
  items.push({depth:depthOf(c,[mNow.place.x??0,0,mNow.place.z??0]),draw:()=>{legHalo(s,c,mNow.pose,mNow.place,MB,'r',Y,sm(q.se-.1,q.se+.3,tt,easeOut)*(1-sm(q.bd,q.bd+.5,tt)),.9);
   drawPlayer(s,mNow.pose,c,MULLER_DUO,mNow.place,{prev:mp,smear:tp>-.5&&tp<.4,cap:cap?'mid':undefined});}});
  const bl=ballAt(tau);items.push({depth:depthOf(c,bl)-.05,draw:()=>{const p=P(c,bl),r=Math.max(20,BALL_R*kAt(c,bl));ballShadow(s,c,bl,.4);ball(s,p[0],p[1],r,spinAt(tau));}});
  items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
  // "early": speed lines trail the shot
  if(tp>.02&&tp<T_LINE+.1){const a=P(c,ballAt(tp-.12)),b=P(c,ballAt(tp));speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:5,seed:58,len:220,width:9,cov:.8});}
  if(tp>T_NET-.02&&tp<T_NET+.3){const p=P(c,NETB);sparkBurst(s,Y,p[0],p[1],140*easeOut(sm(T_NET,T_NET+.2,tp)),{n:9,seed:59,g:1-sm(T_NET+.15,T_NET+.3,tp),width:12});}
 },
 still:9,
};

const story:RisoStory={
 id:'muller-final-1974',format:'11v11',title:'Müller wins the World Cup, 1974',
 theme:'In the box, turn quickly and shoot early, before defenders can block it.',
 ageNote:'World Cup final, Netherlands 1–2 West Germany, Olympiastadion, Munich, 7 July 1974. Gerd Müller scored the winner just before half-time.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',blue:'#0078bf',navy:'#22366b'},order:['yellow','orange','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3]);},
 /** Touch: a quick spin arc round the tap and the ball shooting away low. Reduced motion: the arc and the ball, still. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.5)),r=44,a0=hash(seed,2)*TAU,arc:Pt[]=[];for(let i=0;i<=16;i++){const a=a0+i/16*Math.PI*.6*u;arc.push([x+Math.cos(a)*r*2,y+Math.sin(a)*r*1]);}
  s.fill(O,ribbon(arc,12,{seed,taper:.2,wobble:1}),.95);if(arc.length>1)arrowTip(s,O,arc[arc.length-2],arc[arc.length-1],34);
  s.fill(K,polyPath(blob(x,y+r*.9,r*1.1,r*.25,seed+1,{n:16}),true),.3);
  const e:Pt=[x+Math.cos(a0+Math.PI*.6)*r*5,y+r*.4];ball(s,lerp(x,e[0],u*.6),lerp(y,e[1],u*.6),r,age*9+hash(seed,3)*TAU,{sq:age>0?.14*Math.max(0,1-age*4):0});
  if(age>0&&age<.5){speedLines(s,K,lerp(x,e[0],u*.6),lerp(y,e[1],u*.6),Math.atan2(e[1]-y,e[0]-x),{n:4,seed,len:140,width:8,cov:.8*(1-clamp(age/.5))});sparkBurst(s,Y,x,y,110*easeOutBack(clamp(age/.2)),{n:8,seed,g:1-clamp(age/.5),width:10});}
 },
};
export default story;
