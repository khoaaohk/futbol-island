/** Iconic play film (signature): Sepp Maier, "the Cat from Anzing": the cat-like reflex save. World Cup final, Netherlands 1–2 West
 * Germany, Olympiastadion, Munich, 7 July 1974, the second half (West Germany lead 2–1). A RisoStory (chapters mode) played by the card
 * window and StoryFilmPlayer. Narration text: public/plays/narration/maier-signature/script.json. The lead voices it later with local Kokoro;
 * until then every chapter runs on provisional cue times (≈2.6 words/s, see prov()). EVERY action time is read from cue onsets and chapter
 * seconds, so once timing.json exists `withTiming` re-times the whole film through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/maier-signature/timing.json exists, replace the `VOICE` constant below with
 *   import timingJson from '../../../public/plays/narration/maier-signature/timing.json';  const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
 *
 * WHY THIS MOMENT (the signature, lib/town/iconicPlays.json: "the cat-like reflex save"; lesson "Stay low and light on your feet so you
 *  can react like a cat"): Maier's nickname was "die Katze von Anzing", and his best-documented stand is the second half of the 1974 final
 *  in his home city, when the Dutch pressed for an equaliser and chance after chance, among them Johnny Rep's, was stopped by Maier;
 *  TV commentator Rudi Michel shouted "Maier! Immer wieder Maier!" (Maier! Again and again, Maier!). NO written source found here
 *  describes ONE of those saves shot by shot (minute, spot, corner), so the film recreates ONE representative Rep chance saved by a
 *  reflex dive; the narration names only what the sources say (the Dutch attack again and again, Rep shoots, Maier keeps it out, the
 *  commentator's cry, West Germany hold on) and never a minute, a corner or a spot.
 *
 * SOURCES (read Sept 2026 with curl, cached in scratchpad/films/src-cache; the footage itself was not watched):
 *  - Wikipedia (de), "Sepp Maier" (raw): nickname "Die Katze von Anzing"; in the final "vor allem in der zweiten Halbzeit drehten die
 *    Niederländer auf. 'Maier! Immer wieder Maier', schrie der TV-Kommentator Rudi Michel, nachdem Maier mehrmals weltklasse pariert hatte"
 *    https://de.wikipedia.org/wiki/Sepp_Maier
 *  - Wikipedia (de), "Fußball-Weltmeisterschaft 1974", section Finale: after half-time the Netherlands "starteten einen Sturmlauf ...
 *    scheiterten aber mit zahlreichen Chancen, unter anderem von Johnny Rep und van Hanegem, am deutschen Torwart Sepp Maier"; Vogts marked
 *    Cruyff ever closer; kits. https://de.wikipedia.org/wiki/Fu%C3%9Fball-Weltmeisterschaft_1974
 *  - Wikipedia, "1974 FIFA World Cup final" (raw): date, venue, 16:00, 78,200, lineups and shirt numbers, the 46' substitution
 *    (Rensenbrink off, René van de Kerkhof on). https://en.wikipedia.org/wiki/1974_FIFA_World_Cup_final
 *  - Wikipedia, "Sepp Maier" (en): Bayern one-club man, 1974 World Cup winner in his home city; famous for overlong shorts and outsize gloves.
 *  - Wikipedia, "Johnny Rep" (en): "a right-footed striker"; (de) "Johnny Rep", "Johan Neeskens" (en, de): no save described.
 *  - Wikimedia Commons search (Nationaal Archief photos of the final): captions only, no save described.
 *  - read-only: lib/plays/riso/muller-final-1974.ts (same match: stadium, kits, ball; its stadium/goal/ball code is reused here verbatim).
 * CONFIRMED by those pages: 7 July 1974, Olympiastadion Munich, 78,200, referee Jack Taylor; 2–1 at half-time and full-time; the Dutch
 *  dominated the second half and Maier saved repeatedly, from Rep among others; Rudi Michel's "Maier! Immer wieder Maier!"; the nickname;
 *  Rep right-footed, right wing, number 16; Maier 1; Cruyff 14, Neeskens 13, van Hanegem 3, R. van de Kerkhof 10 (on at 46'); Beckenbauer 5,
 *  Vogts 2, Schwarzenbeck 4, Breitner 3, Bonhof 16, Overath 12, Hoeneß 14. West Germany: white shirts, black collar/cuffs, BLACK shorts,
 *  white socks; Netherlands: orange shirts, orange socks (shorts: sources disagree, printed white as in the Müller film).
 * INFERRED / ILLUSTRATIVE: which of Maier's saves this is and everything about its geometry (the build-up van Hanegem → Cruyff → Rep, Rep's
 *  first-time right-footed shot from the right of the box, the aim just inside Maier's right-hand post at mid height, the dive to his right,
 *  the parry wide for a corner, Rep's hands-on-head), all positions and runs in metres, who marked whom apart from Vogts on Cruyff; that the
 *  Germans defended the x = 0 end in the second half (the Müller film has them attack it in the first half, so the ends swap consistently);
 *  Maier's kit that day (printed as a black long-sleeved jersey, black shorts, dark socks and pale gloves: NOT narrated), his and Rep's hair
 *  (Rep blond and curly), the camera positions, lenses and replay speeds, the weather, the stadium's look, crowd colours and flags.
 *
 * STRUCTURE (the approved standard: a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): the play is ONE
 * simulation on a real clock τ (seconds; τ = 0 the moment Rep's right boot meets the ball):
 *  ch1 = LIVE, the high main-stand camera in real time (the Dutch build-up, Cruyff to Rep, the shot, the dive, the parry);
 *  ch2 = the TV slow-motion REPLAY from a low camera in front of the goal (Maier low on his toes, the strike, the push-off, the flight);
 *  ch3 = a second replay angle, high behind the goal, at half speed, then real time as Maier bounces back up (the commentator's cry);
 *  ch4 = the lesson, a duotone print: stay low and light on your feet so you can react like a cat.
 * Seams are forward passages into the ball. The ball meets the solved boot (placeFor() puts Rep so his right foot lands on it) and the
 * solved glove (the save point is Maier's reaching hand at full stretch). Figures: lib/plays/riso/athlete.ts through ONE adapter,
 * drawPlayer(). World: right-handed metres like athlete.ts: West Germany's goal line x = 0 (this half), the pitch runs to x = −105, the
 * Dutch attack +x, their right flank is +z (the far touchline); the TV gantry is on the main stand (−z side). Maier faces −x, so his
 * right hand is on the −z side.
 * Inks: yellow (skin, grass with blue, flags), orange (Netherlands, running track), blue (sky, grass, tent roof), navy (key line, the
 * German shorts, Maier). Scenes read only their local t; drawn objects pose on twos, cameras on ones; all randomness is seeded.
 * Framing: the full sheet (card window 1.45:1 down to square), never sheet.safe.
 * Phone heat: ≈4 plates, the bowl crowd batched per ink; small figures print at 'low' detail in the wide shot and every figure is capped
 * during passages (two scenes print at once). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,blob,ribbon,polyPath,smoothPts,partial,easeOut,easeIO,easeOutBack,easeInOutSine,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,posed,keyPoses,blendPose,runCycle,stand,lunge,keeperSet,keeperDive,strike,STRIKE_CONTACT,
 type Pose,type AthleteStyle,type Camera,type Place,type Build,type V3,type Detail} from './athlete';

const O='orange',Y='yellow',B='blue',K='navy';
const D2R=Math.PI/180;
/** Frame the FULL sheet: world (dx,dy) lands on the sheet centre at `zoom`, ignoring safe/fit (the card window is small). */
function frame(s:Sheet,zoom=1,dx=0,dy=0){const S=zoom*s.arrival;s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,zoom/s.fit,0);}

// ================= narration (script.json mirrors it) =================
/** Provisional cue onsets: ≈2.6 words/s plus sentence pauses; replaced by measured Kokoro onsets once timing.json exists. */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/2.6+(/[.!?…"”]$/.test(w)?.4:/[,;:]$/.test(w)?.18:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`maier film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
/** VOICE: null until the lead records the narration with Kokoro; then the timing.json import goes here (see the header). */
import timingJson from '../../../public/plays/narration/maier-signature/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Live','Munich, 1974, the World Cup final. West Germany lead the Netherlands two-one. After half-time, the Dutch attack again and again. Johnny Rep shoots... Sepp Maier springs across and pushes it away!',
  ['Munich','the World Cup final','West Germany','the Netherlands','After half-time','attack again and again','Johnny Rep','shoots','Sepp Maier','springs across','pushes it away']),
 prov('The replay','Watch again, slowly. Maier waits low, on his toes. Rep strikes it. Maier pushes off, flies sideways and turns it away!',
  ['Watch again','Maier waits low','on his toes','Rep strikes it','pushes off','flies sideways','turns it away']),
 prov('Again and again','The TV commentator shouted, “Maier! Again and again, Maier!” West Germany held on to win.',
  ['The TV commentator','Maier','Again and again','West Germany held on']),
 prov('Your turn','They called him the Cat. Your turn: stay low and light on your feet, so you can react like a cat!',
  ['They called him the Cat','Your turn','stay low','light on your feet','react like a cat']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`maier film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
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
 // corner flags at the goal line (West Germany defend this end after half-time)
 for(const z of[-34,34]){const b:V3=[0,0,z],top:V3=[0,1.6,z];if(depthOf(c,b)>2){const pb=P(c,b),pt=P(c,top),k=kAt(c,b);if(Math.abs(pb[0])>Bnd)continue;s.fill(K,ribbon([pb,pt],Math.max(2,.05*k),{taper:0,wobble:0}),.95);const fl=polyPath([pt,[pt[0]-.5*k,pt[1]+.15*k+Math.sin(tt*6+z)*.05*k],[pt[0],pt[1]+.35*k]],true);s.knockout(fl);s.fill(O,fl,.95);}}
}
/** West Germany's goal at x = 0 in the second half (Maier's goal): square posts, a box net held by rear stanchions; `bulge` pushes the back net out round (bz, by) */
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
/** the Netherlands: orange shirts with black trim, white shorts (see the Müller film's SOURCES DISAGREE), orange socks */
const NED=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:O,shorts:'paper',socks:O,trim:K,boots:K,skin:SKIN,hair:[K,.6],hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:K,...o});
/** Maier: number 1; the jersey colour is inferred (a black long-sleeved top, black shorts, pale gloves) and never narrated */
const MB:Build={height:1.83,bulk:1.02};
const MAIER:AthleteStyle={shirt:[K,.86],shorts:K,socks:[K,.7],trim:K,boots:K,skin:SKIN,hair:[K,.85],hairStyle:'short',line:K,sleeves:'long',gloves:'paper',shade:[K,.2],number:1,numberInk:'paper',build:MB,seed:1};
/** Rep: right-footed, number 16 (blond curly hair inferred) */
const RB:Build={height:1.76,bulk:.96};
const REP:AthleteStyle=NED({number:16,hair:[Y,.8],hairStyle:'curly',build:RB,seed:16});
const CRUYFF:AthleteStyle=NED({number:14,hair:[K,.7],hairStyle:'long',build:{height:1.78,bulk:.9},seed:14});
const BREITNER:AthleteStyle=GER({number:3,hair:[K,.85],hairStyle:'curly',seed:3});
const REF:AthleteStyle={shirt:[K,.92],shorts:[K,.92],socks:[K,.92],trim:'paper',boots:K,skin:SKIN,hair:[K,.5],hairStyle:'balding',line:K,sleeves:'short',seed:33};
/** duotone Maier for the lesson (blue + navy, pale gloves) */
const MAIER_DUO:AthleteStyle={...MAIER,skin:[[B,.14]],shade:[K,.16],hair:[K,.9]};
const LEVEL:Record<Detail,number>={low:0,mid:1,high:2};
/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, one continuous organic silhouette).
 * prev = the pose one drawn frame earlier (hair / hem secondary motion); smear = motion echo of fast limbs; detail / cap = phone heat. */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:AthleteStyle,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean;detail?:'auto'|Detail;cap?:Detail}={}){
 let detail:'auto'|Detail=o.detail??style.detail??'auto';
 if(o.cap){if(detail==='auto'){const h=1.8*kAt(c,[place.x??0,1,place.z??0])*s.unit*s.arrival;detail=h<50?'low':h<170?'mid':'high';}if(LEVEL[detail]>LEVEL[o.cap])detail=o.cap;}
 const st={...style,detail};
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,st,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,st,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 Rep's right boot meets the ball) =================
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

// ---- the build-up (illustrative): van Hanegem carries it, finds Cruyff (Vogts on him), Cruyff slips it right for Rep's run ----
const VPATH:MKey[]=[[-14,-62,7],[-4.6,-44,1.5],[-3,-41,1.5],[2,-33,2]];// van Hanegem
const CPATH:MKey[]=[[-14,-44,-9],[-3.9,-38,-4.5],[-1.05,-25,-2.2],[2,-19,-1]];// Cruyff
const RS:[number,number]=[-13.2,6.0];// where Rep's right boot meets the ball (the right of the box, first time)
const T_V=-4.6,T_VR=-3.9,T_C=-1.05;// van Hanegem's pass, it reaches Cruyff, Cruyff's pass to Rep (it arrives at τ = 0)
function carried(p:MKey[],tau:number,fallback:[number,number]):V3{const q=pathPos(p,tau),v=Math.hypot(q.vx,q.vz),d=v>.3?[q.vx/v,q.vz/v]:fallback,tap=.4+.28*Math.abs(Math.sin(q.dist*.9));return[q.x+d[0]*tap,BALL_R,q.z+d[1]*tap];}
const passLeg=(a:V3,b:V3,u:number):V3=>{const e=1-Math.pow(1-clamp(u),1.4);return[lerp(a[0],b[0],e),BALL_R,lerp(a[2],b[2],e)];};
const B_V=(t:number)=>carried(VPATH,t,[1,-.3]),B_C=(t:number)=>carried(CPATH,t,[1,.3]);
/** the ball before the shot (never depends on the save, so the keeper can read it) */
function preBall(tau:number):V3{
 if(tau<T_V)return B_V(tau);
 if(tau<T_VR)return passLeg(B_V(T_V),B_C(T_VR),(tau-T_V)/(T_VR-T_V));
 if(tau<T_C)return B_C(tau);
 return passLeg(B_C(T_C),[RS[0],BALL_R,RS[1]],(Math.min(tau,0)-T_C)/(0-T_C));}

// ---- Maier: set just off his line, shuffling with the ball; the reflex dive to his RIGHT (−z); full stretch as the glove meets it ----
const MX=-1.25,YAW_M=Math.PI;// facing up the pitch (−x): his right hand is on the −z side
const zPre=(tau:number)=>clamp(preBall(Math.min(tau-.3,-.01))[2]*.12,-.6,.9);
const T_S=.56,DD=.82,T_D0=T_S-.55*DD;// the glove meets the ball at T_S; the dive starts .1 s after the strike (the reflex)
const Z0=zPre(T_D0);
const DIVE=(u:number)=>keeperDive(clamp(u),{side:'r',height:.36});
/** the leading glove of the dive (the one furthest to his right at full stretch), fixed so its path never jumps between hands */
const LEAD:'l'|'r'=(()=>{const sk=solve(keeperDive(.55,{side:'r',height:.36}),MB,{x:0,z:0,yaw:Math.PI});return sk.lHa[2]<sk.rHa[2]?'l':'r';})();
const leadHand=(pose:Pose,pl:Place)=>{const sk=solve(pose,MB,pl);return LEAD==='l'?sk.lHa:sk.rHa;};
const SAVE_Z=-2.2;// where the glove meets the ball (inferred: just inside his right-hand post at mid height)
const EXTRA=SAVE_Z-leadHand(DIVE(.55),{x:MX,z:Z0,yaw:YAW_M})[2];// extra lateral travel from the push-off
const divePlace=(u:number):Place=>({x:MX,z:Z0+EXTRA*sm(.12,.55,u,easeOut),yaw:YAW_M});
const HAND=leadHand(DIVE(.55),divePlace(.55));
const SAVE:V3=[HAND[0]-.06,Math.max(.3,HAND[1]),HAND[2]-.08];
const DSHOT=n2(SAVE[0]-RS[0],SAVE[2]-RS[1]),Y_SHOT=YAW(DSHOT[0],DSHOT[1]);
/** where the shot would have crossed the line (it must be inside the post: checked by the test) */
const LINE_Z=RS[1]+(SAVE[2]-RS[1])*(0-RS[0])/(SAVE[0]-RS[0]);
const UP=(tau:number)=>sm(1.35,2.1,tau,easeInOutSine);
function maierAt(tau:number):St{
 if(tau<T_D0){const z=zPre(tau),b=preBall(Math.min(tau,-.01));return{pose:keeperSet(tau*1.5),place:{x:MX,z,yaw:lerpAng(YAW_M,YAW(b[0]-MX,b[2]-z),.35)}};}
 const u=(tau-T_D0)/DD;let pose=DIVE(u),place=divePlace(u);
 // the wrist firms up through the touch, then the push away
 const f=sm(T_S-.04,T_S+.04,tau)*(1-sm(T_S+.12,T_S+.3,tau));if(f>0)pose={...pose,lShA:pose.lShA+.12*f,rShA:pose.rShA+.12*f};
 const up=UP(tau);if(up>0){pose=blendPose(pose,keeperSet(tau*1.5),up);const dz=DIVE(1).dz,back=sm(2.1,3.4,tau,easeInOutSine);place={...place,z:lerp((place.z??0)-dz*up,.2,back)};}
 return{pose,place};}

// ---- Rep: the run from the right, the first-time right-footed strike, then hands on head ----
const REP_DUR=.9,REP_T0=-STRIKE_CONTACT*REP_DUR;
const PL_REP=placeFor(strike(STRIKE_CONTACT,{foot:'r'}),RB,Y_SHOT,RS);
const RPATH:MKey[]=[[-14,-44,21],[-4,-27,14.5],[-1.2,-18.2,9.9],[REP_T0-.05,PL_REP.x??0,PL_REP.z??0]];
const HANDS_HEAD=posed({lHipF:8,rHipF:4,lKnee:12,rKnee:10,lean:-4,lShF:150,rShF:150,lShA:48,rShA:48,lElb:128,rElb:128,lShR:20,rShR:20,neckP:-14});
const REP_SEGS:[number,(t:number)=>St][]=[
 [-99,t=>runner(RPATH,t,[RS[0],0,RS[1]])],
 [REP_T0,t=>({pose:strike(clamp((t-REP_T0)/REP_DUR),{foot:'r'}),place:{...PL_REP}})],
 [REP_T0+REP_DUR,t=>({pose:blendPose(strike(1,{foot:'r'}),HANDS_HEAD,sm(REP_T0+REP_DUR,1.25,t)),place:{...PL_REP,yaw:lerpAng(Y_SHOT,YAW(1,-.2),sm(.6,1.3,t))}})],
];
const repAt=(tau:number)=>segAt(REP_SEGS,tau);
// ---- Breitner, chasing Rep from the inside, stretches a moment too late ----
const BRPATH:MKey[]=[[-14,-36,17],[-4,-23,12],[-1.2,-16.3,8.6],[-.25,-14.6,7.4]];
const BR_SEGS:[number,(t:number)=>St][]=[
 [-99,t=>runner(BRPATH,t,[RS[0],0,RS[1]])],
 [-.3,t=>({pose:lunge(clamp((t+.3)/.7),{side:'l'}),place:{x:-14.6,z:7.4,yaw:YAW(RS[0]+14.6,RS[1]-7.4)}})],
 [1.2,t=>({pose:blendPose(lunge(1,{side:'l'}),stand(),sm(1.2,1.6,t)),place:{x:-14.6,z:7.4,yaw:YAW(1,-.6)}})],
];
const breitnerAt=(tau:number)=>segAt(BR_SEGS,tau);

// ---- the ball: the build-up, the pass, the shot, the glove, wide of the post for a corner ----
const OUT1:V3=[1.3,SAVE[1]+.75,SAVE[2]-3.3],T_O=T_S+.38;
function ballAt(tau:number):V3{
 if(tau<0)return preBall(tau);
 if(tau<T_S){const u=tau/T_S;return[lerp(RS[0],SAVE[0],u),lerp(BALL_R,SAVE[1],u)+.25*Math.sin(Math.PI*u),lerp(RS[1],SAVE[2],u)];}
 if(tau<T_O){const u=(tau-T_S)/(T_O-T_S),e=u*(1.2-.2*u);return[lerp(SAVE[0],OUT1[0],e),SAVE[1]+(OUT1[1]-SAVE[1])*Math.sin(u*Math.PI/2),lerp(SAVE[2],OUT1[2],e)];}
 const s=tau-T_O,u=clamp(s/1.6),h=Math.max(0,OUT1[1]-BALL_R),b=BALL_R+Math.abs(Math.cos(Math.min(s*2.6,Math.PI*2.5)))*h*Math.exp(-s*1.6)*(s<.6?1:1)*(1-u*.5);
 return[OUT1[0]+3.4*(1-Math.exp(-s*1.3)),s<.6?lerp(OUT1[1],BALL_R,s/.6*(s/.6))+0*b:BALL_R+.35*Math.abs(Math.sin((s-.6)*5))*Math.exp(-(s-.6)*3),OUT1[2]-3.6*(1-Math.exp(-s*1.3))];}
/** ball spin: rolls with its distance travelled */
const spinAt=(tau:number)=>{const a=ballAt(tau-.1),b=ballAt(tau);return tau*1.3+Math.hypot(b[0]-a[0],b[2]-a[2])*20;};

// ---- everybody else (illustrative: who stood where is not documented, apart from Vogts marking Cruyff) ----
type Actor={style:AthleteStyle;at:(tau:number,ball:V3)=>St};
const mover=(style:AthleteStyle,p:MKey[],idle?:Pose):Actor=>({style,at:(t,b)=>runner(p,t,b,idle)});
const ACTORS:Actor[]=[
 mover(NED({number:3,hair:[K,.6],build:{height:1.84,bulk:1.05},seed:3}),VPATH),// van Hanegem
 mover(CRUYFF,CPATH),
 mover(GER({number:2,hair:[Y,.6],build:{height:1.68},seed:2}),CPATH.map(k=>[k[0],k[1]+1.3,k[2]+.9] as MKey)),// Vogts, on Cruyff
 mover(NED({number:13,hair:[Y,.8],seed:43}),[[-14,-40,-9],[-4,-24,-5],[0,-10.5,-1.6],[2,-8,-1]]),// Neeskens, into the box
 mover(GER({number:4,hair:[K,.7],seed:4}),[[-14,-30,-7],[-4,-18,-4],[0,-9,-2.2],[2,-7.5,-1.6]]),// Schwarzenbeck, on Neeskens
 mover(GER({number:5,hair:[K,.55],seed:5}),[[-14,-24,2],[-4,-14,1.8],[0,-7.6,2.6],[2,-6.6,1.4]]),// Beckenbauer, covering
 mover(NED({number:10,hair:[K,.7],seed:10}),[[-14,-42,-19],[-4,-26,-15],[0,-16,-11],[2,-14,-10]]),// R. van de Kerkhof
 mover(GER({number:16,hair:[O,.55],seed:16}),[[-14,-42,7],[-4,-29,4.5],[0,-19,3.4],[2,-16,3]]),// Bonhof
 mover(GER({number:12,hair:[K,.7],hairStyle:'balding',seed:22}),[[-14,-50,-11],[-4,-35,-8],[0,-27,-6],[2,-25,-5]]),// Overath
 mover(GER({number:14,hair:[Y,.7],seed:24}),[[-14,-56,13],[-4,-40,10],[0,-30,8],[2,-28,7]]),// Hoeneß
 mover(NED({number:6,hair:[O,.5],seed:36}),[[-14,-66,-4],[-4,-50,-3],[0,-42,-2],[2,-40,-2]]),// Jansen
 mover(REF,[[-14,-56,-13],[-4,-37,-10],[0,-27,-9],[2,-25,-8]]),// the referee, Jack Taylor
];
type Item={depth:number;draw:()=>void};
/** everyone and the ball at τ, depth sorted. `hero` draws the heroes with secondary motion; `smear` echoes the dive and the strike. */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;prevDt?:number;cap?:boolean;smear?:boolean;others?:boolean}){
 const bl0=ballAt(tau),bp=ballAt(tp),items:Item[]=[],dt=o.prevDt??1/12;
 const put=(style:AthleteStyle,st:St,prev?:St,smear=false,low=false)=>{const g:V3=[st.place.x??0,0,st.place.z??0],d=depthOf(c,g);if(d<1)return;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*2.5||y<-s.H*.6||y>s.H*.6+2.2*kk)return;
  items.push({depth:d,draw:()=>drawPlayer(s,st.pose,c,style,st.place,{prev,smear,detail:low?'low':'auto',cap:o.cap?(low?'low':'mid'):undefined})});};
 if(o.others!==false)for(const a of ACTORS)put(a.style,a.at(tp,bp),undefined,false,!o.hero);
 put(BREITNER,breitnerAt(tp),breitnerAt(tp-dt),false,!o.hero);
 put(REP,repAt(tp),repAt(tp-dt),(o.smear??true)&&tp>-.3&&tp<.35,!o.hero&&false);
 put(MAIER,maierAt(tp),maierAt(tp-dt),(o.smear??true)&&tp>T_D0+.08&&tp<T_S+.25);
 items.push({depth:depthOf(c,bl0),draw:()=>{const a=P(c,ballAt(tau-.03)),q=P(c,bl0),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,bl0));ballShadow(s,c,bl0);
  ball(s,q[0],q[1],r,spinAt(tau),{sq:clamp(sp/(r*4),0,.5),dir:Math.atan2(dy,dx)});}});
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
 return{ball:bl0};}

// ---- small print marks (replay telestration and the lesson) ----
function arrowTip(s:Sheet,ink:string,a:Pt,b:Pt,size:number,cov=1){const ang=Math.atan2(b[1]-a[1],b[0]-a[0]),q:Pt[]=[[size*.4,0],[-size*.7,-size*.6],[-size*.4,0],[-size*.7,size*.6]].map(([x,y])=>[b[0]+x*Math.cos(ang)-y*Math.sin(ang),b[1]+x*Math.sin(ang)+y*Math.cos(ang)] as Pt);s.fill(ink,polyPath(q,true),cov);}
const groundRing=(x:number,z:number,rx:number,rz=rx,n=24)=>{const o:V3[]=[];for(let i=0;i<n;i++){const a=i/n*TAU;o.push([x+Math.cos(a)*rx,.02,z+Math.sin(a)*rz]);}return o;};
const ringPath=(c:Camera,pts:V3[])=>pts.filter(p=>depthOf(c,p)>NEAR).map(p=>P(c,p));
const seg=(a:[number,number],b:[number,number],n=12):V3[]=>Array.from({length:n+1},(_,i)=>[lerp(a[0],b[0],i/n),.02,lerp(a[1],b[1],i/n)] as V3);
/** a dashed ground path (one op) */
function groundDash(s:Sheet,c:Camera,pts:V3[],w:number,ink:string,seed:number,o:{cov?:number;dash?:number;progress?:number}={}){
 const{cov=1,dash=.22,progress=1}=o;let q=pts.filter(p=>depthOf(c,p)>NEAR).map(p=>P(c,p));if(progress<1)q=partial(q,progress);if(q.length<2)return;
 let L=0;for(let i=1;i<q.length;i++)L+=Math.hypot(q[i][0]-q[i-1][0],q[i][1]-q[i-1][1]);const k=kAt(c,pts[0]),n=Math.max(1,Math.floor(L/(dash*k*2))),gaps:[number,number][]=[];for(let i=0;i<n;i++){const u=(i+.55)/n;gaps.push([u,u+.45/n]);}
 s.fill(ink,ribbon(q,w,{seed,pressure:.3,taper:.15,wobble:1,gaps}),cov);}
/** a halo round one leg (hip → knee → ankle → toe) printed BEFORE the figure, so only its rim shows round the leg */
function legHalo(s:Sheet,c:Camera,pose:Pose,place:Place,build:Build,side:'l'|'r',ink:string,g:number,cov=.8){
 if(g<=.02)return;const sk=solve(pose,build,place),js=side==='l'?[sk.lHip,sk.lKn,sk.lAn,sk.lToe]:[sk.rHip,sk.rKn,sk.rAn,sk.rToe],k=kAt(c,sk.pelvis);
 s.fill(ink,ribbon(js.map(j=>P(c,j)),(.26+.08*g)*k*g,{taper:.05,pressure:0,wobble:1,seed:side==='l'?71:72}),cov);}
/** the glove's path through the dive (the "spring"), sampled from the solved skeleton */
const handArc=(c:Camera,u1:number):Pt[]=>{const o:Pt[]=[];for(let i=0;i<=14;i++){const u=.1+(u1-.1)*i/14;o.push(P(c,leadHand(DIVE(u),divePlace(u))));}return o;};
/** "stay low": a paper-edged yellow level line at the hip (a 3D segment across the body) with a small down arrow */
function lowLine(s:Sheet,c:Camera,sk:ReturnType<typeof solve>,g:number,w:number){
 if(g<=.02)return;const y=sk.pelvis[1],a=P(c,[sk.pelvis[0],y,sk.pelvis[2]-.9*g]),b=P(c,[sk.pelvis[0],y,sk.pelvis[2]+.9*g]);
 const path=ribbon([a,b],w,{seed:81,taper:.1,wobble:1});s.stroke(K,path,4,.8);s.knockout(path);s.fill(Y,path,.95);
 const top=P(c,[sk.pelvis[0],y+.75,sk.pelvis[2]+1.05]),bot=P(c,[sk.pelvis[0],y+.12,sk.pelvis[2]+1.05]),arr=ribbon([top,[lerp(top[0],bot[0],g),lerp(top[1],bot[1],g)]],w*.8,{seed:82,taper:.1,wobble:1});
 s.fill(Y,arr,.95);if(g>.9)arrowTip(s,Y,top,bot,w*3,.95);}

// ================= chapter 1 (LIVE, real time): the high main-stand camera =================
const BCAM:V3=[-33,16,-52];
const TL=()=>T(0,'shoots')+.3;// τ = 0 lands just after the cue word "shoots"
function ch1Look(tau:number):V3{const b=ballAt(Math.min(tau,T_S)),w=sm(-1.6,.2,tau,easeIO);
 return[lerp(b[0],-4.5,w*.85),2.4+1.2*(1-sm(-12,-8,tau)),lerp(b[2],.4,w*.85)];}// aimed above the play so the crowd fills the top of the frame
function ch1Cam(t:number){const tau=t-TL(),a=ch1Look(tau),b=ch1Look(tau-.35),c=ch1Look(tau-.7),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const F=key(tau,[[-12,2300],[-8,2800],[-4,3200],[-1,3500],[.3,3800],[1.5,4000],[3,3800]]);return cam(BCAM,look,F);}
const ch1:Scene={
 draw(s,t){const tt=twos(t),c=ch1Cam(t),tl=TL(),wg=T(0,'West Germany'),nl=T(0,'the Netherlands'),at=T(0,'attack again and again');frame(s);
  const save=tl+T_S;
  stadium(s,c,{t,cheer:.2+.4*sm(0,.8,t)*(1-sm(1.5,3,t))+.5*sm(at,at+.5,t)*(1-sm(tl-.6,tl,t))+1.3*sm(save,save+.3,t),
   flash:.12+.5*sm(T(0,'the World Cup final'),T(0,'the World Cup final')+.3,t)*(1-sm(T(0,'the World Cup final')+1.2,wg,t))+1.1*sm(save,save+.3,t),
   german:sm(wg,wg+.5,t)*(1-.6*sm(nl,nl+1,t))+sm(save+.1,save+.5,t),dutch:sm(nl,nl+.5,t)*(1-.4*sm(save,save+1,t))+.6*sm(at,at+.4,t)*(1-sm(tl,tl+.8,t))});
  const tau=t-tl;goal(s,c,0);
  drawWorld(s,c,tau,tt-tl,{ballMin:12,cap:busy(0,t)});},
 aperture(t){const c=ch1Cam(t),m=maierAt(t-TL()).place,p:V3=[m.x??0,.6,m.z??0],[x,y]=P(c,p);return apertureDisc(x,y,Math.max(14,.35*kAt(c,p)),12);},
 still:13,
};

// ================= chapter 2 (TV slow-motion replay, low in front of the goal) =================
const ch2T=()=>({w:T(1,'Watch again'),mw:T(1,'Maier waits low'),ot:T(1,'on his toes'),rs:T(1,'Rep strikes it'),po:T(1,'pushes off'),fs:T(1,'flies sideways'),ta:T(1,'turns it away'),end:SEC(1)});
/** replay clock: slow through the set, the strike on "Rep strikes it", the dive through "pushes off" / "flies sideways", the glove on "turns it away" */
const tau2=(t:number)=>{const q=ch2T();return key(t,mono([[0,-1.6],[q.mw,-1.25],[q.ot+.4,-.75],[q.rs+.25,0],[q.po+.2,T_D0+.08],[q.fs+.2,T_D0+.3],[q.ta+.15,T_S],[q.ta+1.1,T_S+.3],[q.end,T_S+.62]]),x=>x);};
function ch2Cam(t:number){const q=ch2T(),tau=tau2(t),r=repAt(Math.min(tau,.3)).place,m=maierAt(tau).place;
 const toK=sm(q.rs,q.fs+.2,t,easeIO),early=sm(q.w,q.mw+.6,t,easeIO)*(1-sm(q.ot+.6,q.rs,t,easeIO)),focus:V3=mix3(mix3(mix3([r.x??0,.95,r.z??0],[MX,.95,m.z??0],.62),[MX,.85,m.z??0],early*.9),[MX,.9,(SAVE[2]+Z0)/2],toK);
 const pos:V3=[key(t,mono([[0,-20],[q.mw,-16],[q.ot,-15],[q.rs,-15.5],[q.fs,-10.5],[q.ta,-9.2],[q.end,-8.8]])),key(t,mono([[0,1.5],[q.rs,1.3],[q.end,1.15]])),key(t,mono([[0,-.4],[q.rs,-.9],[q.ta,-1.4],[q.end,-1.5]]))];
 const F=key(t,mono([[0,1500],[q.mw,1900],[q.ot,2100],[q.rs,1600],[q.fs,1750],[q.ta,1800],[q.end,1850]]));
 return cam(pos,focus,F);}
const ch2:Scene={
 draw(s,t){const q=ch2T(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),tp=tau2(tt),prevDt=Math.max(.02,tp-tau2(tt-1/12));frame(s);
  stadium(s,c,{t,cheer:.15+.9*sm(q.ta,q.ta+.4,t),flash:.1+.8*sm(q.ta,q.ta+.4,t),german:sm(q.ta,q.ta+.6,t)});
  goal(s,c,0);
  const mk=maierAt(tp),sk=solve(mk.pose,MB,mk.place);
  // "on his toes": small yellow rings under both toes, pulsing with his bounce
  const toes=sm(q.ot-.1,q.ot+.35,tt,easeOutBack)*(1-sm(q.rs+.2,q.po,tt));
  if(toes>.02)for(const j of[sk.lToe,sk.rToe]){const r=(.17+.03*Math.sin(tt*9))*toes;s.fill(Y,ribbon(ringPath(c,groundRing(j[0],j[2],r,r*.8,16)),8,{seed:21,close:true,wobble:1}),.95);}
  // "flies sideways": a dashed yellow path from where he pushed off to where the glove meets the ball
  const fly=sm(q.fs-.1,q.fs+.7,tt,easeOut)*(1-sm(q.ta+1.2,q.end,tt));
  if(fly>.02){const pts=seg([MX-.2,Z0],[MX-.2,SAVE[2]],10);groundDash(s,c,pts,12,Y,23,{progress:fly,cov:.95});if(fly>.95){const pp=ringPath(c,pts);if(pp.length>2)arrowTip(s,Y,pp[pp.length-3],pp[pp.length-1],40,.95);}}
  // "pushes off": an orange burst of turf at his feet as the dive launches
  const po=sm(q.po-.05,q.po+.3,tt,easeOut)*(1-sm(q.po+.5,q.fs+.4,tt));
  if(po>.02){const p=P(c,[MX,.05,Z0-.2]);sparkBurst(s,O,p[0],p[1],(.9*po)*kAt(c,[MX,0,Z0]),{n:9,seed:24,g:po,width:.05*kAt(c,[MX,0,Z0])});}
  // "Rep strikes it": the halo round his right (kicking) leg
  const rp=repAt(tp);legHalo(s,c,rp.pose,rp.place,RB,'r',Y,sm(q.rs-.1,q.rs+.3,tt,easeOut)*(1-sm(q.po,q.fs,tt)));
  drawWorld(s,c,tau,tp,{ballMin:16,hero:true,prevDt,cap:busy(1,t),smear:true});
  // "turns it away": a spark where the glove meets it, then speed lines behind the ball going wide
  if(tp>T_S-.03&&tp<T_S+.2){const p=P(c,SAVE);sparkBurst(s,Y,p[0],p[1],(.5+.4*sm(T_S-.03,T_S+.06,tp))*kAt(c,SAVE),{n:9,seed:25,g:1-sm(T_S+.1,T_S+.2,tp),width:.05*kAt(c,SAVE)});}
  if(tp>T_S+.02&&tp<T_O+.2){const a=P(c,ballAt(tp-.08)),b=P(c,ballAt(tp));speedLines(s,K,b[0],b[1],Math.atan2(b[1]-a[1],b[0]-a[0]),{n:4,seed:26,len:180,width:8,cov:.75});}
 },
 aperture(t){const c=ch2Cam(t),m=maierAt(tau2(t)).place,p:V3=[m.x??0,.6,m.z??0],[x,y]=P(c,p);return apertureDisc(x,y,Math.max(16,.3*kAt(c,p)),12);},
 still:9,
};

// ================= chapter 3 (the second replay angle: high behind the goal, half speed, then Maier bounces back up) =================
const ch3T=()=>({tv:T(2,'The TV commentator'),m:T(2,'Maier'),aa:T(2,'Again and again'),wg:T(2,'West Germany held on'),end:SEC(2)});
const tau3=(t:number)=>{const q=ch3T();return key(t,mono([[0,-.9],[q.tv+.4,-.2],[q.m+.2,T_S],[q.aa,T_S+.55],[q.wg,2.0],[q.end,3.5]]),x=>x);};
function ch3Cam(t:number){const q=ch3T(),look:V3=[lerp(-5,-2.5,sm(0,q.m,t,easeIO)),.7,lerp(1.4,-1,sm(0,q.m+.5,t,easeIO))];
 return cam([12.5,6.4,lerp(-1,-2,sm(0,q.end,t))],look,key(t,mono([[0,2100],[q.tv,2300],[q.m,2600],[q.wg,2450],[q.end,2300]])));}
const ch3:Scene={
 draw(s,t){const q=ch3T(),tt=twos(t),c=ch3Cam(t),tau=tau3(t),tp=tau3(tt),prevDt=Math.max(.03,tp-tau3(tt-1/12));frame(s);
  stadium(s,c,{t,cheer:.3+.9*sm(q.m,q.m+.4,t)+.6*sm(q.wg,q.wg+.5,t),flash:.15+.7*sm(q.m,q.m+.3,t)*(1-sm(q.aa+1,q.wg,t))+.9*sm(q.wg,q.wg+.4,t),german:sm(q.m,q.m+.6,t)+sm(q.wg,q.wg+.5,t)*.6});
  goal(s,c,0);
  drawWorld(s,c,tau,tp,{ballMin:12,hero:true,prevDt,cap:busy(2,t),smear:true});
  if(tp>T_S-.03&&tp<T_S+.22){const p=P(c,SAVE);sparkBurst(s,Y,p[0],p[1],(.6+.4*sm(T_S-.03,T_S+.06,tp))*kAt(c,SAVE),{n:9,seed:35,g:1-sm(T_S+.12,T_S+.22,tp),width:.05*kAt(c,SAVE)});}
 },
 aperture(t){const c=ch3Cam(t),m=maierAt(tau3(t)).place,p:V3=[m.x??0,.9,m.z??0],[x,y]=P(c,p);return apertureDisc(x,y,Math.max(20,.5*kAt(c,p)),12);},
 still:6,
};

// ================= chapter 4 (duotone lesson): stay low and light on your feet so you can react like a cat =================
const ch4T=()=>({cat:T(3,'They called him the Cat'),yt:T(3,'Your turn'),sl:T(3,'stay low'),lf:T(3,'light on your feet'),re:T(3,'react like a cat'),end:SEC(3)});
/** lesson clock on τ: the set bounce until "react like a cat", then the shot and the dive in real time */
const tau4=(t:number)=>{const q=ch4T();return t<q.re?-.9-.05*Math.sin(t):key(t,mono([[q.re,-.25],[q.re+.35,0],[q.re+.35+T_S*1.3,T_S],[q.re+.35+T_S*1.3+1.1,T_S+.7],[q.end+2,T_S+1]]),x=>x);};
const ch4:Scene={
 draw(s,t){const q=ch4T(),tt=twos(t),tau=tau4(tt),cap=busy(3,t);
  // camera: low and front-on, a step to his right, pushing in on "stay low", easing back for the dive
  const pos:V3=[key(t,mono([[0,-8.6],[q.sl,-7.4],[q.lf,-7.0],[q.re,-8.4],[q.end,-9]])),key(t,mono([[0,1.3],[q.sl,1.0],[q.re,1.15],[q.end,1.2]])),key(t,mono([[0,Z0-.4],[q.re,Z0-1.1],[q.end,Z0-1.3]]))];
  const c=cam(pos,[MX,lerp(1.0,.8,sm(q.lf,q.re,t,easeIO)),lerp(Z0-.1,(Z0+SAVE[2])/2,sm(q.lf,q.re,t,easeIO))],key(t,mono([[0,1650],[q.sl,1800],[q.lf,1850],[q.re,1600],[q.end,1550]])));frame(s);
  // the print: blue sky in bands, a navy floor with a stepped light pool round his feet; the goal in paper
  s.field(B,.3,.6);
  const hz=P(c,[c.eye[0]+c.f[0]*1e4,0,c.eye[2]+c.f[2]*1e4])[1],Bn=Math.max(s.W,s.H)*1.6;
  for(let i=0;i<4;i++)s.tone(B,polyPath([[-Bn,hz-120-i*170],[Bn,hz-120-i*170],[Bn,hz-40],[-Bn,hz-40]],true),.18);
  const floor=new Path2D();addPoly(floor,clipPoly(c,[[-40,0,-30],[8,0,-30],[8,0,30],[-40,0,30]]));s.knockout(floor);s.fill(K,floor,.72);
  const pool=(r:number)=>{const pa=new Path2D();addPoly(pa,clipPoly(c,groundRing(MX-.3,(Z0+SAVE[2])/2,r,r*1.15,40)));return pa;};
  s.knockout(pool(2.9),.6);s.tone(B,pool(2.9),.22);s.tone(B,pool(1.6),.28);
  goal(s,c,0);
  const mk=maierAt(tau),pv=maierAt(tau-1/12),sk=solve(mk.pose,MB,mk.place),k0=kAt(c,[MX,1,Z0]);
  // "They called him the Cat": flashbulbs round the print and stamp rings under him
  const fl=sm(q.cat,q.cat+.3,tt)*(1-sm(q.cat+1.4,q.yt+.4,tt));if(fl>.02){const fp=new Path2D(),r=rng(900+Math.floor(tt*6));for(let i=0;i<9;i++){const x=(r()-.5)*1400,y=hz-80-r()*420,sz=16+r()*20;fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));}s.knockout(fp,fl);}
  const stamp=sm(q.cat,q.cat+.5,tt,easeOutBack)*(1-sm(q.yt,q.sl,tt));
  if(stamp>.02)for(let i=0;i<3;i++)s.fill(Y,ribbon(ringPath(c,groundRing(mk.place.x??0,mk.place.z??0,(.7+i*.35)*stamp,(.6+i*.3)*stamp,32)),12-i*3,{seed:60+i,close:true,wobble:1.2}),.95);
  // "light on your feet": bouncing toe rings
  const lf=sm(q.lf-.1,q.lf+.35,tt,easeOutBack)*(1-sm(q.re+.2,q.re+.6,tt));
  if(lf>.02)for(const j of[sk.lToe,sk.rToe]){const r=(.16+.04*Math.abs(Math.sin(tt*TAU*1.5)))*lf;s.fill(Y,ribbon(ringPath(c,groundRing(j[0],j[2],r,r*.8,16)),9,{seed:62,close:true,wobble:1}),.95);}
  // "react like a cat": the shot line arrives, then the glove's spring arc prints through the dive
  const re=sm(q.re-.05,q.re+.5,tt,easeOut);
  if(re>.02){const pts=[0,.25,.5,.75,1].map(u=>P(c,[lerp(RS[0]*.55,SAVE[0],u),lerp(.4,SAVE[1],u),lerp(RS[1]*.55,SAVE[2],u)]));
   s.fill(Y,ribbon(partial(pts,re),10,{seed:63,pressure:.3,taper:.15,wobble:1,gaps:[[.2,.3],[.45,.55],[.7,.8]]}),.9);}
  const arcU=clamp((tau-T_D0)/DD);if(tau>T_D0+.02){const arc=handArc(c,Math.min(.55,arcU)),path=ribbon(arc,.13*k0,{seed:64,taper:.3,wobble:1});s.stroke(K,path,4,.8);s.knockout(path);s.fill(Y,path,.95);}
  // Maier (duotone) with the "stay low" level line at his hips, then the ball
  const items:Item[]=[];
  items.push({depth:depthOf(c,[mk.place.x??0,0,mk.place.z??0]),draw:()=>{drawPlayer(s,mk.pose,c,MAIER_DUO,mk.place,{prev:pv,smear:tau>T_D0+.05&&tau<T_S+.2,cap:cap?'mid':undefined});
   lowLine(s,c,sk,sm(q.sl-.05,q.sl+.5,tt,easeOut)*(1-sm(q.re-.3,q.re+.2,tt)),.05*k0);}});
  if(tau>-.2){const bl=ballAt(tau);items.push({depth:depthOf(c,bl)-.05,draw:()=>{const p=P(c,bl),r=Math.max(18,BALL_R*kAt(c,bl));ballShadow(s,c,bl,.4);ball(s,p[0],p[1],r,spinAt(tau));}});}
  items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
  if(tau>T_S-.03&&tau<T_S+.3){const p=P(c,SAVE);sparkBurst(s,Y,p[0],p[1],.9*kAt(c,SAVE)*easeOut(sm(T_S-.03,T_S+.1,tau)),{n:10,seed:65,g:1-sm(T_S+.15,T_S+.3,tau),width:.06*kAt(c,SAVE)});}
 },
 still:8,
};

const story:RisoStory={
 id:'maier-signature',format:'11v11',title:'Maier, the Cat from Anzing',
 theme:'Stay low and light on your feet so you can react like a cat.',
 ageNote:'World Cup final, Netherlands 1–2 West Germany, Olympiastadion, Munich, 7 July 1974, second half. One of Sepp Maier’s saves from the Dutch attack, recreated.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',blue:'#0078bf',navy:'#22366b'},order:['yellow','orange','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a glove-swipe arc through the tap and a ball knocked away. Reduced motion: the arc and the ball, still. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.45)),r=44,a0=Math.PI*(.95+.2*hash(seed,2)),arc:Pt[]=[];for(let i=0;i<=16;i++){const a=a0+i/16*Math.PI*.55*u;arc.push([x+Math.cos(a)*r*2.2,y+Math.sin(a)*r*1.4]);}
  s.fill(Y,ribbon(arc,14,{seed,taper:.2,wobble:1}),.95);if(arc.length>1)arrowTip(s,Y,arc[arc.length-2],arc[arc.length-1],34);
  s.fill(K,polyPath(blob(x,y+r*1.1,r*1.1,r*.25,seed+1,{n:16}),true),.3);
  const e:Pt=[x+r*4,y-r*2.2];ball(s,lerp(x,e[0],u*.6),lerp(y,e[1],u*.6),r,age*9+hash(seed,3)*TAU,{sq:age>0?.14*Math.max(0,1-age*4):0});
  if(age>0&&age<.5){speedLines(s,K,lerp(x,e[0],u*.6),lerp(y,e[1],u*.6),Math.atan2(e[1]-y,e[0]-x),{n:4,seed,len:140,width:8,cov:.8*(1-clamp(age/.5))});sparkBurst(s,Y,x,y,110*easeOutBack(clamp(age/.2)),{n:8,seed,g:1-clamp(age/.5),width:10});}
 },
};
export default story;
/** Solved contact points and checks (metres; West Germany's goal line x = 0 this half) — read by tests/play-film-maier-signature.cjs. */
export const FACTS={SAVE,RS,Z0,LINE_Z,T_S,T_D0,ballAt,repBoot:()=>footBall(strike(STRIKE_CONTACT,{foot:'r'}),RB,PL_REP),leadHand:()=>leadHand(DIVE(.55),divePlace(.55))};
