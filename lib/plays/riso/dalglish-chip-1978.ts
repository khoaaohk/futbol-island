/** Iconic play film: Kenny Dalglish's chip, 1978 European Cup final, Club Brugge 0–1 Liverpool, Wembley Stadium, London, 10 May 1978 —
 * the only goal, 64th minute (Liverpool Echo: 65th).
 * A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration text: public/plays/narration/dalglish-chip-1978/script.json. The voice is generated later by the lead (local Kokoro). Until then
 * every chapter runs on provisional cue times (≈2.6 words/s, see prov()). EVERY action time is read from cue onsets and chapter seconds,
 * so once timing.json exists, `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/dalglish-chip-1978/timing.json exists, replace `null` in `const VOICE` below with the imported timing
 *   import timingJson from '../../../public/plays/narration/dalglish-chip-1978/timing.json';   (and pass `timingJson as NarrationTiming`).
 *
 * SOURCES (read Sept 2026; written accounts and one press photograph, we cannot watch the footage):
 *  - Wikipedia, "1978 European Cup final" (raw wikitext: match account citing The Guardian and Hale; football box; kit boxes citing the
 *    Liverpool Echo line-ups)  https://en.wikipedia.org/wiki/1978_European_Cup_final
 *  - Liverpool Echo, "Liverpool 1, FC Bruges 0" (match report, 11 May 1978, web archive)
 *    https://www.liverpoolecho.co.uk/sport/football/football-news/liverpool-1-fc-bruges-0-3532377
 *  - UEFA.com, "1977/78: Dalglish keeps Reds on top" (web archive)
 *  - Central Press / Hulton Archive photograph (Getty 55321416), caption "Kenny Dalglish of Liverpool watches apprehensively after chipping
 *    the ball past FC Bruges goalkeeper Birger Jensen" — taken low from behind the goal line beside a post
 *  - Wikimedia Commons kit image Kit_body_fcb7778a.png (Brugge's shirt in the Wikipedia kit box)
 * CONFIRMED by those accounts: 10 May 1978, Wembley, kick-off 19:15 BST, 92,500, referee Charles Corver (Netherlands); 0–0 at half-time;
 *  Heighway had come on for Case (63'); in the 64th minute a ball from the right was PUNCHED OUT BY JENSEN and fell to SOUNESS, whose PASS
 *  sent DALGLISH racing on to the ball in the box; "ANGLED AND COVERED BY JENSEN", Dalglish "WITH COMMENDABLE CALM FLIPPED THE BALL OVER THE
 *  GOALKEEPER" (Echo), "placed his shot over a DIVING Jensen" (Wikipedia); the photograph shows the chip from a TIGHT ANGLE near the byline,
 *  Jensen DOWN ON THE GROUND, a Brugge defender chasing behind Dalglish, advertising boards and a fence round the pitch edge; nine-tenths of
 *  the crowd wore Liverpool colours (Echo). KITS: Liverpool ALL RED with a WHITE V-NECK and WHITE CUFFS (short sleeves in the photograph);
 *  Brugge WHITE SHIRTS with a BLUE-AND-BLACK V-NECK, WHITE SHORTS, WHITE SOCKS. Dalglish 7, Souness 11, McDermott 10, Fairclough 9,
 *  Kennedy 5, Heighway 12; Jensen 1. The hurdle over the advertising boards to celebrate is from the brief (widely told; not in the pages read).
 * INFERRED / ILLUSTRATIVE: every position, run and timing in metres and seconds; which end of Wembley and the direction of play on screen;
 *  the SIDE: the photograph (post and net at its left, taken behind the line) puts Dalglish on HIS LEFT of the goal (the −z side here); his
 *  SHOOTING FOOT (right, which the photo's follow-through suits — not narrated); the cross coming from McDermott on the right; where Souness
 *  controlled and passed; Jensen's rush and which way he went down (to his right); the chaser (drawn as No. 4, not named); the other players'
 *  positions; Jensen's kit (a pale top and dark shorts in the black-and-white photo; drawn pale grey), the referee's black; the white ball;
 *  the evening light at ~20:25 BST with floodlights on; Wembley as drawn (the dog track, roofed stands, the twin towers); the boards' designs
 *  (plain blocks, no brands); which boards he hurdled and his celebration; camera placements and lenses.
 *
 * STRUCTURE (the user's standard: a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): the play is ONE
 * simulation on a real clock τ (seconds, τ = 0 Souness's pass): ch1 = the high main-stand broadcast camera, near real time (the cross, the
 * punch, Souness's pass, Dalglish in, the keeper comes out, the chip, goal); ch2 = the slow-motion replay low from behind the goal line beside
 * the post (the photographer's angle: the keeper rushes out, Dalglish waits, the keeper goes down, the ball lifted over him); ch3 = a low
 * track-side replay (the ball drops in, Dalglish races away and hurdles the advertising boards); ch4 = the lesson on a low side camera (be
 * patient, wait for the keeper to go down, lift it over). Seams are forward passages into the ball. Figures: lib/plays/riso/athlete.ts through
 * ONE adapter, drawPlayer(). Inks: yellow (evening glow, lamps, teaching marks), red (Liverpool, the red crowd, skin, cinder track), blue (sky,
 * grass with yellow), navy (key line, boards). Scenes read only their local t; figures pose on twos, cameras on ones; all randomness is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,linear,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,laneArrow,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,posed,blendPose,keyPoses,clampPose,runCycle,dribble,stand,strike,backpedal,lunge,celebrate,keeperSet,keeperDive,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type Camera,type Place,type V3,type DrawResult} from './athlete';

const K='navy',R='red',Y='yellow',B='blue';
const D2R=Math.PI/180;
/** Frame the FULL sheet: world (dx,dy) lands on the sheet centre at `zoom`, ignoring the safe box (the card window is small). */
function frame(s:Sheet,zoom=1,dx=0,dy=0){const S=zoom*s.arrival;s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,zoom/s.fit,0);}

// ================= narration (script.json mirrors it) =================
/** Provisional cue onsets: ≈2.6 words/s plus sentence pauses; replaced by measured Kokoro onsets once timing.json exists. */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/2.6+(/[.!?]$/.test(w)?.4:/[,;:]$/.test(w)?.18:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`dalglish film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
import timingJson from '../../../public/plays/narration/dalglish-chip-1978/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Wembley, 1978','Wembley, 1978, the European Cup final: Liverpool, in red, against Club Brugge. Souness slides it through, and Kenny Dalglish is in! A tight angle, the keeper comes out, and... over him! Goal!',
  ['Wembley','the European Cup final','Liverpool','in red','against Club Brugge','Souness slides','Kenny Dalglish','is in','A tight angle','the keeper comes out','over him','Goal']),
 prov('Wait for it','Watch again, slowly. Keeper Jensen rushes out. Dalglish does not panic. He waits, and waits, until the keeper goes down, then lifts the ball gently over him.',
  ['Watch again','slowly','Keeper Jensen','rushes out','Dalglish does not panic','He waits','and waits','the keeper goes down','lifts the ball','over him']),
 prov('Over the boards','It drops in! Dalglish races away and hurdles the advertising boards!',
  ['It drops in','races away','hurdles','the advertising boards']),
 prov('Your turn','Your turn: be patient, wait for the keeper to go down, then lift it over.',
  ['Your turn','be patient','wait for the keeper','to go down','lift it over']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`dalglish film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a retime can never reorder a camera) */
function mono(K0:number[][]):Key[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});}

// ================= 3D helpers over athlete.ts cameras (right-handed, metres, y up; the goal Dalglish scores in is at x = 0, the pitch runs to x = −105) =================
const sub=(a:V3,b:V3):V3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const add=(a:V3,b:V3):V3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
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

// ================= Wembley, 1978, a May evening: roofed stands all round, the dog track, floodlights on, the twin towers, advertising boards =================
const CX=-52.5,NS=56;
/** a point on the bowl: angle th round the pitch centre, d metres out from the inner rim (a rounded-rectangle superellipse), height y */
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(63+d)*Math.sign(c)*Math.pow(Math.abs(c),.42),y,(46+d)*Math.sign(s)*Math.pow(Math.abs(s),.42)];}
const LOW=(b:number):[number,number]=>[1+21*b,1.2+10.5*b];
type Bowl={low:V3[][];back:V3[][];roof:V3[][];fascia:V3[][];lamps:V3[];seats:{P:V3;h:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],back:[],roof:[],fascia:[],lamps:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(d0:number,y0:number,d1:number,y1:number):V3[]=>[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];
  const[l0,h0]=LOW(0),[l1,h1]=LOW(1);o.low.push(Q(l0,h0,l1,h1));
  o.back.push([rim(a,22,11.6),rim(b,22,11.6),rim(b,22,21.5),rim(a,22,21.5)]);
  o.roof.push(Q(13,20.6,34,23.5));o.fascia.push(Q(13,19.4,13,20.7));
  for(let k=0;k<2;k++)o.lamps.push(rim((i+(k+.5)/2)/NS*TAU,12.8,20));
  for(let r=0;r<10;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7,23);if(h<.12)continue;const[d,y]=LOW((r+.5)/10);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 return o;})();
type Crowd={t:number;cheer?:number;flash?:number};
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{t,cheer=0,flash=0}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5,inV=(p:Pt,m=0)=>Math.abs(p[0])<Bnd+m&&Math.abs(p[1])<Bnd+m;
 // a May evening at ~20:25 BST, sun just down: a pale blue sky, a warm yellow band low down, a little darker overhead
 s.field(B,.34,.6);
 const hz=P(c,add(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))[1];
 s.tone(Y,polyPath([[-Bnd,hz-330],[Bnd,hz-380],[Bnd,hz+40],[-Bnd,hz+40]],true),.5);
 s.tone(K,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,hz-700],[-Bnd,hz-640]],true),.2);
 towers(s,c);
 const low=new Path2D(),back=new Path2D(),roof=new Path2D(),fas=new Path2D();
 for(let i=0;i<NS;i++){const ad=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};ad(BOWL.back[i],back);ad(BOWL.low[i],low);ad(BOWL.roof[i],roof);ad(BOWL.fascia[i],fas);}
 s.knockout(back);s.fill(K,back,.7);
 s.knockout(low);s.tone(B,low,.3);s.tone(K,low,.3);
 // the crowd: nine-tenths in Liverpool red (confirmed), white scarves and faces, Brugge blue, navy coats; bobbing when they cheer
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];let any=0;
 for(const q of BOWL.seats){const d=depthOf(c,q.P);if(d<16)continue;const p=P(c,q.P);if(!inV(p))continue;const z=clamp(c.F*.5/d,2,12),lift=cheer>0?cheer*z*1.2*Math.max(0,Math.sin(tt*11+q.h*TAU)):0;
  inks[q.h<.34?0:q.h<.78?1:q.h<.86?2:3].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);any++;}
 if(any){s.knockout(inks[0],.75);s.fill(R,inks[1],.9);s.fill(B,inks[2],.9);s.fill(K,inks[3],.8);}
 // the roof: dark underside, a lit fascia, and the line of floodlight lamps along its front edge
 s.knockout(roof);s.fill(K,roof,.82);
 s.knockout(fas);s.fill(Y,fas,.35);s.tone(K,fas,.3);
 const lamp=new Path2D(),glow=new Path2D();let nl=0;
 for(const L of BOWL.lamps){const d=depthOf(c,L);if(d<16)continue;const p=P(c,L);if(!inV(p))continue;const z=clamp(c.F*.45/d,2.5,10);lamp.rect(p[0]-z,p[1]-z*.6,z*2,z*1.2);glow.addPath(polyPath(Array.from({length:10},(_,k)=>[p[0]+Math.cos(k/10*TAU)*z*2.4,p[1]+Math.sin(k/10*TAU)*z*1.6] as Pt),true));nl++;}
 if(nl){s.tone(Y,glow,.22);s.knockout(lamp);s.fill(Y,lamp,.95);}
 // photographers' flashbulbs round the ground
 if(flash>0){const fp=new Path2D(),r=rng(900+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(20*flash);i++){const q=BOWL.seats[Math.floor(r()*BOWL.seats.length)];const d=depthOf(c,q.P);if(d<16)continue;const[x,y]=P(c,q.P),sz=clamp(c.F*1/d,8,22);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
}
/** Wembley's twin towers behind the far (west) end: white concrete shafts, domed tops and flagpoles, rising over the roof */
function towers(s:Sheet,c:Camera){
 const body=new Path2D(),dome=new Path2D(),win=new Path2D(),pole=new Path2D();let n=0;
 for(const z of[-11,11]){const base:V3=[-152,16,z];if(depthOf(c,base)<30)continue;const k=kAt(c,base),[x,y]=P(c,base);if(Math.abs(x)>s.W*1.2)continue;
  const top=P(c,[-152,31,z])[1],dt=P(c,[-152,39,z])[1],pt=P(c,[-152,45,z])[1],w=3.6*k;
  body.addPath(polyPath([[x-w,y],[x+w,y],[x+w*.9,top],[x-w*.9,top]],true));
  dome.addPath(polyPath([...Array.from({length:13},(_,i)=>{const a=Math.PI*i/12;return[x-Math.cos(a)*w*.86,top-(top-dt)*Math.sin(a)] as Pt;})],true));
  dome.rect(x-w*.95,top-.8*k,w*1.9,1.2*k);
  for(let j=0;j<3;j++){const yy=lerp(y,top,.3+j*.22);win.rect(x-w*.12,yy-1.6*k,w*.24,1.6*k);}
  pole.addPath(ribbon([[x,dt],[x,pt]],Math.max(1.5,.3*k),{taper:0,wobble:0}));n++;}
 if(!n)return;s.knockout(body);s.tone(Y,body,.15);s.knockout(dome);s.tone(B,dome,.3);s.tone(K,dome,.15);s.fill(K,win,.7);s.fill(K,pole,.9);
 s.stroke(K,body,3,.6);
}
// ---- advertising boards round the pitch edge (confirmed in the photograph; designs drawn as plain blocks, no brands) ----
const BX=4.2,BH=.8;
type Panel={q:V3[];kind:number;letters:V3[][];out:V3};
function panels(n:number,at:(u:number)=>V3,len:number,along:V3,out:V3,seed:number):Panel[]{
 const o:Panel[]=[];for(let i=0;i<n;i++){const a=at(i),b=add(a,[along[0]*len,0,along[2]*len]),up=(p:V3,h:number):V3=>[p[0],h,p[2]];
  const letters:V3[][]=[],nL=3+Math.floor(hash(i+seed,9)*3);for(let k=0;k<nL;k++){const u0=.1+.8*k/nL,u1=u0+.8/nL*.72,h0=.22,h1=hash(i*7+k+seed,5)<.3?.62:.56,p0=mix3(a,b,u0),p1=mix3(a,b,u1);letters.push([up(p0,h0),up(p1,h0),up(p1,h1),up(p0,h1)]);}
  o.push({q:[a,b,up(b,BH),up(a,BH)],kind:hash(i*13+seed,5)<.5?0:hash(i*13+seed,5)<.8?1:2,letters,out});}
 return o;}
const BYLINE:Panel[]=panels(12,i=>[BX,0,-36+6*i],5.9,[0,0,1],[1,0,0],3);
const TOUCH:Panel[]=[...panels(16,i=>[-108+7*i,0,-37.4],6.9,[1,0,0],[0,0,-1],11),...panels(16,i=>[-108+7*i,0,37.4],6.9,[1,0,0],[0,0,1],29)];
/** boards: a face in paper / navy / red with block lettering; from behind (outside the pitch) just the navy back */
function boards(s:Sheet,c:Camera,list:Panel[],o:{flash?:number}={}){
 const face=new Path2D(),dark=new Path2D(),red=new Path2D(),backs=new Path2D(),inkL=new Path2D(),holeL=new Path2D(),edge=new Path2D();let n=0;
 for(const p of list){const q=quadP(c,p.q,1.2);if(!q)continue;const xs=q.map(v=>v[0]),ys=q.map(v=>v[1]);if(Math.max(...xs)<-s.W*.8||Math.min(...xs)>s.W*.8||Math.max(...ys)<-s.H*.8||Math.min(...ys)>s.H*.8)continue;
  const path=polyPath(q,true),behind=dot(sub(c.eye,p.q[0]),p.out)>0;n++;
  if(behind){backs.addPath(path);continue;}
  face.addPath(path);edge.addPath(path);if(p.kind===1)dark.addPath(path);else if(p.kind===2)red.addPath(path);
  if(kAt(c,p.q[0])*BH>9)for(const L of p.letters){const lq=quadP(c,L,1.2);if(lq)(p.kind===0?inkL:holeL).addPath(polyPath(lq,true));}}
 if(!n)return;
 s.knockout(face);s.fill(K,dark,.92);s.fill(R,red,.9);s.fill(K,inkL,.85);s.knockout(holeL,.9);s.knockout(backs);s.fill(K,backs,.75);
 s.stroke(K,edge,3,.7);
 if(o.flash&&o.flash>.02)s.stroke(Y,edge,10,.95*o.flash);
}
/** the pitch: cinder dog track (red × navy), evening grass (yellow × blue), mowing stripes, paper lines, both goals */
function ground(s:Sheet,c:Camera,o:{net?:(p:V3)=>V3}={}){
 const tr=new Path2D();addPoly(tr,clipPoly(c,Array.from({length:NS},(_,i)=>rim(i/NS*TAU,-.6,0))));s.knockout(tr);s.fill(R,tr,.55);s.tone(K,tr,.2);
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-110,0,-38.5],[BX,0,-38.5],[BX,0,38.5],[-110,0,38.5]]));s.knockout(gp);s.fill(Y,gp,.85);s.tone(B,gp,.6);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5,0,-34],[x+5,0,34],[x,0,34]]));s.tone(B,stripes,.2);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.14);
 Ln([-105,-34],[0,-34]);Ln([-105,34],[0,34]);Ln([0,-34],[0,34]);Ln([-105,-34],[-105,34]);Ln([-52.5,-34],[-52.5,34]);
 const arc=(cx:number,cz:number,r:number,a0:number,a1:number,n:number)=>{let prev:[number,number]|null=null;for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n,p:[number,number]=[cx+Math.cos(a)*r,cz+Math.sin(a)*r];if(prev)Ln(prev,p);prev=p;}};
 arc(-52.5,0,9.15,0,TAU,24);
 for(const[gx,d] of[[0,-1],[-105,1]] as[number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;Ln([gx,-20.16],[bx,-20.16]);Ln([bx,-20.16],[bx,20.16]);Ln([bx,20.16],[gx,20.16]);Ln([gx,-9.16],[sx,-9.16]);Ln([sx,-9.16],[sx,9.16]);Ln([sx,9.16],[gx,9.16]);
  const a=Math.acos(5.5/9.15);if(d<0)arc(gx-11,0,9.15,Math.PI-a,Math.PI+a,8);else arc(gx+11,0,9.15,-a,a,8);
  addPoly(lines,clipPoly(c,[[gx+d*11-.15,.02,-.15],[gx+d*11+.15,.02,-.15],[gx+d*11+.15,.02,.15],[gx+d*11-.15,.02,.15]]));}
 s.knockout(lines,.95);
 boards(s,c,TOUCH);
 goal(s,c,-105,-1);
 goal(s,c,0,1,o.net);
}
/** a 1970s goal on the line x = X, net 2 m deep toward dir: posts and bar, a box net on stanchions; `net` displaces the mesh (ripple) */
function goal(s:Sheet,c:Camera,X:number,dir:number,net?:(p:V3)=>V3){
 const W=3.66,H=2.44,Dp=2,D=(p:V3):V3=>{const q=net?net(p):p;return[X+dir*q[0],q[1],q[2]];},vol=new Path2D(),mesh=new Path2D();
 const backF=(u:number,v:number):V3=>D([Dp,lerp(H,0,v),lerp(-W,W,u)]),top=(u:number,v:number):V3=>D([lerp(0,Dp,v),H,lerp(-W,W,u)]),side=(z:number)=>(u:number,v:number):V3=>D([lerp(0,Dp,u),lerp(H,0,v),z]);
 const grid=(f:(u:number,v:number)=>V3,nu:number,nv:number)=>{const poly:V3[]=[];for(let i=0;i<=nu;i++)poly.push(f(i/nu,0));for(let j=1;j<=nv;j++)poly.push(f(1,j/nv));for(let i=nu-1;i>=0;i--)poly.push(f(i/nu,1));for(let j=nv-1;j>0;j--)poly.push(f(0,j/nv));addPoly(vol,clipPoly(c,poly));
  for(let i=0;i<=nu;i++){let on=false;for(let j=0;j<=nv;j++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}
  for(let j=0;j<=nv;j++){let on=false;for(let i=0;i<=nu;i++){const a=f(i/nu,j/nv);if(depthOf(c,a)<NEAR+.1){on=false;continue;}const q=P(c,a);if(on)mesh.lineTo(q[0],q[1]);else mesh.moveTo(q[0],q[1]);on=true;}}};
 grid(backF,16,6);grid(top,16,4);grid(side(-W),4,6);grid(side(W),4,6);
 s.knockout(vol,.3);s.tone(K,vol,.2);s.stroke(K,mesh,Math.max(2,.028*kAt(c,[X,1,0])),.75);
 const frameP=new Path2D(),edge=new Path2D(),bar=(a0:V3,b0:V3,w0=.12)=>{const a:V3=[X+dir*a0[0],a0[1],a0[2]],b:V3=[X+dir*b0[0],b0[1],b0[2]];if(depthOf(c,a)<NEAR||depthOf(c,b)<NEAR)return;const pa=P(c,a),pb=P(c,b),w=w0*kAt(c,mix3(a,b,.5));frameP.addPath(ribbon([pa,pb],Math.max(2,w),{taper:0,pressure:0,wobble:.5}));edge.addPath(ribbon([pa,pb],Math.max(2,w)+Math.max(2,w*.4),{taper:0,pressure:0,wobble:.5}));};
 bar([0,0,-W],[0,H+.06,-W]);bar([0,0,W],[0,H+.06,W]);bar([0,H,-W-.06],[0,H,W+.06]);
 bar([Dp,0,-W],[Dp,H,-W],.06);bar([Dp,0,W],[Dp,H,W],.06);bar([0,H,-W],[Dp,H,-W],.05);bar([0,H,W],[Dp,H,W],.05);
 s.fill(K,edge,.9);s.knockout(frameP);
}
const netRipple=(age:number,hit:V3)=>(p:V3):V3=>{const d=Math.hypot(p[1]-hit[1],p[2]-hit[2])+Math.abs(p[0]-2)*.6,w=.4*Math.exp(-age*2.2)*Math.exp(-d*d*.4)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.9,p[1]-w*.2,p[2]];};

// ================= the white ball (paper, blue shade, navy stitched panels) =================
const BALL_R=.11;
function ball(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number}={}){
 const{sq=0,dir=0}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const disc=polyPath(Array.from({length:28},(_,i)=>{const a=i/28*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),true);
 s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(B,crescent(0,0,r*1.02,[-.4,-.45]),.5);
 const seams=new Path2D();for(let k=0;k<3;k++){const a=spin+k*TAU/3,ca=Math.cos(a),sa=Math.sin(a);for(const off of[-.32,.32]){const pts:Pt[]=[];for(let i=0;i<=8;i++){const u=i/8*2-1,px=u*r*1.1,py=off*r+Math.sin(u*1.5+a)*r*.12;pts.push([px*ca-py*sa,px*sa+py*ca]);}seams.addPath(polyPath(pts,false));}}
 s.stroke(K,seams,Math.max(1.4,r*.05),.8);
 s.restore();
 s.fill(K,ribbon(Array.from({length:40},(_,i)=>{const a=i/40*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),Math.max(3,r*.08),{close:true,pressure:.5,wobble:r*.02}));
 s.restore();
}
function ballShadow(s:Sheet,c:Camera,b:V3){const pts:Pt[]=[],rad=.2+b[1]*.03;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[b[0]+Math.cos(a)*rad,.02,b[2]+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.55-b[1]*.05,.2,.55));}

// ================= kits (10 May 1978) and the figure adapter =================
const SKIN:AthleteStyle['skin']=[[R,.2],[Y,.45]];
/** Liverpool: all red, white V-neck and cuffs (confirmed), short sleeves (photo); paper numbers inferred */
const LIV=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:R,socks:R,trim:'paper',boots:K,skin:SKIN,hair:K,hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',numberInk:'paper',...o});
/** Club Brugge: white shirts with a blue-and-black V-neck (navy here), white shorts, white socks (confirmed); navy numbers inferred */
const BRU=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',trim:K,boots:K,skin:SKIN,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:[K,.9],...o});
const DALGLISH:AthleteStyle=LIV({number:7,hair:[K,.75],build:{height:1.73,bulk:1.02,thighs:1.06},seed:7});
const JENSEN:AthleteStyle={shirt:[K,.18],shorts:[K,.9],socks:'paper',trim:K,boots:K,skin:SKIN,hair:[K,.8],hairStyle:'short',line:K,sleeves:'long',shade:[K,.26],number:1,numberInk:[K,.9],build:{height:1.85},seed:1};
const REF:AthleteStyle={shirt:[K,.92],shorts:[K,.92],socks:[K,.92],trim:'paper',boots:K,skin:SKIN,hair:[K,.6],hairStyle:'short',line:K,sleeves:'short',seed:33};
/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, continuous-silhouette body). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:AthleteStyle,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean}={}):DrawResult{
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,style,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,style,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 Souness's pass) =================
type TK=[number,number,number];// τ, x, z
type Role='dal'|'liv'|'bru'|'gk'|'ref';
type Actor={name:string;role:Role;style:AthleteStyle;keys:TK[];key?:boolean};
// ---- ball landmarks: McDermott's cross, Jensen's punch, Souness's control and pass, Dalglish's touch, the chip ----
const G=9.81,KROSS=-3.4,PUNCH=-2.2,CTRL=-1,RCV=.95,CHIP=2.5,FLIGHT=1.05,IN_NET=CHIP+FLIGHT;
const C0:V3=[-7,.11,20.3],PU:V3=[-1.8,2.75,1.3],SC:V3=[-15.4,.11,1.2],PS:V3=[-15.3,.11,.85],RC:V3=[-7.4,.11,-6.6],CH:V3=[-5.3,.11,-7],LINE:V3=[0,1,.6];
/** where a player stands so his right boot meets a ball at b while facing f (ball ahead and a touch to the right) */
function standAt(b:V3,f:[number,number],ahead=.44):[number,number]{const l=Math.hypot(f[0],f[1]),fx=f[0]/l,fz=f[1]/l,rx=-fz,rz=fx;return[b[0]-fx*ahead-rx*.1,b[2]-fz*ahead-rz*.1];}
const AIM:[number,number]=[LINE[0]-CH[0],LINE[2]-CH[2]];
const D_RC=standAt(RC,[.935,.353],.46),D_CH=standAt(CH,AIM,.42),S_PS=standAt(PS,[RC[0]-PS[0],RC[2]-PS[2]],.44),M_C0=standAt(C0,[PU[0]-C0[0],PU[2]-C0[2]],.44);
/** Positions are Hermite-interpolated between keys. Only Souness, Dalglish, Jensen and the chaser come from the accounts (their places are inferred). */
const ACTORS:Actor[]=[
 {name:'Dalglish',role:'dal',style:DALGLISH,key:true,keys:[[-5,-18.5,-12.8],[-4,-17,-12],[-2,-15.6,-11],[-1,-14,-10.2],[0,-11.2,-8.6],[RCV,D_RC[0],D_RC[1]],[1.6,-6.55,-7.12],[2.1,-5.85,-7.3],[CHIP,D_CH[0],D_CH[1]],[3,-5.2,-7.36],[3.6,-5,-7.45],[4.3,-3.2,-9],[5,-.5,-11.2],[5.6,2.4,-13],[5.85,3.6,-13.7],[6.15,4.6,-14.3],[6.45,5.9,-15],[7,7.1,-15.7],[7.6,7.8,-16.1],[10,8,-16.2]]},
 {name:'Jensen',role:'gk',style:JENSEN,key:true,keys:[[-5,-1,.3],[-4,-1.2,.6],[PUNCH-.1,-1.95,1.5],[PUNCH+.1,-1.95,1.5],[CTRL,-1.4,.6],[0,-1.3,-.4],[.8,-1.75,-1.9],[1.5,-2.55,-3.3],[1.95,-3.25,-4.4],[2.1,-3.35,-4.55],[10,-3.35,-4.55]]},
 {name:'Leekens',role:'bru',style:BRU({number:4,seed:44,hair:[K,.9]}),key:true,keys:[[-5,-15,-2],[-2,-15,-2.8],[0,-13.2,-4.4],[1,-10.5,-5.6],[1.8,-8.6,-6.6],[2.5,-7.3,-7.1],[3.2,-6.6,-7.4],[5,-6,-7.7],[10,-5.8,-7.8]]},
 {name:'Souness',role:'liv',style:LIV({number:11,seed:11,hairStyle:'curly'}),key:true,keys:[[-5,-20,4],[-3,-18.5,2.6],[CTRL-.3,SC[0]-.6,SC[2]+.3],[CTRL,SC[0]-.48,SC[2]+.1],[0,S_PS[0],S_PS[1]],[1,-14.5,.4],[3,-12,-1],[5,-9,-4],[10,-6,-8]]},
 {name:'McDermott',role:'liv',style:LIV({number:10,seed:10,hairStyle:'curly',hair:[K,.8]}),key:true,keys:[[-5,-11,23.4],[KROSS,M_C0[0],M_C0[1]],[-2,-6.6,18.5],[0,-6,15],[10,-4,10]]},
 {name:'Fairclough',role:'liv',style:LIV({number:9,seed:9,hairStyle:'curly',hair:[R,.85]}),keys:[[-5,-7,4],[-2,-7,2.2],[0,-8.5,1.5],[1.5,-5.5,.5],[3,-3,.2],[5,-2,-1],[10,-1,-3]]},
 {name:'Kennedy',role:'liv',style:LIV({number:5,seed:5}),keys:[[-5,-25,-15],[0,-21,-12],[4,-15,-12],[10,-12,-12]]},
 {name:'Heighway',role:'liv',style:LIV({number:12,seed:12,hair:[K,.7]}),keys:[[-5,-19,26],[0,-16,20],[10,-10,14]]},
 {name:'Krieger',role:'bru',style:BRU({number:3,seed:43,hairStyle:'long'}),keys:[[-5,-5,-1],[-2,-6.5,.2],[0,-8,-2.5],[2,-5.5,-2.8],[4,-3.5,-2.5],[10,-3.2,-2.4]]},
 {name:'Bastijns',role:'bru',style:BRU({number:2,seed:42}),keys:[[-5,-6,6],[-2,-7.5,4],[0,-9,3.5],[2.5,-6,1.5],[10,-4.5,.5]]},
 {name:'Maes',role:'bru',style:BRU({number:5,seed:45}),keys:[[-5,-16,-8.5],[0,-15,-7.8],[3,-12.5,-7.2],[10,-11,-7]]},
 {name:'Cools',role:'bru',style:BRU({number:6,seed:46,hair:[K,.7]}),keys:[[-5,-21,7],[0,-18,4],[4,-13,1],[10,-11,0]]},
 {name:'Vandereycken',role:'bru',style:BRU({number:7,seed:47}),keys:[[-5,-23,-2],[0,-17.5,-2.8],[3,-13,-4],[10,-11,-4]]},
 {name:'De Cubber',role:'bru',style:BRU({number:8,seed:48,hairStyle:'curly'}),keys:[[-5,-26,13],[10,-18,8]]},
 {name:'Sanders',role:'bru',style:BRU({number:13,seed:53}),keys:[[-5,-19,-16],[10,-12,-12]]},
 {name:'Corver',role:'ref',style:REF,keys:[[-5,-29,3],[0,-25,-3],[4,-18,-7],[10,-15,-9]]},
];
const DALI=0,GKI=1,CHI=2,SOUI=3,MCDI=4;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:TK[],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:1|2)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const TA=-5,TB=10,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(TB-TA)/DT;i++){const[x,z]=herm(a.keys,TA+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-TA)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.1),b=posOf(k,tau+.1);return[(b[0]-a[0])/.2,(b[1]-a[1])/.2];};

// ---- the ball ----
function arc(a:V3,b:V3,D:number,s:number):V3{const u=s/D,vy=(b[1]-a[1]+.5*G*D*D)/D;return[lerp(a[0],b[0],u),a[1]+vy*s-.5*G*s*s,lerp(a[2],b[2],u)];}
/** after the goal line the chip carries on (same velocity) until it lands inside the goal, then settles against the net */
const V_LINE:V3=[(LINE[0]-CH[0])/FLIGHT,(LINE[1]-CH[1]+.5*G*FLIGHT*FLIGHT)/FLIGHT-G*FLIGHT,(LINE[2]-CH[2])/FLIGHT];
const S_LAND=(V_LINE[1]+Math.sqrt(V_LINE[1]*V_LINE[1]+2*G*(LINE[1]-.11)))/G;
const LAND:V3=[LINE[0]+V_LINE[0]*S_LAND,.11,LINE[2]+V_LINE[2]*S_LAND],REST:V3=[1.62,.11,2.35],NET_HIT:V3=[2,.35,2.2];
function ballAt(tau:number):V3{
 if(tau<KROSS)return C0;
 if(tau<PUNCH)return arc(C0,PU,PUNCH-KROSS,tau-KROSS);
 if(tau<CTRL)return arc(PU,SC,CTRL-PUNCH,tau-PUNCH);
 if(tau<0){const u=(tau-CTRL)/-CTRL;return mix3(SC,PS,easeOut(u));}
 if(tau<RCV){const u=tau/RCV;return mix3(PS,RC,u*(1.3-.3*u));}
 if(tau<CHIP){const u=(tau-RCV)/(CHIP-RCV);return mix3(RC,CH,1-(1-u)*(1-u));}
 if(tau<IN_NET)return arc(CH,LINE,FLIGHT,tau-CHIP);
 const s=tau-IN_NET;if(s<S_LAND)return[LINE[0]+V_LINE[0]*s,LINE[1]+V_LINE[1]*s-.5*G*s*s,LINE[2]+V_LINE[2]*s];
 const u=clamp((s-S_LAND)/.7);return mix3(LAND,REST,easeOut(u));
}

// ---- poses ----
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** over(): blend channel overrides (degrees) into a pose */
const LIN=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as(keyof Pose)[]){const v=LIN.has(k)?d[k]!:d[k]!*D2R;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
/** waiting over the ball: low and balanced, weight on the balls of the feet, head UP watching the keeper */
const WAIT:Partial<Pose>={lean:14,pitch:4,lHipF:30,rHipF:24,lKnee:40,rKnee:36,lHipA:8,rHipA:8,lShA:34,rShA:30,lElb:50,rElb:50,neckP:-4,squash:-.03};
/** the chip: a short stab under the ball, leaning back a touch, the follow-through cut short */
const CHIPP:Partial<Pose>={lean:2,pitch:-2,rKnee:40,rAnk:14,lShA:70,rShA:40};
/** the hurdle over the boards: take-off, the lead leg long over the top, trail leg folded out to the side, arms flung up; land */
function hurdle(t:number):Pose{return clampPose(keyPoses(t,[
 [0,runCycle(.05,{speed:.85})],
 [.22,posed({lHipF:-28,lKnee:24,lAnk:44,rHipF:74,rKnee:66,rAnk:10,lean:20,pitch:6,lShF:64,rShF:-30,lShA:36,rShA:40,lElb:40,rElb:62,air:.06,squash:.06})],
 [.5,posed({air:.6,rHipF:96,rKnee:14,rAnk:12,lHipF:-6,lHipA:52,lHipR:36,lKnee:112,lAnk:30,lean:32,pitch:8,lShA:150,rShA:146,lShF:36,rShF:28,lElb:10,rElb:14,neckP:-24,lHand:1,rHand:1})],
 [.78,posed({air:.1,rHipF:36,rKnee:34,rAnk:-6,lHipF:30,lHipA:18,lKnee:84,lean:10,pitch:2,lShA:160,rShA:156,lShF:20,rShF:20,lElb:18,rElb:22,neckP:-30,squash:-.06})],
 [1,posed({lHipF:22,rHipF:14,lKnee:32,rKnee:26,lShA:166,rShA:162,lShF:16,rShF:14,lElb:12,rElb:14,neckP:-32,lean:-4,lHand:1,rHand:1})],
]));}
const HUP=5.78,HDUR=.72;
/** Dalglish's heading: along his run; squared up to the aim for the wait and the chip; toward the fans after the boards */
function yawDal(tau:number){const v=velOf(DALI,tau),run=Math.hypot(v[0],v[1])>.45?YAW(v[0],v[1]):YAW(AIM[0],AIM[1]);
 let y=lerpAng(run,YAW(AIM[0],AIM[1]),sm(1.7,2.1,tau)*(1-sm(3.2,3.7,tau)));
 return lerpAng(y,YAW(1,-.7),sm(6.4,7.2,tau));}
/** a pose + yaw for actor k at τ */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.45?YAW(v[0],v[1]):YAW(b[0]-x,b[2]-z);
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='bru'?READY:stand();
 let p:Pose;
 if(k===DALI){yaw=yawDal(tau);
  if(tau<.6||tau>3.4){const s=clamp((sp-2)/5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.3+2*s),{speed:s}),clamp((sp-.4)/.8));}
  else{const s=clamp((sp-1.5)/4),dr=dribble(distOf(k,tau)/1.9,{foot:'r',speed:.35+.4*s});p=blendPose(READY,dr,clamp((sp-.6)/1.4));}
  p=over(p,WAIT,sm(1.6,2.0,tau)*(1-sm(2.2,2.3,tau)));// he waits: low, balanced, eyes on the keeper
  const D=.8,st=CHIP-STRIKE_CONTACT*D,u=(tau-st)/D;
  if(u>0&&u<1.5){p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.3}),Math.min(sm(0,.16,u),1-sm(1.05,1.5,u)));p=over(p,CHIPP,bump(.4,.9,u));}
  if(tau>2.9&&tau<3.9)p=over(p,{neckP:-16,lShA:36,rShA:30},bump(2.9,3.9,tau));// watches it drop in
  if(tau>3.9)p=over(p,{rShF:172,rShA:16,rElb:14,rHand:0},sm(4.1,4.5,tau)*(1-sm(HUP-.1,HUP+.1,tau)));// one fist up as he races away
  const hu=(tau-HUP)/HDUR;if(hu>-.1&&hu<1.4){const w=Math.min(sm(-.1,0,hu),1);p=blendPose(p,hurdle(clamp(hu)),w);}
  if(tau>HUP+HDUR+.1){const c=celebrate((tau-HUP-HDUR-.1)*.9,{kind:'arms'});p=blendPose(p,c,sm(HUP+HDUR+.1,HUP+HDUR+.5,tau));}
  return{p,yaw};}
 if(a.role==='gk'){yaw=YAW(b[0]-x,b[2]-z);const s=clamp((sp-1)/5);p=blendPose(idle,runCycle(distOf(k,tau)/2.6,{speed:s}),clamp((sp-.6)/1));
  // the punch: up off both feet, the right fist through the ball
  if(tau>PUNCH-.5&&tau<PUNCH+.5){const w=bump(PUNCH-.5,PUNCH+.5,tau);yaw=YAW(C0[0]-x,C0[2]-z);p=over(p,{air:.55*w,rShF:176,rElb:8,rShA:12,lShF:120,lElb:60,lHipF:44,lKnee:84,rHipF:12,rKnee:30,lean:-8,neckP:-44,rHand:0},w);}
  // he goes down: a low dive to his right as Dalglish shapes to chip
  const DV=2.02;if(tau>DV){const[dx0,dz0]=posOf(DALI,DV),u=(tau-DV)/.95;yaw=YAW(dx0-x,dz0-z);p=keeperDive(clamp(u),{side:'r',height:.02});
   if(tau>IN_NET-.2)p=over(p,{neckP:-30,neckY:50},sm(IN_NET-.2,IN_NET+.5,tau));}
  return{p,yaw};}
 const along=v[0]*Math.cos(yaw)-v[1]*Math.sin(yaw);
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.4+2.2*s),{speed:s}),clamp((sp-.5)/.9));}
 if(k===SOUI){const D=.85,u=(tau-(0-STRIKE_CONTACT*D))/D;if(tau>CTRL-.5&&tau<.2)yaw=lerpAng(yaw,YAW(RC[0]-x,RC[2]-z),sm(CTRL-.5,CTRL,tau));
  if(u>0&&u<1.4)p=blendPose(p,strike(Math.min(1,u),{foot:'r',power:.45}),Math.min(sm(0,.15,u),1-sm(1,1.4,u)));
  if(tau>CTRL-.4&&tau<CTRL+.4)p=over(p,{neckP:34,lean:18,rHipF:30,rKnee:30,rAnk:-10},bump(CTRL-.4,CTRL+.4,tau));}
 if(k===MCDI){const D=1,u=(tau-(KROSS-STRIKE_CONTACT*D))/D;if(u>-.2&&u<1.4){yaw=YAW(PU[0]-x,PU[2]-z);p=blendPose(p,strike(clamp(u),{foot:'r',power:.8}),Math.min(sm(-.2,0,u),1-sm(1,1.4,u)));}}
 if(k===CHI){const[bx,bz]=posOf(DALI,tau);if(tau>0&&tau<3.4)yaw=lerpAng(yaw,YAW(bx-x,bz-z),Math.min(sm(0,.5,tau),1-sm(3,3.4,tau)));
  const u=(tau-(CHIP-.6*.8))/.8;if(u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:'l'}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));}
 return{p,yaw};
}

type Item={depth:number;far:boolean;draw:()=>void};
type World={ball:V3;res:Map<number,DrawResult>};
/** everyone and the ball at τ (poses on twos at tp), depth sorted; the byline boards are drawn between whatever is beyond them (seen from
 * this camera) and whatever is on the camera's side, so Dalglish vanishes behind them or leaps out over them correctly */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;glow?:number;boardFlash?:number}):World{
 const b=ballAt(tau),items:Item[]=[],res=new Map<number,DrawResult>(),camOut=c.eye[0]>BX;
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!(s as unknown as {_passage?:{pending?:unknown}})._passage?.pending;
 ACTORS.forEach((a,k)=>{const[x,z]=posOf(k,tau),g:V3=[x,0,z],d=depthOf(c,g);if(d<1)return;const[gx,gy]=P(c,g),kk=kAt(c,g);if(Math.abs(gx)>s.W*.62+kk*2||gy<-s.H*.6||gy>s.H*.6+2.4*kk)return;
  items.push({depth:d,far:(x>BX)!==camOut,draw:()=>{const{p,yaw}=poseOf(k,tp),px=kk*1.8*ppu,place:Place={x,z,yaw};
   const detail=passing?(k===DALI?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
   const big=px>=90&&!passing&&(k===DALI||a.key);
   const prev=big?{pose:poseOf(k,tp-1/12).p,place:{x:posOf(k,tau-1/12)[0],z:posOf(k,tau-1/12)[1],yaw:poseOf(k,tp-1/12).yaw}}:undefined;
   res.set(k,drawPlayer(s,p,c,{...a.style,detail},place,{prev,smear:!!o.hero&&k===DALI}));}});});
 items.push({depth:depthOf(c,b),far:(b[0]>BX)!==camOut,draw:()=>{if(depthOf(c,b)<NEAR)return;const a=P(c,ballAt(tau-.03)),q=P(c,b),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,b));ballShadow(s,c,b);
  if(o.glow&&o.glow>.02)s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>[q[0]+Math.cos(i/20*TAU)*r*1.6,q[1]+Math.sin(i/20*TAU)*r*1.6] as Pt),true),r*.25*o.glow,.95);
  ball(s,q[0],q[1],r,tau*7,{sq:clamp(sp/(r*3),0,.7),dir:Math.atan2(dy,dx)});}});
 const bydepth=(a:Item,b2:Item)=>b2.depth-a.depth;
 items.filter(i=>i.far).sort(bydepth).forEach(i=>i.draw());
 boards(s,c,BYLINE,{flash:o.boardFlash});
 items.filter(i=>!i.far).sort(bydepth).forEach(i=>i.draw());
 return{ball:b,res};}

// ================= teaching marks =================
/** a ribbon along projected 3D points (metres), width in metres; progress 0..1; optional arrowhead */
function trail3(s:Sheet,c:Camera,pts:V3[],wm:number,ink:string,o:{progress?:number;cov?:number;head?:boolean;dashed?:boolean;seed?:number}={}){
 const{progress=1,cov=.95,head=true,dashed=false,seed=5}=o;if(progress<=.01||cov<=.02)return;
 const n=Math.max(2,Math.round(pts.length*clamp(progress))),q:Pt[]=[];let d=1;for(const g of pts.slice(0,n)){const dd=depthOf(c,g);if(dd<NEAR+.2)continue;q.push(P(c,g));d=dd;}
 if(q.length<2)return;const w=Math.max(5,c.F*wm/d),gaps:[number,number][]=[];if(dashed)for(let x=.08;x<.95;x+=.14)gaps.push([x,x+.07]);
 s.knockout(ribbon(q,w*1.6,{seed,taper:.1,wobble:.8,gaps}),.8*cov);s.fill(ink,ribbon(q,w,{seed,taper:.1,wobble:.8,gaps}),cov);
 if(head&&q.length>2){const a=q[q.length-2],b=q[q.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.02,b[1]+(b[1]-a[1])*.02],w,{seed:seed+1,head:w*3,cov});}}
const onGround=(p:[number,number][]):V3[]=>p.map(q=>[q[0],.03,q[1]]);
const pathOf=(k:number,t0:number,t1:number,n=16):[number,number][]=>Array.from({length:n+1},(_,i)=>posOf(k,t0+(t1-t0)*i/n));
/** the chip's flight through the air, from the boot to where it lands in the net */
const chipArc=(n=18):V3[]=>Array.from({length:n+1},(_,i)=>ballAt(CHIP+(IN_NET+S_LAND-CHIP)*i/n));
/** a ring on the grass (centre, radii in metres) */
function groundRing(s:Sheet,c:Camera,cx:number,cz:number,rx:number,rz:number,wm:number,ink:string,cov:number,seed=7){
 if(cov<=.02)return;const pts:Pt[]=[];let d=1;for(let i=0;i<40;i++){const g:V3=[cx+Math.cos(i/40*TAU)*rx,.03,cz+Math.sin(i/40*TAU)*rz];const dd=depthOf(c,g);if(dd<NEAR+.2)return;pts.push(P(c,g));d=dd;}
 const w=Math.max(5,c.F*wm/d);s.knockout(ribbon(pts,w*1.6,{close:true,seed,taper:0,wobble:1}),.8*cov);s.fill(ink,ribbon(pts,w,{close:true,seed,taper:0,wobble:1}),cov);}
/** "wait": two calm rings breathing out from the ball on the grass */
function calmRings(s:Sheet,c:Camera,b:V3,t:number,w:number,seed:number){if(w<=.02)return;for(let i=0;i<2;i++){const ph=((t*.7)+i*.5)%1;groundRing(s,c,b[0],b[2],.3+ph*1.1,.3+ph*1.1,.035,Y,w*(1-ph)*.95,seed+i);}}
/** "goes down": a red arrow pointing down at the keeper, from above his head to the grass */
function downArrow(s:Sheet,c:Camera,x:number,z:number,w:number,seed:number){if(w<=.02)return;const a=P(c,[x,2.9,z]),e=P(c,[x,1.05,z]),wd=Math.max(6,kAt(c,[x,1,z])*.1);
 s.knockout(ribbon([a,e],wd*1.8,{seed,taper:.1}),.6*w);laneArrow(s,R,a,e,wd,{progress:w,seed,head:wd*3});}
/** the open goal mouth, lit: a yellow outline round posts and bar and a light screen inside */
function goalMouth(s:Sheet,c:Camera,w:number){if(w<=.02)return;const q=clipPoly(c,[[0,0,-3.66],[0,2.44,-3.66],[0,2.44,3.66],[0,0,3.66]]);if(q.length<3)return;
 const p=new Path2D();addPoly(p,q);s.tone(Y,p,.3*w);s.stroke(Y,p,Math.max(6,.1*kAt(c,[0,1.2,0])),.95*w);}

// ================= chapter 1 (live, near real time): the high main-stand camera; the cross, the punch, the pass, the chip, the net =================
const tau1=(t:number)=>{const lv=T(0,'Liverpool'),ir=T(0,'in red'),cb=T(0,'against Club Brugge'),ss=T(0,'Souness slides'),kd=T(0,'Kenny Dalglish'),ii=T(0,'is in'),ta=T(0,'A tight angle'),kc=T(0,'the keeper comes out'),oh=T(0,'over him'),g=T(0,'Goal'),E=SEC(0);
 return key(t,mono([[0,-4.6],[lv,-4.05],[ir+.1,KROSS],[cb+.5,PUNCH+.15],[ss-.1,-.3],[kd,.7],[ii+.1,1.2],[ta+.2,1.75],[kc+.3,2.12],[oh-.1,CHIP],[g,IN_NET],[E+1,IN_NET+(E+1-g)]]),linear);};
const CAM1:V3=[-33,19,-62];
function look1(tau:number):V3{const b=ballAt(tau);
 if(tau<KROSS-.3)return[-5,1,12];
 if(tau<IN_NET)return[b[0],lerp(1,b[1],.3),b[2]*.8];
 const[x,z]=posOf(DALI,tau);return mix3([b[0]-2,1,b[2]*.8],[x,1,z],sm(IN_NET,IN_NET+1.2,tau));}
function cam1(t:number){const tau=tau1(t),a=look1(tau),b=look1(tau-.3),c=look1(tau-.6),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const F=key(tau,[[-4.6,3300],[KROSS,3500],[PUNCH,3700],[CTRL,3900],[0,4100],[RCV,4700],[2.1,5700],[CHIP,6200],[IN_NET,6100],[IN_NET+2.5,6900]]);return cam(CAM1,look,F);}
const ch1:Scene={
 draw(s,t){const tt=twos(t),c=cam1(t),tau=tau1(t),tp=tau1(tt),goalIn=tau-IN_NET;frame(s);
  stadium(s,c,{t,cheer:.12+.9*sm(0,.5,goalIn),flash:.15+1.3*sm(0,.4,goalIn)});
  ground(s,c,{net:goalIn>.2?netRipple(goalIn-.2,NET_HIT):undefined});
  drawWorld(s,c,tau,tp,{ballMin:9});},
 aperture(t){const c=cam1(t),p=ballAt(tau1(t)),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(9,BALL_R*kAt(c,p))*1.1,12);},
 still:13,
};

// ================= chapter 2 (TV replay, slow motion, low behind the goal line beside the post — the photographer's angle): the wait and the chip =================
const tau2=(t:number)=>{const E=SEC(1);return key(t,mono([[0,.5],[T(1,'Keeper Jensen'),.9],[T(1,'rushes out')+.5,1.5],[T(1,'Dalglish does not panic'),1.78],[T(1,'He waits'),1.98],[T(1,'and waits')+.3,2.12],[T(1,'the keeper goes down')+.45,2.36],[T(1,'lifts the ball')+.15,CHIP],[T(1,'over him')+.4,CHIP+.62],[E,IN_NET-.08]]),linear);};
function cam2(t:number){const tau=tau2(t),E=SEC(1),[dx,dz]=posOf(DALI,tau),[kx,kz]=posOf(GKI,Math.min(tau,2)),b=ballAt(tau);
 const push=sm(T(1,'Dalglish does not panic')-.3,T(1,'the keeper goes down'),t,easeInOutSine),follow=sm(T(1,'lifts the ball'),E-.3,t,easeInOutSine),early=1-sm(0,T(1,'rushes out')+.6,t,easeInOutSine);
 const mid:V3=[lerp(dx,kx,.45),.95,lerp(dz,kz,.45)],look=mix3(mid,[lerp(mid[0],b[0],.6),lerp(.95,b[1],.5),lerp(mid[2],b[2],.6)],follow);
 return cam([3.4+.8*early,1+.15*early,-4.6-.6*early],look,1350+650*push-250*follow-150*early);}
const ch2:Scene={
 draw(s,t){const tt=twos(t),c=cam2(t),tau=tau2(t),tp=tau2(tt),E=SEC(1),ro=T(1,'rushes out'),dp=T(1,'Dalglish does not panic'),hw=T(1,'He waits'),aw=T(1,'and waits'),kd=T(1,'the keeper goes down'),lb=T(1,'lifts the ball'),oh=T(1,'over him');frame(s);
  stadium(s,c,{t,cheer:.1});
  ground(s,c);
  // "rushes out": the keeper's run off his line, drawn on the grass
  trail3(s,c,onGround(pathOf(GKI,.2,2)),.15,R,{progress:sm(ro-.2,ro+.8,t,easeOut),cov:.95*(1-sm(kd,kd+.5,t)),seed:21});
  // "does not panic" / "he waits, and waits": calm rings breathing out from the ball, one pulse per "waits"
  const b0=ballAt(tau),cw=Math.max(sm(dp-.1,dp+.3,t)*.6,bump(hw-.1,hw+.9,t),bump(aw-.1,aw+.9,t))*(1-sm(lb-.2,lb+.1,t));
  calmRings(s,c,b0,t,cw,23);
  // "lifts the ball": the chip's arc drawn through the air, over the keeper and into the net
  const aw2=sm(lb-.15,oh+.5,t,easeOut)*(1-sm(E-.7,E-.3,t));
  trail3(s,c,chipArc(),.07,Y,{progress:aw2,dashed:true,head:true,seed:25});
  const w=drawWorld(s,c,tau,tp,{ballMin:9,hero:true,glow:sm(lb-.1,lb+.2,t)*(1-sm(oh+.3,oh+.8,t))});
  // "the keeper goes down": a red arrow down at him, and sparks where he commits
  const[kx,kz]=posOf(GKI,Math.min(tau,2.02));downArrow(s,c,kx,kz,sm(kd-.1,kd+.35,t,easeOut)*(1-sm(lb,lb+.3,t)),27);
  const gk=w.res.get(GKI),age=t-kd;if(gk&&age>-.1&&age<.7){const h=gk.joints.head;sparkBurst(s,R,h[0],h[1],kAt(c,[-3,1,-4])*.5,{n:8,seed:29,g:easeOutBack(clamp((age+.1)/.2))*(1-clamp((age-.45)/.25)),width:9});}
  // "over him": a spark at the boot as the ball pops up
  const ag2=tp-CHIP;if(ag2>-.02&&ag2<.3){const q=P(c,[CH[0],.2,CH[2]]);sparkBurst(s,Y,q[0],q[1],kAt(c,CH)*.4,{n:8,seed:31,g:easeOutBack(clamp(ag2/.08))*(1-clamp((ag2-.18)/.12)),width:8});}
  if(t<.5)speedLines(s,K,0,0,0,{n:12,seed:33,len:900,spread:520,width:22,cov:.5*(1-t/.5)});
 },
 aperture(t){const c=cam2(t),p=ballAt(tau2(t)),[x,y]=P(c,p),r=Math.max(9,BALL_R*kAt(c,p));return apertureDisc(x,y,r*1.1,12);},
 still:6,
};

// ================= chapter 3 (replay, low beside the dog track): it drops in, he races away and hurdles the advertising boards =================
const tau3=(t:number)=>{const E=SEC(2),di=T(2,'It drops in'),ra=T(2,'races away'),hu=T(2,'hurdles'),ab=T(2,'the advertising boards');
 return key(t,mono([[0,IN_NET-.35],[di+.3,IN_NET+.12],[ra,3.95],[hu+.1,HUP+.2],[ab+.3,HUP+.55],[E,HUP+HDUR+1.3]]),linear);};
const CAM3:V3=[-7,1.4,-19.5];
function cam3(t:number){const tau=tau3(t),E=SEC(2),[x,z]=posOf(DALI,tau),b=ballAt(tau),fol=sm(T(2,'It drops in')+.2,T(2,'races away')+.6,t,easeInOutSine);
 const look=mix3([lerp(b[0],x,.3),1,lerp(b[2],z,.3)],[lerp(x,BX,.35),1.15,z],fol);
 return cam([CAM3[0]+1.2*sm(0,E,t),CAM3[1],CAM3[2]+.6*sm(0,E,t)],look,key(t,mono([[0,1450],[T(2,'races away'),1400],[T(2,'hurdles'),1850],[E,2050]])));}
const ch3:Scene={
 draw(s,t){const tt=twos(t),c=cam3(t),tau=tau3(t),tp=tau3(tt),di=T(2,'It drops in'),ra=T(2,'races away'),hu=T(2,'hurdles'),ab=T(2,'the advertising boards'),E=SEC(2),goalIn=tau-IN_NET;frame(s);
  stadium(s,c,{t,cheer:.1+1*sm(0,.5,goalIn),flash:.1+1.3*sm(0,.4,goalIn)});
  ground(s,c,{net:goalIn>.2?netRipple(goalIn-.2,NET_HIT):undefined});
  // "races away": his run to the boards, red on the grass
  trail3(s,c,onGround(pathOf(DALI,3.6,HUP)),.16,R,{progress:sm(ra-.1,ra+.9,t,easeOut),cov:.9*(1-sm(E-.9,E-.4,t)),seed:41});
  // "hurdles": the leap drawn as a yellow arc up and over the top of the boards
  const hp=Array.from({length:13},(_,i)=>{const tq=HUP+.1+(HDUR-.1)*i/12,[x,z]=posOf(DALI,tq);return[x,1.05+.75*Math.sin(Math.PI*i/12),z] as V3;});
  trail3(s,c,hp,.07,Y,{progress:sm(hu-.2,hu+.5,t,easeOut),cov:.95*(1-sm(E-.8,E-.3,t)),dashed:true,seed:43});
  drawWorld(s,c,tau,tp,{ballMin:8,hero:true,boardFlash:sm(ab-.1,ab+.3,t)*(1-sm(ab+1.2,ab+1.8,t))});
  if(t>hu&&t<hu+.6){const q=P(c,[BX,1.2,posOf(DALI,HUP+.35)[1]]);speedLines(s,K,q[0],q[1],-2.6,{n:9,seed:45,len:260,spread:160,width:14,cov:.45*bump(hu,hu+.6,t)});}
  if(t<.45)speedLines(s,K,0,0,Math.PI,{n:12,seed:47,len:900,spread:520,width:22,cov:.5*(1-t/.45)});
  void di;
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(DALI,tau3(t)),p:V3=[x,1.3,z],[px,py]=P(c,p);return apertureDisc(px,py,Math.max(12,.22*kAt(c,p)),12);},
 still:4.5,
};

// ================= chapter 4 (the lesson, a low side camera): be patient, wait for the keeper to go down, lift it over =================
const tau4=(t:number)=>{const E=SEC(3),bp=T(3,'be patient'),wk=T(3,'wait for the keeper'),gd=T(3,'to go down'),lo=T(3,'lift it over');
 return key(t,mono([[0,1.25],[bp,1.6],[bp+.9,1.9],[wk+.3,2.05],[gd+.4,2.32],[lo,CHIP],[lo+1.3,CHIP+.85],[E,IN_NET+.35]]),linear);};
function cam4(t:number){const E=SEC(3),push=sm(T(3,'be patient')-.3,T(3,'to go down'),t,easeInOutSine),follow=sm(T(3,'lift it over')-.2,E-.5,t,easeInOutSine);
 const look:V3=[lerp(-4.4,-2.2,follow),.85,lerp(-5.2,-3,follow)];
 return cam([look[0]-8.4+1.2*push,1.55,look[2]-12.6+1.8*push],look,1500+200*push-120*follow);}
const ch4:Scene={
 draw(s,t){const tt=twos(t),c=cam4(t),tau=tau4(t),tp=tau4(tt),E=SEC(3),bp=T(3,'be patient'),wk=T(3,'wait for the keeper'),gd=T(3,'to go down'),lo=T(3,'lift it over');frame(s);
  stadium(s,c,{t,cheer:.08});
  ground(s,c);
  // "be patient": calm rings breathing out from the ball
  calmRings(s,c,ballAt(tau),t,sm(bp-.1,bp+.3,t)*(1-sm(lo-.3,lo,t)),51);
  // "wait for the keeper": his run out, red on the grass
  trail3(s,c,onGround(pathOf(GKI,.2,2)),.14,R,{progress:sm(wk-.1,wk+.7,t,easeOut),cov:.9*(1-sm(lo,lo+.4,t)),seed:53});
  // "lift it over": the arc over him into the net, and the goal mouth lit
  const lw=sm(lo-.1,lo+.9,t,easeOut)*(1-sm(E-.6,E-.2,t));
  trail3(s,c,chipArc(),.13,Y,{progress:lw,seed:55});
  goalMouth(s,c,lw*.8);
  const w=drawWorld(s,c,tau,tp,{ballMin:8,hero:true});
  // "to go down": the arrow down at the keeper
  const[kx,kz]=posOf(GKI,Math.min(tau,2.02));downArrow(s,c,kx,kz,sm(gd-.1,gd+.35,t,easeOut)*(1-sm(lo-.1,lo+.2,t)),57);
  const gk=w.res.get(GKI),age=t-gd;if(gk&&age>0&&age<.7){const h=gk.joints.head;sparkBurst(s,R,h[0],h[1],kAt(c,[-3,1,-4])*.5,{n:8,seed:59,g:easeOutBack(clamp(age/.2))*(1-clamp((age-.45)/.25)),width:9});}
 },
 still:5,
};

const story:RisoStory={
 id:'dalglish-chip-1978',format:'11v11',title:'Dalglish chips the keeper, 1978',
 theme:'Be patient in front of goal: wait for the keeper to go down, then lift it over him.',
 ageNote:'European Cup final, Club Brugge 0–1 Liverpool, Wembley Stadium, London, 10 May 1978. Dalglish was 27.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a flashbulb pops and the white ball is dinked up in a soft arc from the point. Reduced motion: the ball and ring, still. */
 touch(s,x,y,age,seed){
  const r=rng(seed),a=r()*TAU,u=age<=0?0:clamp(age/.9),up=Math.sin(u*Math.PI)*170,side=(r()<.5?-1:1)*u*90,g=age<=0?1:easeOutBack(clamp(age/.25));
  s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>{const q=i/20*TAU;return[x+Math.cos(q)*110*g,y+Math.sin(q)*34*g] as Pt;}),true),12,.95);
  if(age>0&&age<.45){const fl=1-clamp(age/.45);s.knockout(polyPath([[x+Math.cos(a)*30,y-up-70*fl],[x+14,y-up],[x,y-up+70*fl],[x-14,y-up]],true));sparkBurst(s,Y,x,y-up,140*g,{n:9,seed,g:fl,width:12});}
  ball(s,x+side,y-up,56,age*9+hash(seed,3)*TAU,{sq:age>0?.18*Math.max(0,1-age*5):0,dir:-Math.PI/2});
 },
};
export default story;
