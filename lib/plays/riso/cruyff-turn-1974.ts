/** Iconic play film: the first famous "Cruyff turn". Netherlands 0–0 Sweden, 1974 World Cup, Group 3, Westfalenstadion, Dortmund,
 * 19 June 1974 (about the 22nd minute). A RisoStory (chapters mode) played by the card window and StoryFilmPlayer.
 * Narration text: public/plays/narration/cruyff-turn-1974/script.json. The lead voices it later with local Kokoro. Until then every chapter
 * runs on provisional cue times (≈2.6 words/s, see prov()). EVERY action time is read from cue onsets and chapter seconds, so once
 * timing.json exists `withTiming` re-times the whole film through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/cruyff-turn-1974/timing.json exists, replace the `VOICE` constant below with
 *   import timingJson from '../../../public/plays/narration/cruyff-turn-1974/timing.json';  const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
 *
 * SOURCES (read Sept 2026 through web search result summaries; the pages could not be fetched in this session and the footage was not
 * watched):
 *  - Wikipedia, "Cruyff turn" https://en.wikipedia.org/wiki/Cruyff_turn
 *  - Wikipedia, "Jan Olsson (footballer, born 1942)" https://en.wikipedia.org/wiki/Jan_Olsson_(footballer,_born_1942)
 *  - Wikipedia, "1974 FIFA World Cup Group 3" https://en.wikipedia.org/wiki/1974_FIFA_World_Cup_Group_3
 *  - FIFA, "Johan Cruyff turn | Netherlands v Sweden | 1974 World Cup" https://www.fifa.com/en/tournaments/mens/worldcup/articles/johan-cruyff-turn-netherlands-1974
 *  - Opta Analyst, "Netherlands vs Sweden: How an Inconspicuous 0-0 Draw Became the Birthplace of Football's Most Iconic Skill"
 *    https://theanalyst.com/articles/netherlands-vs-sweden-birthplace-iconic-skill-johan-cruyff-turn
 *  - Irish Examiner, "Jan Olsson proud to be turned by Johan Cruyff in 1974" https://www.irishexaminer.com/sport/soccer/arid-20389338.html
 *  - FourFourTwo, "On this day, 1974: Johan invents the Cruyff Turn" https://www.fourfourtwo.com/features/johan-cruyff-turn-anniversary-netherlands-skill-date-world-cup-sweden-defender
 *  - Sky Sports / Sports Mole / ESPN interviews with Jan Olsson (2016–2019); 11v11.com match report (Netherlands v Sweden, 19 June 1974)
 *  - Football Kit Archive, "Netherlands 1974 Home Kit" https://www.footballkitarchive.com/netherlands-1974-home-kit-65650/
 * CONFIRMED by those accounts: 19 June 1974, Westfalenstadion, Dortmund, group match, 0–0; about the 22nd minute; Cruyff on the LEFT flank,
 *  in an attacking position, FACING AWAY from the Swedish goal, tightly marked by Swedish right-back Jan Olsson; he shaped for a RIGHT-footed
 *  pass/cross (made as if to play the ball infield), then dragged the ball behind his standing leg with his right foot, turned 180° and
 *  accelerated away towards the byline, leaving Olsson "staring into space"; Olsson later called it the proudest moment of his career
 *  and laughed about it with his team-mates. Netherlands in orange (adidas, black trim); SWEDEN WORE THEIR ROYAL-BLUE CHANGE SHIRTS that
 *  day (FourFourTwo: people long took Olsson for an Italian because of the royal blue). Cruyff wore 14.
 * REPORTED BY ONE SUMMARY ONLY: Sweden's shorts were white.
 * INFERRED / ILLUSTRATIVE: every position, distance and run in metres (the turn is set just outside the left corner of the box); the
 *  build-up (an unnamed Dutch team-mate plays the ball out to Cruyff); how long he shielded the ball; Olsson's exact starting spot (goal-
 *  side, on Cruyff's right shoulder) and his lunge into the pass lane; the exact 180° turn to the left over the standing (left) foot; that
 *  the move ends with Cruyff running on towards the byline (no cross is shown); all other players, the Swedish keeper's dark kit, the
 *  referee's black kit, Sweden's socks, the Dutch white shorts and orange socks, Cruyff's hair, the Telstar-style ball (white with black
 *  pentagons), the weather, the stadium's look (four roofed stands close to the pitch, open corners), the crowd's colours and flags, the
 *  ad boards (no lettering), every camera position and lens, and the slow-motion speed of the replay.
 *
 * STRUCTURE (the approved standard: a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): the play is ONE
 * simulation on a real clock τ (seconds; τ = 0 the moment the inside of Cruyff's right foot meets the ball for the drag):
 *  ch1 = LIVE, the high main-stand camera in real time (the ball comes out to Cruyff, Olsson tight behind him, the fake, the turn, gone);
 *  ch2 = the TV slow-motion REPLAY from a low, close camera on the feet (fake, inside of the foot, the drag behind the standing leg, the spin,
 *        the sprint, Olsson going the wrong way);
 *  ch3 = the lesson, a duotone (orange + navy) replay on an empty print: fake the pass, drag behind the standing leg, turn away fast.
 * Seams are forward passages into the ball. The ball is attached to the INSIDE of Cruyff's right boot through the drag (read from the solved
 * skeleton), so boot and ball always meet; his standing foot is locked to the ground while he pivots. Figures: lib/plays/riso/athlete.ts
 * through ONE adapter, drawPlayer(). World: right-handed metres like athlete.ts (no projector wrap needed): Sweden's goal line x = 0, the
 * pitch runs to x = −105, the Dutch attack +x, their left flank is −z; the TV camera sits in the stand on the −z side.
 * Inks: yellow (skin with orange, grass with blue, Swedish flags), orange (Netherlands), blue (Sweden's change shirts, sky, grass), navy
 * (key line). Scenes read only their local t; drawn objects pose on twos, cameras on ones; all randomness is seeded.
 * Framing: the full sheet (card window 1.45:1 down to square), never sheet.safe; subjects stay inside ±540 units of the centre.
 * Phone heat: ≈4 plates, crowd and stands batched per ink; small figures print at 'low' detail in the wide shot and every figure is capped
 * during passages (two scenes print at once). */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,blob,ribbon,polyPath,smoothPts,partial,easeOut,easeIO,easeOutBack,easeInOutSine,settle,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,solve,posed,keyPoses,blendPose,runCycle,dribble,stand,lunge,backpedal,keeperSet,
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
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`cruyff film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
/** VOICE: null until the lead records the narration with Kokoro; then the timing.json import goes here (see the header). */
import timingJson from '../../../public/plays/narration/cruyff-turn-1974/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Live',"Dortmund, 1974. The Netherlands, in orange, play Sweden. On the left, Johan Cruyff has the ball. Defender Jan Olsson is right behind him. Cruyff gets ready to pass... then, suddenly, he's gone!",
  ['Dortmund','The Netherlands','in orange','play Sweden','On the left','Johan Cruyff','has the ball','Defender Jan Olsson','right behind him','gets ready to pass','then','suddenly','gone']),
 prov('The replay','Watch it slowly. Cruyff fakes the pass. Then he uses the inside of his foot to drag the ball behind his standing leg, spins round, and speeds away. Olsson goes the wrong way!',
  ['Watch it slowly','Cruyff fakes','the pass','inside of his foot','drag the ball','behind his standing leg','spins round','speeds away','Olsson goes','the wrong way']),
 prov('Your turn','The game ended nil-nil, but everyone remembers the Cruyff turn. Fake the pass, drag the ball behind your standing leg, and turn away fast.',
  ['The game ended','everyone remembers','the Cruyff turn','Fake the pass','drag the ball','behind your standing leg','turn away','fast']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`cruyff film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
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

// ================= the Westfalenstadion: four roofed stands tight to the pitch, open corners, a packed crowd, ad boards, pitch, goal =================
type Q4=[V3,V3,V3,V3];// [lowA, lowB, upB, upA]
const STANDS:Q4[]=[
 [[-104,1,38],[-1,1,38],[-1,19,58],[-104,19,58]],// far side (the Gegengerade)
 [[7,1,-31],[7,1,31],[27,15,31],[27,15,-31]],// behind Sweden's goal
 [[-1,1,-38],[-104,1,-38],[-104,19,-58],[-1,19,-58]],// near side (the main stand, TV gantry)
 [[-112,1,31],[-112,1,-31],[-132,15,-31],[-132,15,31]],// far end
];
/** each stand's roof: a slab over the top rows, the front fascia a little lower */
const ROOFS:Q4[]=[
 [[-104,23,31],[-1,23,31],[-1,24.5,60],[-104,24.5,60]],
 [[4,19,-31],[4,19,31],[29,20,31],[29,20,-31]],
 [[-1,23,-31],[-104,23,-31],[-104,24.5,-60],[-1,24.5,-60]],
 [[-109,19,31],[-109,19,-31],[-134,20,-31],[-134,20,31]],
];
const bil=(q:Q4,u:number,v:number):V3=>mix3(mix3(q[0],q[1],u),mix3(q[3],q[2],u),v);
/** crowd: [stand, u, v, ink 0 paper / 1 navy / 2 orange (Dutch fans) / 3 yellow / 4 blue (Swedish fans), phase] */
const CROWD=(()=>{const r=rng(1974),out:[number,number,number,number,number][]=[];[900,360,700,360].forEach((n,st)=>{for(let i=0;i<n;i++){const c=r();out.push([st,r(),.04+r()*.9,c<.34?0:c<.52?1:c<.8?2:c<.9?3:4,r()*TAU]);}});return out;})();
/** flags held up in the crowd: Dutch tricolours (red-white-blue, printed orange/paper/blue), Swedish blue with a yellow cross */
const FLAGS:[number,number,number,number][]=(()=>{const r=rng(619),o:[number,number,number,number][]=[];for(let i=0;i<26;i++){const st=r()<.55?0:r()<.5?1:3;o.push([st,.05+r()*.9,.15+r()*.7,r()<.66?1:0]);}return o;})();
type Crowd={cheer?:number;flash?:number;wave?:number;swe?:number;t:number};
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{cheer=0,flash=0,wave=0,swe=0,t}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5;
 // a pale June sky (only a sliver shows over the roofs), cloud banks knocked out
 s.field(B,.18,.7);
 {const cl=new Path2D(),r=rng(74);for(let i=0;i<6;i++){const x=(r()-.5)*Bnd*1.4,y=-Bnd*.5-r()*300,w=300+r()*420;cl.addPath(polyPath(Array.from({length:18},(_,k)=>{const a=k/18*TAU;return[x+Math.cos(a)*w,y+Math.sin(a)*w*.18*(1+.3*Math.sin(a*3+i))] as Pt;}),true));}s.knockout(cl,.5);}
 // stands: knocked out, a navy screen, stepped rows; the crowd prints as ink fields; open corners show the sky and the town
 const stands=new Path2D(),rows=new Path2D(),roof=new Path2D(),fascia=new Path2D(),walls=new Path2D();
 STANDS.forEach((q,si)=>{addPoly(stands,clipPoly(c,q));for(let k=0;k<16;k+=2)addPoly(rows,clipPoly(c,[bil(q,0,k/16),bil(q,1,k/16),bil(q,1,(k+1)/16),bil(q,0,(k+1)/16)]));
  addPoly(walls,clipPoly(c,[q[0],q[1],[q[1][0],0,q[1][2]],[q[0][0],0,q[0][2]]]));
  const rf=ROOFS[si];addPoly(roof,clipPoly(c,rf));addPoly(fascia,clipPoly(c,[rf[0],rf[1],add(rf[1],[0,-1.4,0]),add(rf[0],[0,-1.4,0])]));
  // roof columns at the back of the stand
  for(let u=0;u<=1.001;u+=.2){const b=bil(q,u,1),top=bil(rf,u,.92);addPoly(roof,clipPoly(c,[add(b,[-.25,0,0]),add(b,[.25,0,0]),add(top,[.25,0,0]),add(top,[-.25,0,0])]));}});
 s.knockout(stands);s.tone(K,stands,.42);s.tone(O,rows,.18);s.tone(K,rows,.2);
 // crowd heads: faces, dark coats, orange Dutch fans, Swedish yellow and blue; they bob on the twos when they cheer
 const heads=[new Path2D(),new Path2D(),new Path2D(),new Path2D(),new Path2D()],seen=[0,0,0,0,0];
 for(const[st,u,v,col,ph] of CROWD){const q=STANDS[st],bob=cheer>0?cheer*.8*Math.abs(Math.sin(ph+tt*9)):0,p=bil(q,u,v);p[1]+=.35+bob;if(depthOf(c,p)<2)continue;const k=kAt(c,p),sz=clamp(.55*k,5,20),[x,y]=P(c,p);if(Math.abs(x)>Bnd||Math.abs(y)>Bnd)continue;heads[col].rect(x-sz/2,y-sz*.6,sz,sz*1.15);seen[col]++;}
 if(seen[0])s.knockout(heads[0],.9);if(seen[1])s.fill(K,heads[1],.85);if(seen[2])s.fill(O,heads[2],.95);if(seen[3])s.fill(Y,heads[3],.95);if(seen[4])s.fill(B,heads[4],.95);
 // flags waving in the crowd (the Dutch ones rise on "in orange", the Swedish ones on "play Sweden")
 {const pole=new Path2D(),blu=new Path2D(),yel=new Path2D(),org=new Path2D(),pap=new Path2D();
  FLAGS.forEach(([st,u,v,dutch],i)=>{const lift=dutch?wave:swe;const b=bil(STANDS[st],u,v);b[1]+=1.2+1.4*lift;if(depthOf(c,b)<4)return;const k=kAt(c,b),pb=P(c,b);if(Math.abs(pb[0])>Bnd||Math.abs(pb[1])>Bnd)return;
   const pt:Pt=[pb[0],pb[1]-1.6*k],w=2.2*k,h=1.4*k,wv=(q:number)=>Math.sin(tt*(5+3*lift)+i+q*4)*h*(.1+.15*lift)*q;pole.addPath(ribbon([pb,pt],Math.max(2,.12*k),{taper:0,wobble:0}));
   const cloth=(u0:number,u1:number,v0:number,v1:number)=>polyPath([[pt[0]+w*u0,pt[1]+h*v0+wv(u0)],[pt[0]+w*u1,pt[1]+h*v0+wv(u1)],[pt[0]+w*u1,pt[1]+h*v1+wv(u1)],[pt[0]+w*u0,pt[1]+h*v1+wv(u0)]],true);
   if(dutch){org.addPath(cloth(0,1,0,.34));pap.addPath(cloth(0,1,.34,.67));blu.addPath(cloth(0,1,.67,1));}
   else{blu.addPath(cloth(0,1,0,1));yel.addPath(cloth(.3,.44,0,1));yel.addPath(cloth(0,1,.42,.58));}});
  s.fill(K,pole,.9);s.knockout(blu);s.knockout(org);s.knockout(pap);s.fill(B,blu,.95);s.fill(O,org,.95);s.knockout(yel);s.fill(Y,yel,.95);}
 // photographers' flashes when the crowd roars
 if(flash>0){const fp=new Path2D(),r=rng(700+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(20*flash);i++){const st=Math.floor(r()*4),p=bil(STANDS[st],r(),.06+r()*.5);if(depthOf(c,p)<3)continue;const[x,y]=P(c,p),sz=clamp(1*kAt(c,p),8,22);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
 s.knockout(roof);s.fill(K,roof,.62);s.tone(B,roof,.3);s.fill(K,fascia,.92);s.fill(K,walls,.72);
 // ad boards round the pitch: paper panels with blocks of ink (no lettering)
 {const bd=new Path2D(),blk=[new Path2D(),new Path2D(),new Path2D()];
  for(const z of[-35.5,35.5])for(let x=-104;x<0;x+=6){const q:V3[]=[[x+.2,0,z],[x+5.8,0,z],[x+5.8,.9,z],[x+.2,.9,z]];addPoly(bd,clipPoly(c,q));const i=Math.abs(Math.round(x/6))%3;addPoly(blk[i],clipPoly(c,[[x+.8,.2,z],[x+4.2,.2,z],[x+4.2,.7,z],[x+.8,.7,z]]));}
  s.knockout(bd);s.stroke(K,bd,3,.7);s.fill(O,blk[0],.9);s.fill(B,blk[1],.9);s.fill(Y,blk[2],.95);}
 // grass: yellow × blue = green, mowing stripes, paper lines
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-112,0,-37],[7,0,-37],[7,0,37],[-112,0,37]]));s.knockout(gp);s.fill(Y,gp,.88);s.tone(B,gp,.6);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5,0,-34],[x+5,0,34],[x,0,34]]));s.tone(B,stripes,.2);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.16);
 Ln([-105,-34],[0,-34]);Ln([-105,34],[0,34]);Ln([0,-34],[0,34]);Ln([-52.5,-34],[-52.5,34]);
 Ln([0,-20.16],[-16.5,-20.16]);Ln([-16.5,-20.16],[-16.5,20.16]);Ln([-16.5,20.16],[0,20.16]);
 Ln([0,-9.16],[-5.5,-9.16]);Ln([-5.5,-9.16],[-5.5,9.16]);Ln([-5.5,9.16],[0,9.16]);
 {let prev:[number,number]|null=null;for(let i=0;i<=10;i++){const a=Math.PI-.927+i/10*1.854,pt:[number,number]=[-11+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 {let prev:[number,number]|null=null;for(let i=0;i<=24;i++){const a=i/24*TAU,pt:[number,number]=[-52.5+Math.cos(a)*9.15,Math.sin(a)*9.15];if(prev)Ln(prev,pt);prev=pt;}}
 {let prev:[number,number]|null=null;for(let i=0;i<=4;i++){const a=Math.PI/2+i/4*Math.PI/2,pt:[number,number]=[Math.cos(a)*1,-34+Math.sin(a)*1];if(prev)Ln(prev,pt);prev=pt;}}
 addPoly(lines,clipPoly(c,[[-11.15,.02,-.15],[-10.85,.02,-.15],[-10.85,.02,.15],[-11.15,.02,.15]]));
 s.knockout(lines,.95);
 // corner flag at the Dutch left corner
 {const b:V3=[0,0,-34],top:V3=[0,1.6,-34];if(depthOf(c,b)>2){const pb=P(c,b),pt=P(c,top),k=kAt(c,b);s.fill(K,ribbon([pb,pt],Math.max(2,.05*k),{taper:0,wobble:0}),.95);const fl=polyPath([pt,[pt[0]-.5*k,pt[1]+.15*k+Math.sin(tt*6)*.05*k],[pt[0],pt[1]+.35*k]],true);s.knockout(fl);s.fill(Y,fl,.95);}}
 goal(s,c);
}
/** the goal at x = 0: square posts, a box net held by rear stanchions */
function goal(s:Sheet,c:Camera){
 const W=3.66,H=2.44,Dp=2,vol=new Path2D(),mesh=new Path2D();
 const back=(u:number,v:number):V3=>[Dp,lerp(H,0,v),lerp(-W,W,u)],top=(u:number,v:number):V3=>[lerp(0,Dp,v),H,lerp(-W,W,u)],side=(z:number)=>(u:number,v:number):V3=>[lerp(0,Dp,u),lerp(H,0,v),z];
 const grid=(f:(u:number,v:number)=>V3,nu:number,nv:number)=>{const poly:V3[]=[];for(let i=0;i<=nu;i++)poly.push(f(i/nu,0));for(let j=1;j<=nv;j++)poly.push(f(1,j/nv));for(let i=nu-1;i>=0;i--)poly.push(f(i/nu,1));for(let j=nv-1;j>0;j--)poly.push(f(0,j/nv));addPoly(vol,clipPoly(c,poly));
  for(let i=0;i<=nu;i++){let on=false;for(let j=0;j<=nv;j++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}
  for(let j=0;j<=nv;j++){let on=false;for(let i=0;i<=nu;i++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}};
 grid(back,12,5);grid(top,12,3);grid(side(-W),3,5);grid(side(W),3,5);
 s.knockout(vol,.3);s.tone(K,vol,.2);s.stroke(K,mesh,Math.max(2,.028*kAt(c,[0,1,0])),.7);
 const frameP=new Path2D(),edge=new Path2D(),bar=(a:V3,b:V3,w0=.12)=>{if(depthOf(c,a)<NEAR||depthOf(c,b)<NEAR)return;const pa=P(c,a),pb=P(c,b),w=w0*kAt(c,mix3(a,b,.5));frameP.addPath(ribbon([pa,pb],Math.max(2,w),{taper:0,pressure:0,wobble:.5}));edge.addPath(ribbon([pa,pb],Math.max(2,w)+Math.max(2,w*.4),{taper:0,pressure:0,wobble:.5}));};
 bar([0,0,-W],[0,H+.06,-W]);bar([0,0,W],[0,H+.06,W]);bar([0,H,-W-.06],[0,H,W+.06]);
 bar([Dp,0,-W],[Dp,H,-W],.06);bar([Dp,0,W],[Dp,H,W],.06);
 s.fill(K,edge,.9);s.knockout(frameP);
}

// ================= the 1974 ball: white with black pentagons (Telstar style), navy shade, rim, glint =================
const BALL_R=.11;
function ball(s:Sheet,x:number,y:number,r:number,rot:number,o:{sq?:number;dir?:number;duo?:boolean}={}){
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

// ================= kits (1974) and the figure adapter =================
const SKIN:AthleteStyle['skin']=[[Y,.52],[O,.3]];
const NED=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:O,shorts:'paper',socks:O,trim:'paper',boots:K,skin:SKIN,hair:[K,.7],hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',...o});
const SWE=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,shorts:'paper',socks:B,trim:Y,boots:K,skin:SKIN,hair:[K,.55],hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',...o});
const CB:Build={height:1.78,bulk:.88,thighs:.95};
const CRUYFF:AthleteStyle=NED({number:14,numberInk:K,hairStyle:'long',hair:K,build:CB,seed:14});
const OLSSON:AthleteStyle=SWE({build:{height:1.8,bulk:1.02},hair:[Y,.9],seed:2});
const KEEPER:AthleteStyle={shirt:[K,.85],shorts:[K,.9],socks:[K,.85],boots:K,skin:SKIN,hair:[K,.6],line:K,sleeves:'long',gloves:'paper',shade:[K,.26],seed:21};
const REF:AthleteStyle={shirt:[K,.92],shorts:[K,.92],socks:[K,.92],trim:'paper',boots:K,skin:SKIN,hair:[K,.6],line:K,sleeves:'short',seed:33};
/** duotone kits for the lesson (orange + navy only) */
const CRUYFF_DUO:AthleteStyle={...CRUYFF,skin:[[O,.2]],shade:[K,.22],numberInk:K};
const OLSSON_DUO:AthleteStyle={...OLSSON,shirt:[K,.42],socks:[K,.42],trim:K,skin:[[O,.16]],hair:[K,.3],shade:[K,.18],shadow:[K,.15]};
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

// ================= the play as ONE simulation on τ (seconds; τ = 0 the inside of the right boot meets the ball for the drag) =================
type MKey=[number,number,number];// τ, x, z
function pathPos(p:MKey[],tau:number){let dist=0;if(tau<=p[0][0])return{x:p[0][1],z:p[0][2],vx:0,vz:0,dist:0};
 for(let i=0;i+1<p.length;i++){const a=p[i],b=p[i+1],L=Math.hypot(b[1]-a[1],b[2]-a[2]),dt=b[0]-a[0];if(tau<b[0]){const u=(tau-a[0])/dt,e=easeInOutSine(u);return{x:lerp(a[1],b[1],e),z:lerp(a[2],b[2],e),vx:(b[1]-a[1])/dt,vz:(b[2]-a[2])/dt,dist:dist+L*e};}dist+=L;}
 const l=p[p.length-1];return{x:l[1],z:l[2],vx:0,vz:0,dist};}
/** a running body: stride phase from distance run, speed from velocity, facing the run (or `look` when still) */
function runner(p:MKey[],tau:number,look:V3,idle:Pose=stand()):{pose:Pose;place:Place}{
 const q=pathPos(p,tau),v=Math.hypot(q.vx,q.vz),sp=clamp(v/8),run=runCycle(q.dist/(2.2+2.4*sp),{speed:sp});
 const yaw=v>.6?YAW(q.vx,q.vz):YAW(look[0]-q.x,look[2]-q.z);return{pose:blendPose(idle,run,clamp(v/1.2)),place:{x:q.x,z:q.z,yaw}};}
type St={pose:Pose;place:Place};
const mixSt=(A:St,Bq:St,u:number):St=>({pose:blendPose(A.pose,Bq.pose,u),place:{x:lerp(A.place.x??0,Bq.place.x??0,u),z:lerp(A.place.z??0,Bq.place.z??0,u),yaw:lerpAng(A.place.yaw??0,Bq.place.yaw??0,u)}});
/** segments on τ, crossfaded (both evaluated at τ) over ±.1 s at every boundary so no pose pops */
function segAt(segs:[number,(t:number)=>St][],tau:number):St{
 let i=0;while(i+1<segs.length&&tau>=segs[i+1][0])i++;
 const st=segs[i][0];if(i>0&&tau<st+.1)return mixSt(segs[i-1][1](tau),segs[i][1](tau),sm(st-.1,st+.1,tau,easeInOutSine));
 const nx=segs[i+1]?.[0];if(nx!==undefined&&tau>nx-.1)return mixSt(segs[i][1](tau),segs[i+1][1](tau),sm(nx-.1,nx+.1,tau,easeInOutSine));
 return segs[i][1](tau);}

// ---- the spot: just outside the left corner of Sweden's box; Cruyff faces AWAY from goal (and a little infield) ----
const C0:[number,number]=[-19.6,-23.2];
const F0=n2(-1,.3),Y0=YAW(F0[0],F0[1]),R0=rightOf(Y0);// F0 = his facing, R0 = his right (toward the touchline)
const W0=(lx:number,lz:number):[number,number]=>[C0[0]+F0[0]*lx+R0[0]*lz,C0[1]+F0[1]*lx+R0[1]*lz];

/** THE CRUYFF TURN, right foot, standing (left) foot planted beside the ball: shield → plant + wind-up (.3) → the fake pass swing (.5) →
 * the boot reaches past the ball, toes turned in (CONTACT .6) → the inside of the boot drags the ball back behind the standing heel
 * (RELEASE .78) → pivot on the left foot, turning 180° to the left (.9) → first sprint stride (1). Keys authored in degrees. */
const U_C=.6,U_R=.78,MOVE_D=1.6;
const SHIELD=posed({lHipF:18,rHipF:10,lKnee:32,rKnee:28,lHipA:8,rHipA:8,lean:16,pitch:4,lShA:34,rShA:30,lElb:44,rElb:44,neckP:26});
const TURN_KEYS:[number,Pose][]=[
 [0,SHIELD],
 [.3,posed({lHipF:36,lKnee:30,lAnk:-8,rHipF:-34,rKnee:86,rAnk:34,rHipR:-10,rHipA:8,lShA:62,lShF:18,lElb:30,rShA:40,rShF:-26,rElb:36,lean:8,pitch:2,twist:-14,yaw:-6,bend:-6,neckP:24,neckY:18})],
 [.5,posed({lHipF:34,lKnee:32,lAnk:-4,rHipF:44,rKnee:40,rAnk:20,rHipR:-20,rHipA:2,lShA:70,lShF:-10,lElb:28,rShA:44,rShF:18,rElb:40,lean:12,twist:12,yaw:2,bend:-8,neckP:30,neckY:10})],
 [U_C,posed({lHipF:36,lKnee:30,lAnk:-2,rHipF:40,rKnee:30,rAnk:6,rHipR:-32,rHipA:4,lShA:72,lShF:-14,rShA:48,rShF:10,lElb:30,rElb:40,lean:18,twist:6,bend:-10,neckP:42})],
 [U_R,posed({lHipF:34,lKnee:36,lAnk:0,rHipF:2,rKnee:34,rAnk:14,rHipR:-36,rHipA:-22,lShA:70,rShA:52,rShF:-12,lElb:32,rElb:38,lean:20,twist:18,bend:-6,neckP:38,neckY:26})],
 [.9,posed({lHipF:30,lKnee:56,lAnk:-4,rHipF:40,rKnee:86,rAnk:30,rHipA:6,lShA:58,rShA:50,lShF:-26,rShF:40,lElb:60,rElb:60,lean:26,pitch:8,twist:26,neckP:10,neckY:34})],
 [1,runCycle(.35,{speed:.8})],
];
const turnPose=(u:number)=>keyPoses(clamp(u),TURN_KEYS);
/** the turn in any local frame (origin = where he stands, yaw0 = his facing): the standing foot is locked to the ground from the plant, the
 * body pivots 180° to the LEFT over it, then pushes off along `run` */
type TurnFrame={x:number;z:number;yaw0:number;run:[number,number];build:Build};
function turnPlace(fr:TurnFrame,u:number):Place{
 const yaw=fr.yaw0+Math.PI*sm(.8,1,u,easeIO),base:Place={x:fr.x,z:fr.z,yaw};
 const lockAt=(uu:number):Place=>{const b:Place={x:fr.x,z:fr.z,yaw:fr.yaw0+Math.PI*sm(.8,1,uu,easeIO)},w=sm(.24,.34,uu);if(w<=0)return b;
  const anchor=solve(turnPose(.3),fr.build,{x:fr.x,z:fr.z,yaw:fr.yaw0}).lAn,sk=solve(turnPose(uu),fr.build,b);return{x:(b.x??0)+(anchor[0]-sk.lAn[0])*w,z:(b.z??0)+(anchor[2]-sk.lAn[2])*w,yaw:b.yaw};};
 if(u<=.86)return u<=.24?base:lockAt(u);
 const L=lockAt(.86),e=sm(.86,1,u);return{x:(L.x??0)+fr.run[0]*.35*e,z:(L.z??0)+fr.run[1]*.35*e,yaw};
}
/** where the ball sits against the INSIDE of the right boot (horizontal inside normal of the foot), read from the solved skeleton */
function attach(fr:TurnFrame,u:number):V3{const sk=solve(turnPose(u),fr.build,turnPlace(fr,u)),Ft=sk.fr.rFt,[ix,iz]=n2(-Ft[2],-Ft[8]);
 return[(sk.rAn[0]+sk.rToe[0])/2+ix*.16,BALL_R,(sk.rAn[2]+sk.rToe[2])/2+iz*.16];}
/** release velocity of the drag and the run direction that follows it (half the ball's roll, half straight back the way he faced) */
function releaseOf(fr:TurnFrame,moveD:number){const a=attach(fr,U_R-.04),b=attach(fr,U_R),v:V3=mul(sub(b,a),1/(.04*moveD));const bk=dirOf(fr.yaw0+Math.PI),rv=n2(v[0],v[2]);return{at:b,v,run:n2(rv[0]*.5+bk[0]*.5,rv[1]*.5+bk[1]*.5)};}
const FR0:TurnFrame={x:C0[0],z:C0[1],yaw0:Y0,run:[0,0],build:CB};
const REL0=releaseOf(FR0,MOVE_D);FR0.run=REL0.run;
const D1=REL0.run,YRUN=YAW(D1[0],D1[1]);
const B0:V3=attach(FR0,U_C);// the ball's resting spot, beside the planted foot
const TM0=-U_C*MOVE_D,TM1=TM0+MOVE_D,T_REL=TM0+U_R*MOVE_D;
const PEND=turnPlace(FR0,1);
const runDist=(s:number)=>s<=0?0:7*s-2.7*(1-Math.exp(-s/.6)),runV=(s:number)=>7-4.5*Math.exp(-Math.max(0,s)/.6);

// ---- the live clock: τ = 0 lands on the cue word "then" (the drag), the pass out to Cruyff arrives just after "has the ball" ----
const TL=T(0,'then')+.05;
const TAU_R=clamp(T(0,'has the ball')+.35-TL,-7.5,-3.2);// Cruyff controls the ball
const CR=W0(-2.0,.15);// where he receives (goal-side of the turn spot; he then shields and drifts away from goal)
const PASSER_TO:[number,number]=[-31,-13.2];
const DIR_P=n2(PASSER_TO[0]-CR[0],PASSER_TO[1]-CR[1]),Y_REC=YAW(DIR_P[0],DIR_P[1]);
const RECV:V3=[CR[0]+DIR_P[0]*.45,BALL_R,CR[1]+DIR_P[1]*.45];
const TAU_P=TAU_R-Math.hypot(PASSER_TO[0]-CR[0],PASSER_TO[1]-CR[1])/13;
const PASSER:MKey[]=[[TAU_P-8,-47,-4],[TAU_P-4,-39,-8.5],[TAU_P,PASSER_TO[0],PASSER_TO[1]],[TAU_P+2.2,-27.5,-15.5],[TAU_P+7,-22,-17]];
const TRAP=posed({lHipF:22,lKnee:34,rHipF:24,rKnee:30,rHipR:30,rAnk:-6,lean:14,pitch:3,lShA:40,rShA:34,lElb:40,rElb:40,neckP:36});
const shieldPos=(tau:number):[number,number]=>{const u=sm(TAU_R+.5,TM0,tau,easeInOutSine);return[lerp(CR[0],C0[0],u),lerp(CR[1],C0[1],u)];};
const CRUYFF_SEGS:[number,(t:number)=>St][]=[
 [-99,t=>runner([[TAU_R-7,CR[0]+4.5,CR[1]-3.5],[TAU_R-1.4,CR[0]+.7,CR[1]-.3],[TAU_R-.25,CR[0],CR[1]]],t,[PASSER_TO[0],0,PASSER_TO[1]])],
 [TAU_R-.25,t=>({pose:blendPose(stand(),TRAP,sm(TAU_R-.25,TAU_R+.05,t)),place:{x:CR[0],z:CR[1],yaw:Y_REC}})],
 [TAU_R+.5,t=>{const[x,z]=shieldPos(t);return{pose:blendPose(SHIELD,dribble(t*1.3,{foot:'r',speed:.2}),.45*(1-sm(TM0-.4,TM0,t))),place:{x,z,yaw:lerpAng(Y_REC,Y0,sm(TAU_R+.5,TAU_R+1.3,t))}};}],
 [TM0,t=>{const u=(t-TM0)/MOVE_D;return{pose:turnPose(u),place:turnPlace(FR0,u)};}],
 [TM1,t=>{const s=t-TM1,d=runDist(s),sp=clamp(runV(s)/8);return{pose:blendPose(turnPose(1),runCycle(.35+d/(2.2+2.4*sp),{speed:sp}),sm(0,.25,s)),place:{x:(PEND.x??0)+D1[0]*d,z:(PEND.z??0)+D1[1]*d,yaw:lerpAng(Y0+Math.PI,YRUN,sm(0,.4,s))}};}],
];
const cruyffAt=(tau:number)=>segAt(CRUYFF_SEGS,tau);

// ---- the ball ----
function ballAt(tau:number):V3{
 if(tau<TAU_P){const q=pathPos(PASSER,tau),v=Math.hypot(q.vx,q.vz)||1,tap=.35+.3*Math.abs(Math.sin(q.dist*.9));return[q.x+q.vx/v*tap,BALL_R,q.z+q.vz/v*tap];}
 if(tau<TAU_R){const a=ballAt(TAU_P-1e-3),u=(tau-TAU_P)/(TAU_R-TAU_P),e=1-Math.pow(1-u,1.35);return[lerp(a[0],RECV[0],e),BALL_R,lerp(a[2],RECV[2],e)];}
 if(tau<TM0+.3*MOVE_D){const[x,z]=shieldPos(tau),sh=tau>TAU_R+.5?Y0:Y_REC,f=dirOf(lerpAng(Y_REC,sh,sm(TAU_R+.5,TAU_R+1.3,tau))),r=rightOf(Y0),wob=.06*Math.sin(tau*4.1);
  const carry:V3=[x+f[0]*.44+r[0]*(.08+wob),BALL_R,z+f[1]*.44+r[1]*(.08+wob)];return mix3(mix3(RECV,carry,sm(TAU_R,TAU_R+.6,tau)),B0,sm(TM0-.5,TM0+.2*MOVE_D,tau));}
 if(tau<0)return B0;
 if(tau<T_REL)return attach(FR0,U_C+(tau/(T_REL))*(U_R-U_C));
 const s=tau-T_REL,k=2.2,roll:V3=add(REL0.at,mul([REL0.v[0],0,REL0.v[2]],(1-Math.exp(-k*s))/k));
 if(tau<TM1)return roll;
 const rs=tau-TM1,d=runDist(rs),n=d/2.4,kk=Math.floor(n),bd=2.4*(kk+easeOut(n-kk))+.85,drib:V3=[(PEND.x??0)+D1[0]*bd,BALL_R,(PEND.z??0)+D1[1]*bd];
 return mix3(roll,drib,sm(0,.5,rs));
}

// ---- Jan Olsson: tight on Cruyff's right shoulder, goal-side; commits to the fake (lunges into the pass lane), turns too late ----
const O_OFF=(x:number,z:number):[number,number]=>[x-F0[0]*1.55+R0[0]*.7,z-F0[1]*1.55+R0[1]*.7];
const TL0=TM0+.4*MOVE_D;// he reads the wind-up and goes for the pass
const OL_LUNGE=(tau:number)=>key(tau,[[TL0,0],[TL0+.45,.6],[TL0+1.15,1]],x=>x);
/** he turns to his LEFT (the way Cruyff went), a positive yaw sweep */
const OL_TURN=(((YRUN-Y0)%TAU)+TAU)%TAU;
const OL_BASE=O_OFF(C0[0],C0[1]),OL_END:[number,number]=[OL_BASE[0]+F0[0]*.8-R0[0]*.15,OL_BASE[1]+F0[1]*.8-R0[1]*.15];
const OLSSON_SEGS:[number,(t:number)=>St][]=[
 [-99,t=>{const m=O_OFF(CR[0],CR[1]);return runner([[TAU_R-7,m[0]+5,m[1]-2],[TAU_R-.9,m[0]+.9,m[1]-.2],[TAU_R+.1,m[0],m[1]]],t,[CR[0],0,CR[1]],backpedal(0));}],
 [TAU_R+.1,t=>{const[x,z]=shieldPos(t),[ox,oz]=O_OFF(x,z),mv=sm(TAU_R+.5,TM0,t)*(1-sm(TM0-.5,TM0,t));return{pose:blendPose({...backpedal(t*1.6),lean:30*D2R,neckP:-6*D2R},runCycle(t*1.2,{speed:.15}),.4*mv),place:{x:ox,z:oz,yaw:Y0}};}],
 [TL0,t=>{const u=sm(TL0,TL0+.6,t,easeOut);return{pose:lunge(OL_LUNGE(t),{side:'l'}),place:{x:lerp(OL_BASE[0],OL_END[0],u),z:lerp(OL_BASE[1],OL_END[1],u),yaw:Y0-14*D2R}};}],
 [TL0+1.15,t=>{const u=sm(TL0+1.15,TL0+1.9,t,easeIO),s=t-(TL0+1.7),d=s>0?5.2*s-3.2*(1-Math.exp(-s/.8)):0;
  return{pose:blendPose(blendPose(lunge(1,{side:'l'}),{...stand(),neckP:-10*D2R,neckY:40*D2R},sm(TL0+1.15,TL0+1.5,t)),runCycle(d/2.6,{speed:clamp(.3+s*.35,.3,.75)}),sm(TL0+1.6,TL0+1.9,t)),
   place:{x:OL_END[0]+D1[0]*d,z:OL_END[1]+D1[1]*d,yaw:Y0-14*D2R+(OL_TURN+14*D2R)*u}};}],
];
const olssonAt=(tau:number)=>segAt(OLSSON_SEGS,tau);

// ---- everybody else (illustrative: who stood where is not documented) ----
type Actor={style:AthleteStyle;at:(tau:number,ball:V3)=>St};
const mover=(style:AthleteStyle,p:MKey[],idle?:Pose):Actor=>({style,at:(t,b)=>runner(p,t,b,idle)});
const ACTORS:Actor[]=[
 mover(NED({seed:5}),PASSER),// the Dutch team-mate who plays the ball out to Cruyff
 mover(NED({seed:6,hairStyle:'curly'}),([[-14,-18,-2],[-3,-12,-6],[1,-9.5,-8.5],[4,-7,-10]])),// a striker drifting to the near post
 mover(NED({seed:7}),([[-14,-26,6],[-3,-17,2],[2,-13,-1],[4,-11,-3]])),// a runner from midfield
 mover(NED({seed:8,hairStyle:'long'}),([[-14,-44,-18],[-3,-33,-22],[4,-28,-24]])),// the overlapping full-back, behind the play
 mover(SWE({seed:40}),([[-14,-15,-3],[-3,-10,-6.5],[1,-8,-8],[4,-6,-9.5]]),backpedal(0)),// centre-back on the striker
 mover(SWE({seed:41}),([[-14,-20,4],[-3,-13,1],[2,-10,-1.5],[4,-9,-3]]),backpedal(0)),// the other centre-back
 mover(SWE({seed:42}),([[-14,-32,-6],[-3,-25,-14],[1,-22,-17.5],[4,-18,-19]])),// a midfielder closing the passer
 mover(REF,([[-14,-38,-2],[-3,-29,-8],[4,-23,-11]])),// the referee
 {style:KEEPER,at:(t,b)=>{const z=clamp(b[2]*.14,-2.2,2.2);return{pose:keeperSet(t*1.4),place:{x:-1.1,z,yaw:YAW(b[0]+1.1,b[2]-z)}};}},// Sweden's keeper
];
type Item={depth:number;draw:()=>void};
/** everyone and the ball at τ, depth sorted. `hero` draws Cruyff and Olsson with secondary motion (+ smear on Cruyff's fast feet). */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;prevDt?:number;cap?:boolean;smear?:boolean;others?:boolean}){
 const ball=ballAt(tau),bp=ballAt(tp),items:Item[]=[],dt=o.prevDt??1/12;
 const put=(style:AthleteStyle,st:St,prev?:St,smear=false,low=false)=>{const g:V3=[st.place.x??0,0,st.place.z??0],d=depthOf(c,g);if(d<1)return;const[x,y]=P(c,g),kk=kAt(c,g);if(Math.abs(x)>s.W*.62+kk*1.5||y<-s.H*.6||y>s.H*.6+2.2*kk)return;
  items.push({depth:d,draw:()=>drawPlayer(s,st.pose,c,style,st.place,{prev,smear,detail:low?'low':'auto',cap:o.cap?(low?'low':'mid'):undefined})});};
 if(o.others!==false)for(const a of ACTORS)put(a.style,a.at(tp,bp),undefined,false,!o.hero);
 const moving=tp>TM0+.25*MOVE_D&&tp<TM1+.6;
 put(OLSSON,olssonAt(tp),olssonAt(tp-dt));
 put(CRUYFF,cruyffAt(tp),cruyffAt(tp-dt),(o.smear??true)&&moving);
 items.push({depth:depthOf(c,ball),draw:()=>{const a=P(c,ballAt(tau-.03)),q=P(c,ball),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,ball));ballShadow(s,c,ball);
  ball_(s,q[0],q[1],r,tau,sp,dx,dy);}});
 items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
 return{ball};}
const ball_=(s:Sheet,x:number,y:number,r:number,tau:number,sp:number,dx:number,dy:number)=>ball(s,x,y,r,spinAt(tau),{sq:clamp(sp/(r*4),0,.5),dir:Math.atan2(dy,dx)});
/** ball spin: rolls with its distance travelled */
const spinAt=(tau:number)=>{const a=ballAt(tau-.1),b=ballAt(tau);return tau*1.3+Math.hypot(b[0]-a[0],b[2]-a[2])*20;};

// ================= chapter 1 (LIVE, real time): the high main-stand camera; the ball comes out to Cruyff, the fake, the turn, gone =================
const BCAM:V3=[-27,13,-74];
function ch1Look(tau:number):V3{const b=ballAt(tau),c=cruyffAt(tau).place;
 const w=sm(TAU_P,TAU_R,tau)*(1-sm(TM1,TM1+2,tau)*.4);return[lerp(b[0],c.x??0,w*.35)+2.5*sm(TM1-.3,TM1+1.4,tau),3.4,lerp(b[2],c.z??0,w*.35)];}// aimed above the play so the crowd fills the top of the frame
function ch1Cam(t:number){const tau=t-TL,a=ch1Look(tau),b=ch1Look(tau-.3),c=ch1Look(tau-.6),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const push=1+.08*sm(T(0,'Johan Cruyff'),T(0,'Johan Cruyff')+1.2,t)+.1*sm(T(0,'right behind him'),T(0,'right behind him')+1.4,t)-.08*sm(T(0,'gone')-.2,T(0,'gone')+1,t);
 const F=key(tau,[[-14,3900],[TAU_P-1,4300],[TAU_R,5400],[TM0-1.2,7000],[TM1+.4,7000],[TM1+2,6000]])*push;return cam(BCAM,look,F);}
const ch1:Scene={
 draw(s,t){const tt=twos(t),c=ch1Cam(t),gone=T(0,'gone');frame(s);
  stadium(s,c,{t,cheer:.2+.5*sm(0,.8,t)*(1-sm(1.5,3,t))+1.1*sm(T(0,'suddenly'),gone+.3,t),flash:.15+1.2*sm(T(0,'suddenly'),gone+.2,t),
   wave:sm(T(0,'in orange'),T(0,'in orange')+.5,t)*(1-.6*sm(T(0,'On the left'),T(0,'On the left')+1,t))+sm(gone-.3,gone+.3,t),swe:sm(T(0,'play Sweden'),T(0,'play Sweden')+.5,t)*(1-.7*sm(T(0,'On the left'),T(0,'On the left')+1,t))});
  drawWorld(s,c,t-TL,tt-TL,{ballMin:12,cap:busy(0,t)});},
 aperture(t){const c=ch1Cam(t),p=ballAt(t-TL),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(12,BALL_R*kAt(c,p))*.95,12);},
 still:11,
};

// ================= chapter 2 (TV slow-motion replay, low and close on the feet) =================
const ch2T=()=>({w:T(1,'Watch it slowly'),f:T(1,'Cruyff fakes'),p:T(1,'the pass'),i:T(1,'inside of his foot'),d:T(1,'drag the ball'),b:T(1,'behind his standing leg'),sp:T(1,'spins round'),a:T(1,'speeds away'),o:T(1,'Olsson goes'),wr:T(1,'the wrong way'),end:SEC(1)});
const tau2=(t:number)=>{const q=ch2T();return key(t,mono([[0,TM0-1.1],[q.f,TM0+.2*MOVE_D],[q.p+.35,TM0+.5*MOVE_D],[q.i+.3,-.06],[q.d+.2,.05],[q.b+.6,T_REL-.02],[q.sp+.6,TM0+.97*MOVE_D],[q.a+.6,TM1+.7],[q.o+.4,TM1+1.05],[q.wr+.5,TM1+1.35],[q.end,TM1+1.8]]),x=>x);};
function ch2Cam(t:number){const q=ch2T(),tau=tau2(t),cr=cruyffAt(tau).place,ol=olssonAt(tau).place,b=ballAt(tau);
 const a=key(t,mono([[0,48],[q.f,54],[q.i,62],[q.b+.3,84],[q.sp+.4,98],[q.o,112],[q.end,122]]))*D2R;
 const toO=sm(q.o-.3,q.o+.6,t,easeIO)*(1-.35*sm(q.wr+.5,q.end,t));
 const focus:V3=mix3([lerp(cr.x??0,b[0],.45),.5,lerp(cr.z??0,b[2],.45)],[lerp(cr.x??0,ol.x??0,.55),.75,lerp(cr.z??0,ol.z??0,.55)],toO);
 const D=lerp(key(t,mono([[0,5.6],[q.i,4.9],[q.b+.4,4.7],[q.a,5.4],[q.end,5.9]])),7.2,toO),dir:[number,number]=[F0[0]*Math.cos(a)-R0[0]*Math.sin(a),F0[1]*Math.cos(a)-R0[1]*Math.sin(a)];
 const pos:V3=[focus[0]+dir[0]*D,.85+.25*toO,focus[2]+dir[1]*D],F=key(t,mono([[0,1450],[q.i,1650],[q.d,1750],[q.b+.4,1700],[q.a,1500],[q.end,1450]]));
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
const ch2:Scene={
 draw(s,t){const q=ch2T(),tt=twos(t),c=ch2Cam(t),tau=tau2(t),tp=tau2(tt),prevDt=tp-tau2(tt-1/12);frame(s);
  stadium(s,c,{t,cheer:.15,flash:.1});
  // "the pass": the fake pass lane Olsson is guarding, a dashed yellow line infield (in front of Cruyff, to his left); crossed out on the drag
  const lane=sm(q.p-.1,q.p+.6,tt,easeOut),laneOff=1-sm(q.b,q.sp,tt);
  if(lane>0&&laneOff>0){const a=W0(.9,-.1),b=W0(6,-1.3),pts:V3[]=[];for(let i=0;i<=12;i++){const u=i/12;pts.push([lerp(a[0],b[0],u),.02,lerp(a[1],b[1],u)]);}groundDash(s,c,pts,16,Y,31,{progress:lane,cov:.95*laneOff});
   if(lane>.95)arrowTip(s,Y,P(c,pts[10]),P(c,pts[12]),52,.95*laneOff);
   const x=sm(q.d,q.d+.4,tt,easeOutBack)*laneOff;if(x>.02){const m=P(c,pts[7]),r=46*x;s.fill(K,ribbon([[m[0]-r,m[1]-r],[m[0]+r,m[1]+r]],13,{seed:32}),.95);s.fill(K,ribbon([[m[0]+r,m[1]-r],[m[0]-r,m[1]+r]],13,{seed:33}),.95);}}
  // "behind his standing leg": a ring prints round the planted foot, and the drag path draws itself behind the heel
  const cr=cruyffAt(tp),skNow=solve(cr.pose,CB,cr.place),ringG=sm(q.b-.1,q.b+.35,tt,easeOutBack)*(1-sm(q.a,q.a+.6,tt));
  if(ringG>.02){const an=skNow.lAn;s.fill(O,ribbon(groundRing(c,an[0],an[2],.28*ringG,.2*ringG).map(p=>P(c,p)),10,{seed:34,close:true,wobble:1}),.95);}
  if(tp>0){const pts:V3[]=[];for(let i=0;i<=16;i++){const tk=Math.min(tp,T_REL+.25)*i/16;pts.push([...ballAt(tk)] as V3);}const fade=1-sm(q.a,q.a+.8,tt);if(fade>0)groundDash(s,c,pts.map(p=>[p[0],.02,p[2]] as V3),12,K,35,{cov:.9*fade,dash:.06});}
  // "spins round": a 180° arc prints on the grass round his standing foot, arrow first
  const spin=sm(q.sp-.1,q.sp+.7,tt,easeOut)*(1-sm(q.o,q.o+.6,tt));
  if(spin>.02){const an=skNow.lAn,pts:V3[]=[];for(let i=0;i<=18;i++){const a=Y0+Math.PI/2-(i/18)*Math.PI*spin,d=dirOf(a);pts.push([an[0]+d[0]*.75,.02,an[2]+d[1]*.75]);}const pp=pts.map(p=>P(c,p));s.fill(O,ribbon(pp,14,{seed:36,taper:.2,wobble:1}),.95);arrowTip(s,O,pp[pp.length-2],pp[pp.length-1],44);}
  // "inside of his foot": the halo round the kicking leg lights on the cue, the standing leg's in orange on "behind his standing leg"
  legHalo(s,c,cr.pose,cr.place,CB,'r',Y,sm(q.i-.1,q.i+.3,tt,easeOut)*(1-sm(q.b+.4,q.sp,tt)));
  legHalo(s,c,cr.pose,cr.place,CB,'l',O,sm(q.b-.1,q.b+.3,tt,easeOut)*(1-sm(q.sp,q.sp+.5,tt)),.6);
  drawWorld(s,c,tau,tp,{ballMin:20,hero:true,prevDt,cap:busy(1,t),smear:true});
  // the inside of the boot meets the ball: a yellow tick of contact
  if(tp>-.02&&tp<.12){const p=P(c,ballAt(tp));sparkBurst(s,Y,p[0],p[1],90+60*sm(-.02,.06,tp),{n:8,seed:37,g:1-sm(.06,.12,tp),width:10});}
  // "speeds away": speed lines behind him
  const away=sm(q.a-.1,q.a+.3,tt)*(1-sm(q.o+.3,q.wr,tt));if(away>.02){const a=cruyffAt(tp-.25).place,b=cr.place,pa=P(c,[a.x??0,1,a.z??0]),pb=P(c,[b.x??0,1,b.z??0]);speedLines(s,K,pb[0],pb[1],Math.atan2(pb[1]-pa[1],pb[0]-pa[0]),{n:5,seed:38,len:260,width:9,cov:.8*away});}
  // "the wrong way": a navy arrow under Olsson pointing where he went, and a blue wobble ring as he stops
  const wr=sm(q.wr-.1,q.wr+.5,tt,easeOut);if(wr>.02){const ol=olssonAt(tp).place,ox=ol.x??0,oz=ol.z??0,a:V3=[ox,.02,oz],b:V3=[ox+F0[0]*2.2*wr,.02,oz+F0[1]*2.2*wr];const pa=P(c,a),pb=P(c,b);s.fill(K,ribbon([pa,pb],14,{seed:39,taper:.1,wobble:1}),.9);arrowTip(s,K,pa,pb,46,.9);
   const ring=groundRing(c,ox,oz,.7+.1*Math.sin(tt*20)*(1-wr),.5);s.fill(B,ribbon(ring.map(p=>P(c,p)),9,{seed:40,close:true,wobble:1.5}),.9);}
 },
 aperture(t){const c=ch2Cam(t),p=ballAt(tau2(t)),[x,y]=P(c,p),r=Math.max(20,BALL_R*kAt(c,p));return apertureDisc(x,y,r*.92,12);},
 still:6.4,
};

// ================= chapter 3 (duotone lesson): fake the pass, drag behind the standing leg, turn away fast =================
const ch3T=()=>({g:T(2,'The game ended'),e:T(2,'everyone remembers'),c:T(2,'the Cruyff turn'),f:T(2,'Fake the pass'),d:T(2,'drag the ball'),b:T(2,'behind your standing leg'),ta:T(2,'turn away'),fa:T(2,'fast'),end:SEC(2)});
const FR3:TurnFrame={x:0,z:0,yaw0:0,run:[0,0],build:CB};
const L_MOVE=2.4;// nominal lesson move length (seconds) used for the release velocity only
const REL3=releaseOf(FR3,L_MOVE);FR3.run=REL3.run;
const B3:V3=attach(FR3,U_C),PEND3=turnPlace(FR3,1),YRUN3=YAW(REL3.run[0],REL3.run[1]);
/** lesson move time u(t), keyed on the cue words (slow, clear, with holds) */
const u3=(t:number)=>{const q=ch3T();return key(t,mono([[0,0],[q.f-.1,0],[q.f+.45,.3],[q.f+.95,.5],[q.d+.1,U_C],[q.b+.7,U_R],[q.ta-.05,.8],[q.ta+.6,1]]),x=>x);};
const run3=(t:number)=>{const q=ch3T();return Math.max(0,t-(q.ta+.6));};
function lesson(t:number):{st:St;ball:V3;u:number}{
 const u=u3(t),s=run3(t);
 if(s<=0){const place=turnPlace(FR3,u),pose=u<=0?blendPose(SHIELD,dribble(t*.9,{foot:'r',speed:.12}),.35):turnPose(u);
  let b:V3=B3;if(u>U_C&&u<U_R)b=attach(FR3,u);else if(u>=U_R){const e=(u-U_R)/(1-U_R);b=add(REL3.at,mul([REL3.run[0],0,REL3.run[1]],.55*easeOut(e)));}
  return{st:{pose,place},ball:b,u};}
 const d=runDist(s*.9),sp=clamp(runV(s*.9)/8),place:Place={x:(PEND3.x??0)+REL3.run[0]*d,z:(PEND3.z??0)+REL3.run[1]*d,yaw:lerpAng(Math.PI,YRUN3,sm(0,.4,s))};
 const n=d/2.4,k=Math.floor(n),bd=2.4*(k+easeOut(n-k))+.85,b0=add(REL3.at,mul([REL3.run[0],0,REL3.run[1]],.55));
 return{st:{pose:blendPose(turnPose(1),runCycle(.35+d/(2.2+2.4*sp),{speed:sp}),sm(0,.25,s)),place},ball:mix3(b0,[(PEND3.x??0)+REL3.run[0]*bd,BALL_R,(PEND3.z??0)+REL3.run[1]*bd],sm(0,.4,s)),u:1};
}
/** the ghost defender behind him (Olsson's shape, halftone): bites on the fake, lunges into the pass lane, left standing */
const G3:[number,number]=[-1.3,1.2];
function ghost(t:number):St{const q=ch3T(),u=key(t,mono([[q.f+.4,0],[q.f+1,.6],[q.d+.6,1]]),x=>x),slide=sm(q.f+.4,q.f+1.2,t,easeOut),turn=sm(q.fa,q.fa+1,t,easeIO);
 const base=blendPose({...backpedal(t*1.1),lean:28*D2R},lunge(u,{side:'l'}),sm(q.f+.3,q.f+.5,t));
 return{pose:blendPose(base,{...stand(),neckY:40*D2R},turn*.6),place:{x:G3[0]+.6*slide,z:G3[1]-.2*slide,yaw:-14*D2R+turn*1.2}};}
const ch3:Scene={
 draw(s,t){const q=ch3T(),tt=twos(t),L=lesson(tt),Lp=lesson(tt-1/12),cap=busy(2,t);
  // camera: a low front three-quarter from his left; push in for the fake and the drag, swing wider for the turn, follow him away
  const s3=run3(t),runX=s3>0?lesson(t).st.place:null;
  const v=key(t,mono([[0,5.2,1.4,1350],[q.e,4.9,1.3,1400],[q.f,4.3,1.15,1600],[q.d,3.8,.95,1850],[q.b+.6,3.9,.95,1800],[q.ta,4.8,1.2,1500],[q.end,6.2,1.45,1350]]),easeIO,true);
  const fx=runX?lerp(0,(runX.x??0)*.7,1):0,fz=runX?(runX.z??0)*.7:0,az=key(t,mono([[0,52],[q.f,62],[q.d,74],[q.b+.8,76],[q.ta,60],[q.end,44]]))*D2R;
  const c=cam([fx+Math.cos(az)*v[0],v[1],fz-Math.sin(az)*v[0]],[fx+.05,lerp(.9,.55,sm(q.f,q.d,t))*(1-sm(q.ta,q.end,t)*.1),fz],v[2]);frame(s);
  // the print: an orange sky stepped in bands, a navy floor with a stepped light pool, paper chalk circle round the move
  s.field(O,.32,.6);
  const hz=P(c,[c.eye[0]+c.f[0]*1e4,0,c.eye[2]+c.f[2]*1e4])[1],Bn=Math.max(s.W,s.H)*1.6;
  for(let i=0;i<4;i++)s.tone(O,polyPath([[-Bn,hz-120-i*170],[Bn,hz-120-i*170],[Bn,hz-40],[-Bn,hz-40]],true),.18);
  const floor=new Path2D();addPoly(floor,clipPoly(c,[[-40,0,-40],[40,0,-40],[40,0,40],[-40,0,40]]));s.knockout(floor);s.fill(K,floor,.72);
  const pool=(r:number)=>{const pa=new Path2D();addPoly(pa,clipPoly(c,groundRing(c,0,0,r,r*.9,40)));return pa;};
  s.knockout(pool(3.2),.55);s.tone(O,pool(3.2),.25);s.tone(O,pool(1.8),.3);
  // "everyone remembers": flashbulbs pop round the print; "the Cruyff turn": stamp rings print round him
  const fl=sm(q.e,q.e+.3,tt)*(1-sm(q.c+.6,q.f,tt));if(fl>.02){const fp=new Path2D(),r=rng(900+Math.floor(tt*6));for(let i=0;i<9;i++){const x=(r()-.5)*1400,y=hz-80-r()*420,sz=16+r()*20;fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));}s.knockout(fp,fl);}
  const stamp=sm(q.c,q.c+.5,tt,easeOutBack)*(1-sm(q.f-.2,q.f+.3,tt));if(stamp>.02)for(let i=0;i<3;i++)s.fill(O,ribbon(groundRing(c,0,0,(.9+i*.45)*stamp,(.8+i*.4)*stamp,32).map(p=>P(c,p)),12-i*3,{seed:50+i,close:true,wobble:1.2}),.95);
  // "Fake the pass": the pass lane prints ahead of him (dashed, orange) and the ghost defender bites; crossed out on "drag the ball"
  const lane=sm(q.f+.2,q.f+.9,tt,easeOut),laneOff=1-sm(q.ta,q.ta+.5,tt);
  if(lane>0&&laneOff>0){const pts:V3[]=[];for(let i=0;i<=12;i++){const u=i/12;pts.push([lerp(.9,4.6,u),.02,lerp(-.1,-.9,u)]);}groundDash(s,c,pts,18,O,52,{progress:lane,cov:.95*laneOff});if(lane>.95)arrowTip(s,O,P(c,pts[10]),P(c,pts[12]),58,.95*laneOff);
   const x=sm(q.d,q.d+.4,tt,easeOutBack)*laneOff;if(x>.02){const m=P(c,pts[6]),r=54*x;s.knockout(ribbon([[m[0]-r,m[1]-r],[m[0]+r,m[1]+r]],22,{seed:53}));s.knockout(ribbon([[m[0]+r,m[1]-r],[m[0]-r,m[1]+r]],22,{seed:54}));s.fill(K,ribbon([[m[0]-r,m[1]-r],[m[0]+r,m[1]+r]],14,{seed:53}));s.fill(K,ribbon([[m[0]+r,m[1]-r],[m[0]-r,m[1]+r]],14,{seed:54}));}}
  // "drag the ball": the ball's path behind the heel (paper dashes) with an arrow; "behind your standing leg": a ring under the planted foot
  const drag=sm(q.d,q.b+.7,tt,x=>x);if(drag>0&&laneOff>0){const pts:V3[]=[];for(let i=0;i<=14;i++){const uu=U_C+(U_R-U_C)*i/14;const b=attach(FR3,uu);pts.push([b[0],.02,b[2]]);}
   const pp=pts.map(p=>P(c,p));const part=partial(pp,Math.max(.02,drag));s.knockout(ribbon(part,16,{seed:55,taper:.2,wobble:1}),.95);if(part.length>1)arrowTip(s,K,part[Math.max(0,part.length-2)],part[part.length-1],40,.95);}
  const sk=solve(L.st.pose,CB,L.st.place),ringG=sm(q.b-.1,q.b+.4,tt,easeOutBack)*(1-sm(q.ta+.3,q.fa+.4,tt));
  if(ringG>.02)s.fill(O,ribbon(groundRing(c,sk.lAn[0],sk.lAn[2],.3*ringG,.24*ringG).map(p=>P(c,p)),12,{seed:56,close:true,wobble:1}),.95);
  // "turn away": a 180° arc round the standing foot, drawn as he turns (paper on navy)
  const turn=sm(q.ta-.1,q.ta+.6,tt,easeOut)*(1-sm(q.fa+.6,q.end,tt));
  if(turn>.02){const an=solve(turnPose(.86),CB,turnPlace(FR3,.86)).lAn,pts:V3[]=[];for(let i=0;i<=20;i++){const a=Math.PI/2-(i/20)*Math.PI*turn,d=dirOf(a);pts.push([an[0]+d[0]*.95,.02,an[2]+d[1]*.95]);}
   const pp=pts.map(p=>P(c,p));s.fill(O,ribbon(pp,18,{seed:57,taper:.2,wobble:1}),.95);arrowTip(s,O,pp[pp.length-2],pp[pp.length-1],54);}
  // figures, depth sorted: the ghost defender, Cruyff (halos printed first so only their rims show round the legs), the ball
  const items:Item[]=[],gh=ghost(tt),ghp=ghost(tt-1/12);
  items.push({depth:depthOf(c,[gh.place.x??0,0,gh.place.z??0]),draw:()=>drawPlayer(s,gh.pose,c,OLSSON_DUO,gh.place,{prev:ghp,cap:cap?'mid':undefined})});
  items.push({depth:depthOf(c,[L.st.place.x??0,0,L.st.place.z??0]),draw:()=>{
   legHalo(s,c,L.st.pose,L.st.place,CB,'l',O,sm(q.b-.1,q.b+.3,tt,easeOut)*(1-sm(q.ta+.2,q.ta+.6,tt)),.95);
   legHalo(s,c,L.st.pose,L.st.place,CB,'r',Y,sm(q.d-.1,q.d+.3,tt,easeOut)*(1-sm(q.b+.2,q.b+.6,tt)),.9);
   drawPlayer(s,L.st.pose,c,CRUYFF_DUO,L.st.place,{prev:Lp.st,smear:L.u>.4||run3(tt)>0,cap:cap?'mid':undefined});}});
  items.push({depth:depthOf(c,L.ball)-.05,draw:()=>{const p=P(c,L.ball),r=Math.max(22,BALL_R*kAt(c,L.ball));ballShadow(s,c,L.ball,.4);ball(s,p[0],p[1],r,tt*1.5+(L.u>U_C?(L.u-U_C)*14:0));}});
  items.sort((a,b)=>b.depth-a.depth).forEach(i=>i.draw());
  // "fast": speed lines trail him as he sprints away
  const fa=sm(q.fa-.05,q.fa+.3,tt);if(fa>.02){const a=lesson(tt-.2).st.place,b=L.st.place,pa=P(c,[a.x??0,1,a.z??0]),pb=P(c,[b.x??0,1,b.z??0]);speedLines(s,K,pb[0],pb[1],Math.atan2(pb[1]-pa[1],pb[0]-pa[0]),{n:6,seed:58,len:300,width:10,cov:.85*fa});
   sparkBurst(s,O,pb[0],pb[1],160*easeOut(sm(q.fa,q.fa+.3,tt)),{n:9,seed:59,g:1-sm(q.fa+.3,q.fa+.8,tt),width:12});}
 },
 still:7,
};

const story:RisoStory={
 id:'cruyff-turn-1974',format:'11v11',title:'The Cruyff turn, 1974',
 theme:'Fake the pass, drag the ball behind your standing leg, and turn away fast.',
 ageNote:'World Cup group match, Netherlands 0–0 Sweden, Westfalenstadion, Dortmund, 19 June 1974. Johan Cruyff turned Swedish defender Jan Olsson.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',blue:'#0078bf',navy:'#22366b'},order:['yellow','orange','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3]);},
 /** Touch: the ball is dragged back behind a little orange heel mark and spins away with a 180° arc. Reduced motion: the ball and the arc, still. */
 touch(s,x,y,age,seed){
  const u=age<=0?1:easeOut(clamp(age/.5)),r=46,a0=hash(seed,2)*TAU,arc:Pt[]=[];for(let i=0;i<=16;i++){const a=a0+i/16*Math.PI*u;arc.push([x+Math.cos(a)*r*2.2,y+Math.sin(a)*r*1.1]);}
  s.fill(O,ribbon(arc,12,{seed,taper:.2,wobble:1}),.95);if(arc.length>1)arrowTip(s,O,arc[arc.length-2],arc[arc.length-1],34);
  s.fill(K,polyPath(blob(x,y+r*.9,r*1.1,r*.25,seed+1,{n:16}),true),.3);
  const e=arc[arc.length-1];ball(s,lerp(x,e[0],u*.5),lerp(y,e[1],u*.5),r,age*9+hash(seed,3)*TAU,{sq:age>0?.14*Math.max(0,1-age*4):0});
  if(age>0&&age<.5)sparkBurst(s,Y,x,y,110*easeOutBack(clamp(age/.2)),{n:8,seed,g:1-clamp(age/.5),width:10});
 },
};
export default story;
