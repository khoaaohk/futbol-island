/** Iconic play film: George Best rounds the keeper, 1968 European Cup final, Benfica 1–4 Manchester United (a.e.t.), Wembley Stadium,
 * London, 29 May 1968 — United's second goal, the third minute of extra time (92'/93'), 1–1 → 2–1.
 * A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration text: public/plays/narration/best-final-1968/script.json. The voice is generated later by the lead (local Kokoro). Until then
 * every chapter runs on provisional cue times (≈2.6 words/s, see prov()). EVERY action time is read from cue onsets and chapter seconds,
 * so once timing.json exists, `withTiming` re-times the action through the cue words and no scene code changes.
 * LEAD: when public/plays/narration/best-final-1968/timing.json exists, replace `null` in `const VOICE` below with the imported timing
 *   import timingJson from '../../../public/plays/narration/best-final-1968/timing.json';   (and pass `timingJson as NarrationTiming`).
 *
 * SOURCES (read Sept 2026; written accounts only, we cannot watch the footage):
 *  - Wikipedia, "1968 European Cup final" (raw wikitext; the match account cites Albert Barham / Eric Todd, The Guardian, 30 May 1968,
 *    and the kit boxes cite the DVD "Manchester United: The European Finals Collection – 1968 European Cup Final")
 *    https://en.wikipedia.org/wiki/1968_European_Cup_final
 *  - Wikipedia, "George Best" (the final paragraph cites Best's autobiography, 2005, p. 146)  https://en.wikipedia.org/wiki/George_Best
 *  - BBC On This Day, "1968: Manchester Utd win European Cup"  http://news.bbc.co.uk/onthisday/hi/dates/stories/may/29/newsid_4464000/4464446.stm
 *  - pt.wikipedia, "Final da Taça dos Clubes Campeões Europeus de 1967–68" (line-ups; Best's goal in the 3rd minute of extra time)
 * CONFIRMED by those accounts: 29 May 1968, Wembley, kick-off 19:45 BST, 92,225 (BBC: 100,000) in the ground and ~250 million on TV;
 *  referee Concetto Lo Bello (Italy); 1–1 after 90 minutes (Charlton 53', Graça 79'); in the THIRD MINUTE OF EXTRA TIME Alex Stepney took a
 *  LONG GOAL KICK, BRIAN KIDD HEADED IT ON, BEST COLLECTED it, dribbled PAST THE DEFENCE and then AROUND THE GOALKEEPER, JOSÉ HENRIQUE,
 *  beating him WITH A DUMMY, and ROLLED the ball INTO AN EMPTY NET WITH HIS LEFT FOOT (BBC: "slipping round the keeper and gently tapping
 *  it over the line"); Kidd (19th birthday) and Charlton followed, 4–1. KITS: both clubs wear red, so United played in their BLUE AWAY
 *  STRIP (BBC) — all royal blue shirts, shorts and socks (Wikipedia kit box); Benfica in WHITE shirts with a RED COLLAR AND RED CUFFS,
 *  white shorts, white socks. Best wore 7 (right winger), Kidd 8, Charlton 9 (captain), Henrique 1. Best was 22.
 * INFERRED / ILLUSTRATIVE: every position, run and timing in metres and seconds; which end of Wembley and the direction of play on screen;
 *  where Kidd's header and Best's first touch were; the defender who is beaten (drawn as No. 4 Jacinto, not named in the narration); the
 *  side Best went round Henrique (his left, which suits the confirmed left-foot finish) and the direction of the dummy (to his right); that
 *  Henrique went down to his left; Best's dribbling foot (right) and the foot of the touch round the keeper (left); the other players'
 *  positions (Humberto, Cruz, Calisto, Coluna, Graça and Eusébio chasing back; Aston, Charlton, Sadler, Crerand in support); long sleeves;
 *  the keepers' kits (both drawn grey with dark shorts) and the referee's black; the white ball; the dusk sky and the roof-edge floodlights at
 *  ~21:40; Wembley's shape as drawn (the greyhound track round the pitch, roofed stands all round, the twin towers behind one end); the
 *  crowd's colours, photographers' flashes, camera placements and lenses; Best's celebration.
 *
 * STRUCTURE (the user's standard: a 1:1 recreation of the broadcast, only the rendering is riso; never top-down): the play is ONE
 * simulation on a real clock τ (seconds, τ = 0 Best's first touch): ch1 = the high main-stand broadcast camera, near real time (goal kick,
 * header, the run, round the keeper, net); ch2 = the TV slow-motion replay from a low camera beside the box (the keeper rushes out, the
 * dummy, the keeper fooled, one touch round him); ch3 = the reverse-angle replay, low beside the goal line (the empty goal, the calm
 * left-foot roll, the celebration); ch4 = the lesson on a low side camera (one on one, fake one way, touch it round, pass it in calmly).
 * Seams are forward passages into the ball. Figures: lib/plays/riso/athlete.ts through ONE adapter, drawPlayer(). Inks: yellow (floodlight,
 * lamps, teaching marks), red (Benfica trim, skin, cinder track, arrows), blue (United, dusk sky, grass with yellow), navy (key line).
 * Scenes read only their local t; figures pose on twos, cameras on ones; all randomness is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeIO,easeOutBack,easeInOutSine,linear,settle,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,laneArrow,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,posed,blendPose,runCycle,dribble,stand,strike,header,lunge,backpedal,celebrate,keeperSet,keeperDive,
 touchPhase,STRIKE_CONTACT,type Pose,type AthleteStyle,type Camera,type Place,type V3,type DrawResult} from './athlete';

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
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`best film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
import timingJson from '../../../public/plays/narration/best-final-1968/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Extra time','Wembley, 1968, the European Cup final against Benfica, extra time. The keeper kicks it long, Kidd heads it on, and George Best, in blue, races past the defence! Round the keeper, and... goal!',
  ['Wembley','the European Cup final','against Benfica','extra time','The keeper kicks','Kidd heads it on','George Best','in blue','races past','Round the keeper','goal']),
 prov('The dummy','Watch again, slowly. Keeper Henrique rushes out. Best drops his shoulder one way, the keeper is fooled, and one touch takes it round him.',
  ['Watch again','slowly','Keeper Henrique','rushes out','Best drops','his shoulder','the keeper is fooled','one touch','round him']),
 prov('No rush','The goal is empty. No rush: Best calmly rolls it in with his left foot!',
  ['The goal is empty','No rush','Best calmly','rolls it in','left foot']),
 prov('Your turn','Your turn: one on one, fake one way, touch it round the keeper, pass it in calmly.',
  ['Your turn','one on one','fake one way','touch it round','the keeper','pass it in calmly']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`best film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a retime can never reorder a camera) */
function mono(K0:number[][]):Key[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});}

// ================= 3D helpers over athlete.ts cameras (right-handed, metres, y up; the goal Best scores in is at x = 0, the pitch runs to x = −105) =================
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

// ================= Wembley, 1968, at dusk: roofed stands all round, the dog track, floodlights on the roof edge, the twin towers =================
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
  for(let r=0;r<10;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7,19);if(h<.14)continue;const[d,y]=LOW((r+.5)/10);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 return o;})();
type Crowd={t:number;cheer?:number;flash?:number};
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{t,cheer=0,flash=0}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5,inV=(p:Pt,m=0)=>Math.abs(p[0])<Bnd+m&&Math.abs(p[1])<Bnd+m;
 // dusk at ~21:40 BST: a deep blue sky, darker overhead, a pale band low down
 s.field(B,.55,.6);
 const hz=P(c,add(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))[1];
 s.tone(K,polyPath([[-Bnd,-Bnd],[Bnd,-Bnd],[Bnd,hz-560],[-Bnd,hz-480]],true),.45);
 towers(s,c);
 const low=new Path2D(),back=new Path2D(),roof=new Path2D(),fas=new Path2D();
 for(let i=0;i<NS;i++){const ad=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};ad(BOWL.back[i],back);ad(BOWL.low[i],low);ad(BOWL.roof[i],roof);ad(BOWL.fascia[i],fas);}
 s.knockout(back);s.fill(K,back,.8);
 s.knockout(low);s.tone(B,low,.4);s.tone(K,low,.3);
 // the crowd: one mark per seat group (white shirts and faces / Benfica and United red / blue / navy coats), bobbing when they cheer
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];let any=0;
 for(const q of BOWL.seats){const d=depthOf(c,q.P);if(d<16)continue;const p=P(c,q.P);if(!inV(p))continue;const z=clamp(c.F*.5/d,2,12),lift=cheer>0?cheer*z*1.2*Math.max(0,Math.sin(tt*11+q.h*TAU)):0;
  inks[q.h<.42?0:q.h<.66?1:q.h<.82?2:3].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);any++;}
 if(any){s.knockout(inks[0],.75);s.fill(R,inks[1],.85);s.fill(B,inks[2],.9);s.fill(K,inks[3],.8);}
 // the roof: dark underside, a lit fascia, and the line of floodlight lamps along its front edge
 s.knockout(roof);s.fill(K,roof,.88);
 s.knockout(fas);s.fill(Y,fas,.35);s.tone(K,fas,.3);
 const lamp=new Path2D(),glow=new Path2D();let nl=0;
 for(const L of BOWL.lamps){const d=depthOf(c,L);if(d<16)continue;const p=P(c,L);if(!inV(p))continue;const z=clamp(c.F*.45/d,2.5,10);lamp.rect(p[0]-z,p[1]-z*.6,z*2,z*1.2);glow.addPath(polyPath(Array.from({length:10},(_,k)=>[p[0]+Math.cos(k/10*TAU)*z*3,p[1]+Math.sin(k/10*TAU)*z*2] as Pt),true));nl++;}
 if(nl){s.tone(Y,glow,.3);s.knockout(lamp);s.fill(Y,lamp,.95);}
 // photographers' flashbulbs round the ground
 if(flash>0){const fp=new Path2D(),r=rng(700+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(20*flash);i++){const q=BOWL.seats[Math.floor(r()*BOWL.seats.length)];const d=depthOf(c,q.P);if(d<16)continue;const[x,y]=P(c,q.P),sz=clamp(c.F*1/d,8,22);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
}
/** Wembley's twin towers behind the far (west) end: white concrete shafts, domed tops and flagpoles, rising over the roof (billboards) */
function towers(s:Sheet,c:Camera){
 const body=new Path2D(),dome=new Path2D(),win=new Path2D(),pole=new Path2D();let n=0;
 for(const z of[-11,11]){const base:V3=[-152,16,z];if(depthOf(c,base)<30)continue;const k=kAt(c,base),[x,y]=P(c,base);if(Math.abs(x)>s.W*1.2)continue;
  const top=P(c,[-152,31,z])[1],dt=P(c,[-152,39,z])[1],pt=P(c,[-152,45,z])[1],w=3.6*k;
  body.addPath(polyPath([[x-w,y],[x+w,y],[x+w*.9,top],[x-w*.9,top]],true));
  dome.addPath(polyPath([...Array.from({length:13},(_,i)=>{const a=Math.PI*i/12;return[x-Math.cos(a)*w*.86,top-(top-dt)*Math.sin(a)] as Pt;})],true));
  dome.rect(x-w*.95,top-.8*k,w*1.9,1.2*k);
  for(let j=0;j<3;j++){const yy=lerp(y,top,.3+j*.22);win.rect(x-w*.12,yy-1.6*k,w*.24,1.6*k);}
  pole.addPath(ribbon([[x,dt],[x,pt]],Math.max(1.5,.3*k),{taper:0,wobble:0}));n++;}
 if(!n)return;s.knockout(body);s.tone(B,body,.2);s.knockout(dome);s.tone(B,dome,.3);s.tone(K,dome,.15);s.fill(K,win,.7);s.fill(K,pole,.9);
 s.stroke(K,body,3,.6);
}
/** the pitch: cinder dog track (red × navy), floodlit grass (yellow × blue), mowing stripes, paper lines, both goals */
function ground(s:Sheet,c:Camera,o:{net?:(p:V3)=>V3;goalLater?:boolean}={}){
 const tr=new Path2D();addPoly(tr,clipPoly(c,Array.from({length:NS},(_,i)=>rim(i/NS*TAU,-.6,0))));s.knockout(tr);s.fill(R,tr,.5);s.tone(K,tr,.22);
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-110,0,-38],[5,0,-38],[5,0,38],[-110,0,38]]));s.knockout(gp);s.fill(Y,gp,.88);s.tone(B,gp,.62);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5,0,-34],[x+5,0,34],[x,0,34]]));s.tone(B,stripes,.2);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.14);
 Ln([-105,-34],[0,-34]);Ln([-105,34],[0,34]);Ln([0,-34],[0,34]);Ln([-105,-34],[-105,34]);Ln([-52.5,-34],[-52.5,34]);
 const arc=(cx:number,cz:number,r:number,a0:number,a1:number,n:number)=>{let prev:[number,number]|null=null;for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n,p:[number,number]=[cx+Math.cos(a)*r,cz+Math.sin(a)*r];if(prev)Ln(prev,p);prev=p;}};
 arc(-52.5,0,9.15,0,TAU,24);
 for(const[gx,d] of[[0,-1],[-105,1]] as[number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;Ln([gx,-20.16],[bx,-20.16]);Ln([bx,-20.16],[bx,20.16]);Ln([bx,20.16],[gx,20.16]);Ln([gx,-9.16],[sx,-9.16]);Ln([sx,-9.16],[sx,9.16]);Ln([sx,9.16],[gx,9.16]);
  const a=Math.acos(5.5/9.15);if(d<0)arc(gx-11,0,9.15,Math.PI-a,Math.PI+a,8);else arc(gx+11,0,9.15,-a,a,8);
  addPoly(lines,clipPoly(c,[[gx+d*11-.15,.02,-.15],[gx+d*11+.15,.02,-.15],[gx+d*11+.15,.02,.15],[gx+d*11-.15,.02,.15]]));}
 s.knockout(lines,.95);
 goal(s,c,-105,-1);
 if(!o.goalLater)goal(s,c,0,1,o.net);
}
/** a 1960s goal on the line x = X, net 2 m deep toward dir: square posts, a box net on stanchions; `net` displaces the mesh (ripple) */
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
const netRipple=(age:number,hit:V3)=>(p:V3):V3=>{const d=Math.hypot(p[1]-hit[1],p[2]-hit[2])+Math.abs(p[0]-2)*.6,w=.45*Math.exp(-age*2.2)*Math.exp(-d*d*.4)*Math.cos(d*3-age*14)*clamp(age*8);return[p[0]+w*.9,p[1]-w*.2,p[2]];};

// ================= the white floodlight ball (paper, blue shade, navy stitched panels) =================
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

// ================= kits (29 May 1968) and the figure adapter =================
const SKIN_LIGHT:AthleteStyle['skin']=[[R,.2],[Y,.45]],SKIN_DARK:AthleteStyle['skin']=[[R,.45],[Y,.6],[K,.32]];
/** Manchester United's blue away strip: blue shirts, shorts and socks (confirmed); long sleeves and paper numbers inferred */
const MU=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,shorts:B,socks:B,boots:K,skin:SKIN_LIGHT,hair:K,hairStyle:'short',line:K,shade:[K,.3],sleeves:'long',numberInk:'paper',...o});
/** Benfica: white shirts with a red collar and red cuffs, white shorts, white socks (confirmed) */
const BEN=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',trim:R,boots:K,skin:SKIN_LIGHT,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'long',numberInk:[R,.9],...o});
const BEST:AthleteStyle=MU({number:7,hairStyle:'long',build:{height:1.75,bulk:1,thighs:1.04},seed:7});
const HENRIQUE:AthleteStyle={shirt:[K,.4],shorts:[K,.88],socks:[K,.4],boots:K,skin:SKIN_LIGHT,hair:K,hairStyle:'short',line:K,sleeves:'long',shade:[K,.26],number:1,numberInk:'paper',build:{height:1.8},seed:1};
const STEPNEY:AthleteStyle={shirt:[K,.4],shorts:[K,.85],socks:[K,.45],boots:K,skin:SKIN_LIGHT,hair:[K,.7],line:K,sleeves:'long',shade:[K,.26],seed:41};
const REF:AthleteStyle={shirt:[K,.9],shorts:[K,.9],socks:[K,.9],trim:'paper',boots:K,skin:SKIN_LIGHT,hair:[K,.6],hairStyle:'balding',line:K,sleeves:'short',seed:33};
/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, continuous-silhouette body). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:AthleteStyle,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean}={}):DrawResult{
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,style,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,style,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 Best's first touch) =================
type TK=[number,number,number];// τ, x, z
type Role='best'|'mu'|'ben'|'gk'|'ref';
type Actor={name:string;role:Role;style:AthleteStyle;keys:TK[];key?:boolean};
/** Positions are Hermite-interpolated between keys. Only Stepney, Kidd, Best, Henrique and "the defence" come from the accounts. */
const ACTORS:Actor[]=[
 {name:'Best',role:'best',style:BEST,key:true,keys:[[-8,-49,6.5],[-4.4,-47,5.5],[-2.5,-43.5,3],[-1.2,-40.6,.8],[-.5,-38.6,-.6],[0,-37.1,-1.3],[.6,-34,-1.5],[1.2,-31,-1.5],[1.8,-28,-1.2],[2.3,-25.6,-.5],[2.8,-23.2,.4],[3.4,-20.3,.7],[4,-17.4,.6],[4.45,-15.4,.5],[4.8,-14.1,.6],[5.1,-13.2,-.2],[5.45,-12.1,-1.4],[5.85,-10.7,-2.5],[6.25,-9.2,-3.05],[6.6,-8.2,-3.15],[7,-7.3,-3],[7.6,-6.5,-2.4],[8.4,-6.3,-.7],[9.4,-7.6,2.4],[11,-10.4,6.2],[14,-15,11]]},
 {name:'Henrique',role:'gk',style:HENRIQUE,key:true,keys:[[-8,-2.2,-.4],[-4,-2.8,-.8],[-1,-3.5,-.9],[1,-4.6,-.6],[2.5,-6.3,-.2],[3.6,-8.2,.1],[4.4,-9.6,.25],[4.75,-10.1,.3],[14,-10.1,.3]]},
 {name:'Jacinto',role:'ben',style:BEN({number:4,seed:44,hair:[K,.9]}),key:true,keys:[[-8,-31,-9],[-3,-33.5,-6],[0,-31.5,-4.2],[1.2,-27.5,-2.8],[2,-25,-1.8],[2.3,-24.6,-1.6],[2.7,-24.4,-1.4],[3.4,-22.5,-1.3],[5,-16.5,-1.6],[6.6,-11,-2.2],[8,-6.8,-2.1],[10,-4.6,-1.5],[14,-4,-1]]},
 {name:'Kidd',role:'mu',style:MU({number:8,seed:8}),key:true,keys:[[-8,-54,-7],[-4.4,-50.5,-4.8],[-2.2,-46.4,-3.7],[-1.65,-45.4,-3.5],[-1.2,-45.2,-3.5],[-.7,-45,-3.4],[1,-40,-3.6],[4,-31,-4.5],[8,-20,-4],[14,-12,-3]]},
 {name:'Humberto',role:'ben',style:BEN({number:3,seed:43,hairStyle:'curly'}),keys:[[-8,-24,7],[0,-27.5,6],[2,-24,5.6],[4,-17,5],[6,-11,3.4],[7.8,-5.6,1.2],[10,-3.4,.2],[14,-3,0]]},
 {name:'Cruz',role:'ben',style:BEN({number:5,seed:45}),keys:[[-8,-22,15],[0,-24,12],[4,-17,8.5],[8,-9,4.5],[11,-6,3],[14,-5.5,2.5]]},
 {name:'Calisto',role:'ben',style:BEN({number:2,seed:42}),keys:[[-8,-27,-17],[0,-29,-14],[5,-19,-10],[8,-12,-7],[11,-8,-5],[14,-7,-4]]},
 {name:'Coluna',role:'ben',style:BEN({number:7,seed:47,skin:SKIN_DARK}),keys:[[-8,-41,-8],[0,-40,-5],[4,-31,-2.5],[8,-22,-1],[11,-16,0],[14,-13,0]]},
 {name:'Graça',role:'ben',style:BEN({number:6,seed:46}),keys:[[-8,-47,16],[0,-45,12],[8,-30,6],[14,-22,4]]},
 {name:'Eusébio',role:'ben',style:BEN({number:10,seed:50,skin:SKIN_DARK}),keys:[[-8,-54,-14],[0,-50,-10],[8,-38,-6],[14,-30,-4]]},
 {name:'Aston',role:'mu',style:MU({number:11,seed:11,hair:[K,.8]}),keys:[[-8,-45,-26],[0,-36,-22],[8,-20,-15],[14,-14,-10]]},
 {name:'Charlton',role:'mu',style:MU({number:9,seed:9,hairStyle:'balding',hair:[K,.7]}),keys:[[-8,-58,10],[0,-47,9],[8,-30,6],[12,-22,5],[14,-19,5]]},
 {name:'Sadler',role:'mu',style:MU({number:10,seed:10}),keys:[[-8,-66,2],[8,-50,0],[14,-42,0]]},
 {name:'Crerand',role:'mu',style:MU({number:4,seed:4}),keys:[[-8,-60,-12],[8,-48,-8],[14,-40,-6]]},
 {name:'Stepney',role:'gk',style:STEPNEY,keys:[[-8,-102.8,-3.6],[-5.6,-102.6,-3.5],[-4.9,-100.9,-2.9],[-4.4,-100.1,-2.5],[-3.5,-99.4,-2.1],[14,-99.8,-1]]},
 {name:'Lo Bello',role:'ref',style:REF,keys:[[-8,-52,-2],[0,-44,-9],[8,-24,-11],[14,-18,-10]]},
];
const BESTI=0,GKI=1,JACI=2,KIDDI=3,STEPI=14;
/** Hermite through time-spaced keys (tangents scaled by segment length so speed stays continuous) */
function herm(keys:TK[],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:1|2)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
/** per-actor tables at 50 Hz: position and distance run (the gait phase) — built once at module load */
const TA=-8,TB=14,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(TB-TA)/DT;i++){const[x,z]=herm(a.keys,TA+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-TA)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.1),b=posOf(k,tau+.1);return[(b[0]-a[0])/.2,(b[1]-a[1])/.2];};

// ---- the ball: Stepney's long goal kick (ballistic), Kidd's header (ballistic), a hop to Best, his touches, the touch round, the roll ----
const G=9.81,KICK=-4.4,HEAD=-1.2,LANDT=-.45,CYC=2.8;
const S0:V3=[-99.5,.11,-2.2],KH:V3=[-45.05,2.32,-3.5],LAND:V3=[-38.9,.11,-2.1];
const ROUND=4.95,SHOT=6.6,ROLL=1.3,IN_NET=SHOT+ROLL,GOALPT:V3=[.15,.11,-1.35],REST:V3=[1.65,.14,-1.15];
/** Best's heading: along his run (smoothed), turned toward the goal for the finish */
function yawBest(tau:number){const v=velOf(BESTI,tau),run=Math.hypot(v[0],v[1])>.4?YAW(v[0],v[1]):0,[x,z]=posOf(BESTI,tau),toGoal=YAW(GOALPT[0]-x,GOALPT[2]-z);return lerpAng(run,toGoal,sm(SHOT-.55,SHOT-.2,tau)*(1-sm(SHOT+.6,SHOT+1.1,tau)));}
/** the ball spot at a boot: ahead and a touch to the side of that foot */
function footAt(tau:number,foot:'l'|'r',ahead=.48):[number,number]{const p=posOf(BESTI,tau),y=yawBest(tau),fx=Math.cos(y),fz=-Math.sin(y),rx=Math.sin(y),rz=Math.cos(y),sd=foot==='r'?.1:-.12;return[p[0]+fx*ahead+rx*sd,p[1]+fz*ahead+rz*sd];}
/** touches: one per dribble stride (right foot) from the first touch until he sizes up the keeper, the swerve past the defender, the
 * left-foot touch round the keeper, and the finish */
const TOUCHES:{t:number;foot:'l'|'r'}[]=(()=>{const forced=[2.3],out:number[]=[0];let prev=distOf(BESTI,0)/CYC-touchPhase;
 for(let tau=DT;tau<4.5;tau+=DT){const ph=distOf(BESTI,tau)/CYC-touchPhase;if(Math.floor(ph)>Math.floor(prev)&&tau-out[out.length-1]>.3&&forced.every(f=>Math.abs(f-tau)>.3))out.push(tau);prev=ph;}
 return[...[...out,...forced].sort((a,b)=>a-b).map(t=>({t,foot:'r' as const})),{t:ROUND,foot:'l' as const},{t:SHOT,foot:'l' as const}];})();
const TP:[number,number][]=TOUCHES.map(q=>q.t===SHOT?footAt(SHOT,'l',.36):footAt(q.t,q.foot));
const SHOT_AT:V3=[TP[TP.length-1][0],.11,TP[TP.length-1][1]];
function ballAt(tau:number):V3{
 if(tau<KICK)return S0;
 if(tau<HEAD){const s=tau-KICK,D=HEAD-KICK,u=s/D,vy=(KH[1]-S0[1]+.5*G*D*D)/D;return[lerp(S0[0],KH[0],u),S0[1]+vy*s-.5*G*s*s,lerp(S0[2],KH[2],u)];}
 if(tau<LANDT){const s=tau-HEAD,D=LANDT-HEAD,u=s/D,vy=(LAND[1]-KH[1]+.5*G*D*D)/D;return[lerp(KH[0],LAND[0],u),KH[1]+vy*s-.5*G*s*s,lerp(KH[2],LAND[2],u)];}
 if(tau<0){const u=(tau-LANDT)/-LANDT;return[lerp(LAND[0],TP[0][0],u),.11+.62*4*u*(1-u),lerp(LAND[2],TP[0][1],u)];}
 if(tau<SHOT){let k=0;while(k+1<TOUCHES.length&&tau>=TOUCHES[k+1].t)k++;const u=(tau-TOUCHES[k].t)/(TOUCHES[k+1].t-TOUCHES[k].t),e=k+1===TOUCHES.length-1?1-Math.pow(1-u,1.6):1-(1-u)*(1-u);return[lerp(TP[k][0],TP[k+1][0],e),.11,lerp(TP[k][1],TP[k+1][1],e)];}
 if(tau<IN_NET){const u=(tau-SHOT)/ROLL,e=u*(1.12-.12*u);return mix3(SHOT_AT,GOALPT,e);}
 const u=clamp((tau-IN_NET)/.6);return mix3(GOALPT,REST,easeOut(u));
}
const NET_HIT:V3=[2,.3,-1.2];

// ---- poses ----
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
/** over(): blend channel overrides (degrees) into a pose */
const LIN=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as(keyof Pose)[]){const v=LIN.has(k)?d[k]!:d[k]!*D2R;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
/** the dummy: shoulder dropped to his right, weight on the right leg, arms out for balance, eyes on the keeper */
const DUMMY:Partial<Pose>={roll:13,bend:15,lean:20,twist:-12,rHipF:28,rKnee:62,rHipA:14,lHipF:16,lKnee:30,lHipA:22,lShA:64,rShA:34,lElb:30,rElb:50,neckP:-4,neckY:-10,squash:-.06};
/** the touch round: the body swings the other way, the left boot takes the ball out to the left */
const ROUNDP:Partial<Pose>={roll:-10,bend:-12,lean:18,twist:10,lHipF:34,lKnee:26,lAnk:30,lHipR:-16,lHipA:12,rKnee:54,rHipF:10,lShA:34,rShA:72,neckP:24,neckY:6};
/** a pose + yaw for actor k at τ */
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.45?YAW(v[0],v[1]):YAW(b[0]-x,b[2]-z);
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='ben'?READY:stand();
 let p:Pose;
 if(k===BESTI){yaw=yawBest(tau);
  if(tau<-.4){const s=clamp((sp-2)/5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.3+2*s),{speed:s}),clamp((sp-.4)/.8));}
  else{const s=clamp((sp-2)/4.5),dr=dribble(distOf(k,tau)/CYC,{foot:'r',speed:.45+.4*s});p=blendPose(idle,dr,clamp((sp-.3)/.8));}
  if(tau>-.9&&tau<.3)p=over(p,{lean:14,neckP:32,lShA:40,rShA:36},bump(-.9,.3,tau));// eyes on the dropping ball
  p=over(p,DUMMY,bump(4.3,5.0,tau));
  p=over(p,ROUNDP,bump(4.78,5.35,tau));
  if(tau>5.3&&tau<SHOT)p=over(p,{neckP:26},bump(5.3,SHOT,tau));
  const D=.95,st=SHOT-STRIKE_CONTACT*D,u=(tau-st)/D;
  if(u>0&&u<1.5)p=blendPose(p,strike(Math.min(1,u),{foot:'l',power:.28}),Math.min(sm(0,.18,u),1-sm(1.1,1.5,u)));
  if(tau>IN_NET-.3)p=blendPose(p,celebrate(Math.max(0,tau-IN_NET+.3)*1.1,{kind:'run'}),sm(IN_NET-.3,IN_NET+.3,tau));
  if(tau>IN_NET+1.2)p=blendPose(p,{...celebrate(0,{kind:'run'}),lShA:170*D2R,rShA:30*D2R,lElb:10*D2R,lHand:1,neckP:-24*D2R},sm(IN_NET+1.2,IN_NET+1.7,tau)*(1-sm(IN_NET+3.2,IN_NET+3.8,tau)));
  return{p,yaw};}
 if(a.role==='gk'){yaw=YAW(b[0]-x,b[2]-z);const s=clamp((sp-1)/5);p=blendPose(idle,runCycle(distOf(k,tau)/2.6,{speed:s}),clamp((sp-.6)/1));
  if(k===GKI&&tau>4.72){const u=(tau-4.72)/.95,y0=(()=>{const[bx,bz]=[ballAt(4.72)[0],ballAt(4.72)[2]];return YAW(bx-x,bz-z);})();
   p=keeperDive(clamp(u),{side:'l',height:.03});yaw=y0;
   if(tau>IN_NET)p=over(p,{neckP:-30,neckY:-40},sm(IN_NET,IN_NET+.6,tau));}
  if(k===STEPI){const D=1.1,u=(tau-(KICK-STRIKE_CONTACT*D))/D;yaw=YAW(1,-.02);if(u>-.3&&u<1.6)p=blendPose(p,strike(clamp(u),{foot:'r',power:1}),Math.min(sm(-.3,0,u),1-sm(1,1.6,u)));}
  return{p,yaw};}
 const along=v[0]*Math.cos(yaw)-v[1]*Math.sin(yaw);
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.4+2.2*s),{speed:s}),clamp((sp-.5)/.9));}
 if(k===KIDDI){const D=.85,u=(tau-(HEAD-.52*D))/D;if(u>-.2&&u<1.3){yaw=YAW(S0[0]-x,S0[2]-z)+.5;p=blendPose(p,header(clamp(u)),Math.min(sm(-.2,0,u),1-sm(1,1.3,u)));}}
 if(k===JACI){const[bx,bz]=posOf(BESTI,tau);if(tau>-.5&&tau<2.9)yaw=lerpAng(yaw,YAW(bx-x,bz-z),Math.min(sm(-.5,0,tau),1-sm(2.5,2.9,tau)));
  const t0=2.3-.6*.8,u=(tau-t0)/.8;if(u>0&&u<1.5)p=blendPose(p,lunge(Math.min(1,u),{side:'l'}),Math.min(sm(0,.12,u),1-sm(1,1.5,u)));}
 return{p,yaw};
}

type Item={depth:number;draw:()=>void};
type World={ball:V3;res:Map<number,DrawResult>};
/** everyone and the ball at τ (poses on twos at tp), depth sorted; `hero` draws Best with motion smear + secondary motion */
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;glow?:number}):World{
 const b=ballAt(tau),items:Item[]=[],res=new Map<number,DrawResult>();
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!(s as unknown as {_passage?:{pending?:unknown}})._passage?.pending;
 ACTORS.forEach((a,k)=>{const[x,z]=posOf(k,tau),g:V3=[x,0,z],d=depthOf(c,g);if(d<1)return;const[gx,gy]=P(c,g),kk=kAt(c,g);if(Math.abs(gx)>s.W*.62+kk*2||gy<-s.H*.6||gy>s.H*.6+2.4*kk)return;
  items.push({depth:d,draw:()=>{const{p,yaw}=poseOf(k,tp),px=kk*1.8*ppu,place:Place={x,z,yaw};
   const detail=passing?(k===BESTI?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
   const big=px>=90&&!passing&&(k===BESTI||a.key);
   const prev=big?{pose:poseOf(k,tp-1/12).p,place:{x:posOf(k,tau-1/12)[0],z:posOf(k,tau-1/12)[1],yaw:poseOf(k,tp-1/12).yaw}}:undefined;
   res.set(k,drawPlayer(s,p,c,{...a.style,detail},place,{prev,smear:!!o.hero&&k===BESTI}));}});});
 items.push({depth:depthOf(c,b),draw:()=>{if(depthOf(c,b)<NEAR)return;const a=P(c,ballAt(tau-.03)),q=P(c,b),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,b));ballShadow(s,c,b);
  if(o.glow&&o.glow>.02)s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>[q[0]+Math.cos(i/20*TAU)*r*1.6,q[1]+Math.sin(i/20*TAU)*r*1.6] as Pt),true),r*.25*o.glow,.95);
  ball(s,q[0],q[1],r,tau*7,{sq:clamp(sp/(r*3),0,.7),dir:Math.atan2(dy,dx)});}});
 items.sort((a,b2)=>b2.depth-a.depth).forEach(i=>i.draw());
 return{ball:b,res};}

// ================= teaching marks =================
/** a ribbon on the grass along ground points (metres), width in metres; progress 0..1; optional arrowhead */
function groundTrail(s:Sheet,c:Camera,pts:[number,number][],wm:number,ink:string,o:{progress?:number;cov?:number;head?:boolean;dashed?:boolean;seed?:number}={}){
 const{progress=1,cov=.95,head=true,dashed=false,seed=5}=o;if(progress<=.01)return;
 const n=Math.max(2,Math.round(pts.length*clamp(progress))),q:Pt[]=[];let d=1;for(const p of pts.slice(0,n)){const g:V3=[p[0],.03,p[1]];const dd=depthOf(c,g);if(dd<NEAR+.2)continue;q.push(P(c,g));d=dd;}
 if(q.length<2)return;const w=Math.max(5,c.F*wm/d),gaps:[number,number][]=[];if(dashed)for(let x=.08;x<.95;x+=.14)gaps.push([x,x+.07]);
 s.knockout(ribbon(q,w*1.6,{seed,taper:.1,wobble:.8,gaps}),.8*cov);s.fill(ink,ribbon(q,w,{seed,taper:.1,wobble:.8,gaps}),cov);
 if(head&&q.length>2){const a=q[q.length-2],b=q[q.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.02,b[1]+(b[1]-a[1])*.02],w,{seed:seed+1,head:w*3,cov});}}
const pathOf=(k:number,t0:number,t1:number,n=16):[number,number][]=>Array.from({length:n+1},(_,i)=>posOf(k,t0+(t1-t0)*i/n));
const ballPath=(t0:number,t1:number,n=16):[number,number][]=>Array.from({length:n+1},(_,i)=>{const b=ballAt(t0+(t1-t0)*i/n);return[b[0],b[2]] as [number,number];});
/** a ring on the grass (centre, radii in metres) */
function groundRing(s:Sheet,c:Camera,cx:number,cz:number,rx:number,rz:number,wm:number,ink:string,cov:number,seed=7){
 if(cov<=.02)return;const pts:Pt[]=[];let d=1;for(let i=0;i<40;i++){const g:V3=[cx+Math.cos(i/40*TAU)*rx,.03,cz+Math.sin(i/40*TAU)*rz];const dd=depthOf(c,g);if(dd<NEAR+.2)return;pts.push(P(c,g));d=dd;}
 const w=Math.max(5,c.F*wm/d);s.knockout(ribbon(pts,w*1.6,{close:true,seed,taper:0,wobble:1}),.8*cov);s.fill(ink,ribbon(pts,w,{close:true,seed,taper:0,wobble:1}),cov);}
/** the open goal mouth, lit: a yellow outline round posts and bar and a light screen inside */
function goalMouth(s:Sheet,c:Camera,w:number){if(w<=.02)return;const q=clipPoly(c,[[0,0,-3.66],[0,2.44,-3.66],[0,2.44,3.66],[0,0,3.66]]);if(q.length<3)return;
 const p=new Path2D();addPoly(p,q);s.tone(Y,p,.3*w);s.stroke(Y,p,Math.max(6,.1*kAt(c,[0,1.2,0])),.95*w);}

// ================= chapter 1 (live, near real time): the high main-stand camera; goal kick, header, the run, round the keeper, the net =================
const tau1=(t:number)=>{const kc=T(0,'The keeper kicks'),kh=T(0,'Kidd heads it on'),gb=T(0,'George Best'),rp=T(0,'races past'),rk=T(0,'Round the keeper'),g=T(0,'goal'),E=SEC(0);
 return key(t,mono([[0,KICK-(kc-.3)*.5],[kc-.3,KICK],[kh+.1,HEAD],[gb+.2,0],[rp+.3,2.3],[rk+.2,ROUND],[g,IN_NET],[E+1,IN_NET+(E+1-g)]]),linear);};
const CAM1:V3=[-44,19,60];
function look1(tau:number):V3{const b=ballAt(tau);
 if(tau<KICK+.3)return[-100,1,-2.6];
 if(tau<IN_NET)return[b[0],lerp(1,b[1],.3),b[2]*.7];
 const[x,z]=posOf(BESTI,tau);return mix3([b[0]-3,1,b[2]*.7],[x,1,z],sm(IN_NET,IN_NET+1.2,tau));}
function cam1(t:number){const tau=tau1(t),a=look1(tau),b=look1(tau-.3),c=look1(tau-.6),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const F=key(tau,[[-7,8600],[KICK,9000],[-3.3,2700],[HEAD,3400],[0,4000],[2.3,4600],[ROUND,6400],[IN_NET,6600],[IN_NET+2.5,7600]]);return cam(CAM1,look,F);}
const ch1:Scene={
 draw(s,t){const tt=twos(t),c=cam1(t),tau=tau1(t),tp=tau1(tt),goalIn=tau-IN_NET;frame(s);
  stadium(s,c,{t,cheer:.12+.9*sm(0,.5,goalIn),flash:.15+1.3*sm(0,.4,goalIn)});
  ground(s,c,{net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  drawWorld(s,c,tau,tp,{ballMin:9});},
 aperture(t){const c=cam1(t),p=ballAt(tau1(t)),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(9,BALL_R*kAt(c,p))*1.1,12);},
 still:13,
};

// ================= chapter 2 (TV replay, slow motion, low beside the box): the keeper rushes out, the dummy, fooled, one touch round him =================
const tau2=(t:number)=>{const E=SEC(1);return key(t,mono([[0,3.45],[T(1,'Keeper Henrique'),3.7],[T(1,'rushes out')+.5,4.2],[T(1,'Best drops'),4.4],[T(1,'his shoulder')+.35,4.7],[T(1,'the keeper is fooled')+.35,4.9],[T(1,'one touch')+.15,ROUND+.03],[T(1,'round him')+.4,5.5],[E,6.05]]),linear);};
function cam2(t:number){const tau=tau2(t),E=SEC(1),[bx,bz]=posOf(BESTI,tau),[kx,kz]=posOf(GKI,Math.min(tau,4.8)),orbit=sm(T(1,'one touch')-.3,E,t,easeInOutSine),wk=.5-.3*orbit,m:[number,number]=[lerp(bx,kx,wk),lerp(bz,kz,wk)];
 const open=1-sm(0,1.3,t,easeInOutSine),push=sm(T(1,'Best drops')-.4,T(1,'his shoulder')+.3,t,easeInOutSine);
 const early=1-sm(T(1,'rushes out'),T(1,'Best drops'),t,easeInOutSine),pos:V3=[m[0]-6.5+3.5*orbit+3.5*early,1.35+.4*early,m[1]-10.5+1.8*push+1.2*orbit-3.5*early],look:V3=[m[0]+.4+.3*orbit,.95,m[1]-.4-.6*orbit];
 return cam(pos,look,2300+450*push-350*early-0*open);}
const ch2:Scene={
 draw(s,t){const tt=twos(t),c=cam2(t),tau=tau2(t),tp=tau2(tt),E=SEC(1),ro=T(1,'rushes out'),bd=T(1,'Best drops'),hs=T(1,'his shoulder'),kf=T(1,'the keeper is fooled'),ot=T(1,'one touch'),rh=T(1,'round him');frame(s);
  stadium(s,c,{t,cheer:.1});
  ground(s,c);
  // "rushes out": the keeper's run off his line, drawn on the grass
  groundTrail(s,c,pathOf(GKI,1,4.75),.16,R,{progress:sm(ro-.2,ro+.8,t,easeOut),cov:.95*(1-sm(hs,hs+.5,t)),seed:21});
  // "round him": Best's path round the keeper and the ball's
  const rw=sm(rh-.2,rh+.9,t,easeOut)*(1-sm(E-.8,E-.4,t));
  groundTrail(s,c,ballPath(ROUND,SHOT-.2),.12,Y,{progress:rw,dashed:true,head:false,seed:23});
  groundTrail(s,c,pathOf(BESTI,4.6,6.2),.17,R,{progress:rw,seed:25});
  const w=drawWorld(s,c,tau,tp,{ballMin:9,hero:true,glow:sm(ot-.1,ot+.2,t)*(1-sm(rh+.2,rh+.8,t))});
  // "drops his shoulder one way": a dashed yellow arrow out of his shoulder — the way he pretends to go
  const hero=w.res.get(BESTI),gk=w.res.get(GKI);
  const fw=sm(bd-.1,hs+.4,t,easeOut)*(1-sm(ot-.3,ot,t));
  if(hero&&fw>.02){const[x,z]=posOf(BESTI,tau),y=yawBest(tau),rx=Math.sin(y),rz=Math.cos(y),a=hero.joints.rSh,e=P(c,[x+rx*2.2+Math.cos(y)*.8,1.3,z+rz*2.2-Math.sin(y)*.8]),wd=Math.max(6,kAt(c,[x,1,z])*.09);
   s.knockout(ribbon([a,e],wd*1.8,{seed:31,taper:.1}),.6*fw);laneArrow(s,Y,a,e,wd,{dashed:true,progress:fw,seed:31,head:wd*3});}
  // "the keeper is fooled": sparks where he commits
  const age=t-kf;if(gk&&age>-.2&&age<.6){const h=gk.joints.head;sparkBurst(s,R,h[0],h[1],kAt(c,[-10,1,0])*.7,{n:8,seed:33,g:easeOutBack(clamp((age+.2)/.2))*(1-clamp((age-.35)/.25)),width:9});}
  // "one touch": a spark at the boot as the ball goes the other way
  const ag2=tp-ROUND;if(ag2>-.02&&ag2<.3){const q=P(c,[TP[TOUCHES.length-2][0],.15,TP[TOUCHES.length-2][1]]);sparkBurst(s,Y,q[0],q[1],kAt(c,[-12,0,0])*.55,{n:8,seed:35,g:easeOutBack(clamp(ag2/.08))*(1-clamp((ag2-.18)/.12)),width:8});}
  if(t<.5)speedLines(s,K,0,0,0,{n:12,seed:37,len:900,spread:520,width:22,cov:.5*(1-t/.5)});
 },
 aperture(t){const c=cam2(t),p=ballAt(tau2(t)),[x,y]=P(c,p),r=Math.max(9,BALL_R*kAt(c,p));return apertureDisc(x,y,r*1.1,12);},
 still:6,
};

// ================= chapter 3 (reverse-angle replay, low beside the goal line): the empty goal, the calm left-foot roll, the celebration =================
const tau3=(t:number)=>{const E=SEC(2),ge=T(2,'The goal is empty'),nr=T(2,'No rush'),bc=T(2,'Best calmly'),ri=T(2,'rolls it in'),lf=T(2,'left foot');
 return key(t,mono([[0,5.55],[ge+.5,5.95],[nr+.2,6.2],[bc,6.4],[ri+.15,SHOT],[lf+.1,SHOT+.75],[lf+.7,IN_NET+.1],[E,IN_NET+.1+(E-lf-.7)*.9]]),linear);};
function cam3(t:number){const tau=tau3(t),E=SEC(2),[x,z]=posOf(BESTI,tau),cel=sm(IN_NET+.2,IN_NET+1.6,tau,easeInOutSine),b=ballAt(tau);
 const look=mix3([lerp(lerp(x,b[0],.5),-1.5,.55),.95,lerp(lerp(z,b[2],.5),-1,.55)],[x+1,1.1,z],cel),pos:V3=[lerp(1.6,-1,cel),lerp(1.35,1.6,cel),lerp(-11,-9,cel)];
 return cam(pos,look,key(t,mono([[0,1150],[T(2,"Best calmly"),1300],[T(2,"left foot"),1400],[E,1550]])));}
const ch3:Scene={
 draw(s,t){const tt=twos(t),c=cam3(t),tau=tau3(t),tp=tau3(tt),ge=T(2,'The goal is empty'),lf=T(2,'left foot'),ri=T(2,'rolls it in'),E=SEC(2),goalIn=tau-IN_NET;frame(s);
  stadium(s,c,{t,cheer:.1+1*sm(0,.5,goalIn),flash:.1+1.3*sm(0,.4,goalIn)});
  ground(s,c,{net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  // "rolls it in": the slow line of the roll, dotted on the grass, drawn as the ball goes
  if(tau>SHOT-.05){const n=12,pts:[number,number][]=[];for(let i=0;i<=n;i++){const b=ballAt(SHOT+(Math.min(tau,IN_NET)-SHOT)*i/n);pts.push([b[0],b[2]]);}groundTrail(s,c,pts,.1,Y,{dashed:true,head:false,cov:.95*(1-sm(E-.9,E-.4,t)),seed:41});}
  const w=drawWorld(s,c,tau,tp,{ballMin:8,hero:true});
  // "left foot": a ring round his left boot as it rolls the ball
  const hero=w.res.get(BESTI),lw=sm(lf-.2,lf+.2,t,easeOutBack)*(1-sm(lf+1,lf+1.4,t));
  if(hero&&lw>.02){const toe=hero.joints.lToe,an=hero.joints.lAn,r=Math.max(10,Math.hypot(toe[0]-an[0],toe[1]-an[1])*1.3)*lw+2,cx=(toe[0]+an[0])/2,cy=(toe[1]+an[1])/2;
   s.fill(R,ribbon(Array.from({length:26},(_,i)=>[cx+Math.cos(i/26*TAU)*r*1.25,cy+Math.sin(i/26*TAU)*r*.85] as Pt),Math.max(3,r*.2),{seed:43,close:true,taper:0,wobble:.8}),.95*lw);}
  // "the goal is empty": the open mouth lights up
  goalMouth(s,c,sm(ge-.1,ge+.4,t)*(1-sm(ri-.2,ri+.3,t)));
  if(t<.45)speedLines(s,K,0,0,Math.PI,{n:12,seed:47,len:900,spread:520,width:22,cov:.5*(1-t/.45)});
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(BESTI,tau3(t)),p:V3=[x,1.3,z],[px,py]=P(c,p);return apertureDisc(px,py,Math.max(12,.22*kAt(c,p)),12);},
 still:4.5,
};

// ================= chapter 4 (the lesson, a low side camera): one on one, fake one way, touch it round, pass it in calmly =================
const tau4=(t:number)=>{const E=SEC(3),oo=T(3,'one on one'),fk=T(3,'fake one way'),tr=T(3,'touch it round'),tk=T(3,'the keeper'),pi=T(3,'pass it in calmly');
 return key(t,mono([[0,3.7],[oo+.4,4.25],[fk,4.4],[fk+.8,4.82],[tr+.1,ROUND+.02],[tk+.4,5.55],[pi,6.2],[pi+.6,SHOT+.1],[E,IN_NET+.35]]),linear);};
function cam4(t:number){const tau=tau4(t),E=SEC(3),[bx,bz]=posOf(BESTI,tau),follow=sm(T(3,'pass it in calmly')-.6,E-.5,t,easeInOutSine),push=sm(T(3,'one on one')-.3,T(3,'fake one way'),t,easeInOutSine);
 const look:V3=[lerp(lerp(-11,bx+1,.45),-4.5,follow),.85,lerp(lerp(-.6,bz,.35),-1.6,follow)];
 return cam([look[0]-1.5,1.55,look[2]-12.5+1.5*push-1.5*follow],look,2050+250*push-150*follow);}
const ch4:Scene={
 draw(s,t){const tt=twos(t),c=cam4(t),tau=tau4(t),tp=tau4(tt),E=SEC(3),oo=T(3,'one on one'),fk=T(3,'fake one way'),tr=T(3,'touch it round'),tk=T(3,'the keeper'),pi=T(3,'pass it in calmly');frame(s);
  stadium(s,c,{t,cheer:.08});
  ground(s,c);
  // "one on one": a ring on the grass holding just Best and the keeper
  const[bx,bz]=posOf(BESTI,tau),[kx,kz]=posOf(GKI,Math.min(tau,4.75)),ow=sm(oo-.1,oo+.4,t,easeOutBack)*(1-sm(fk+.3,fk+.8,t));
  groundRing(s,c,(bx+kx)/2,(bz+kz)/2,Math.hypot(bx-kx,bz-kz)/2+1.3,1.8,.1,Y,.95*clamp(ow),51);
  // "touch it round the keeper": the ball's line past him (red) and Best's run (dashed)
  const rw=sm(tr-.1,tk+.6,t,easeOut)*(1-sm(pi-.3,pi+.2,t));
  groundTrail(s,c,ballPath(ROUND,SHOT-.1),.14,R,{progress:rw,seed:53});
  groundTrail(s,c,pathOf(BESTI,4.9,SHOT-.1),.1,Y,{progress:rw,dashed:true,head:false,seed:55});
  // "pass it in calmly": a slow yellow line into the empty goal, and calm rings round the ball
  const pw=sm(pi-.2,pi+.8,t,easeOut)*(1-sm(E-.6,E-.2,t));
  groundTrail(s,c,[[SHOT_AT[0],SHOT_AT[2]],[lerp(SHOT_AT[0],GOALPT[0],.5),lerp(SHOT_AT[2],GOALPT[2],.5)],[GOALPT[0],GOALPT[2]]],.12,Y,{progress:pw,seed:57});
  goalMouth(s,c,pw*.8);
  const w=drawWorld(s,c,tau,tp,{ballMin:8,hero:true});
  const hero=w.res.get(BESTI),gk=w.res.get(GKI);
  // "fake one way": a dashed arrow off his shoulder — the way he pretends to go
  const fw=sm(fk-.1,fk+.6,t,easeOut)*(1-sm(tr-.2,tr+.1,t));
  if(hero&&fw>.02){const y=yawBest(tau),rx=Math.sin(y),rz=Math.cos(y),a=hero.joints.rSh,e=P(c,[bx+rx*2+Math.cos(y)*.9,1.3,bz+rz*2-Math.sin(y)*.9]),wd=Math.max(6,kAt(c,[bx,1,bz])*.09);
   s.knockout(ribbon([a,e],wd*1.8,{seed:59,taper:.1}),.6*fw);laneArrow(s,Y,a,e,wd,{dashed:true,progress:fw,seed:59,head:wd*3});}
  // "the keeper": he has gone down the wrong way — a red spark
  const age=t-tk;if(gk&&age>-.2&&age<.7){const h=gk.joints.head;sparkBurst(s,R,h[0],h[1],kAt(c,[-10,1,0])*.7,{n:8,seed:61,g:easeOutBack(clamp((age+.2)/.2))*(1-clamp((age-.45)/.25)),width:9});}
  // calm: slow rings breathing out from the ball as he rolls it
  const cw=sm(pi,pi+.4,t)*(1-sm(E-.8,E-.3,t));if(cw>.02){const b=w.ball;for(let i=0;i<2;i++){const ph=((t-pi)*.6+i*.5)%1;groundRing(s,c,b[0],b[2],.35+ph*1.1,.3+ph*.9,.035,Y,cw*(1-ph)*.9,63+i);}}
 },
 still:5,
};

const story:RisoStory={
 id:'best-final-1968',format:'11v11',title:'Best rounds the keeper, 1968',
 theme:'One on one: fake one way, touch it round the keeper, then pass it in calmly.',
 ageNote:'European Cup final, Benfica 1–4 Manchester United (after extra time), Wembley Stadium, London, 29 May 1968. Best was 22.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a photographer's flashbulb pops and the white ball hops from the point. Reduced motion: the ball and ring, still. */
 touch(s,x,y,age,seed){
  const r=rng(seed),a=r()*TAU,up=age<=0?0:Math.sin(clamp(age/.8)*Math.PI)*150,g=age<=0?1:easeOutBack(clamp(age/.25));
  s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>{const q=i/20*TAU;return[x+Math.cos(q)*110*g,y+Math.sin(q)*34*g] as Pt;}),true),12,.95);
  if(age>0&&age<.45){const fl=1-clamp(age/.45);s.knockout(polyPath([[x+Math.cos(a)*30,y-up-70*fl],[x+14,y-up],[x,y-up+70*fl],[x-14,y-up]],true));sparkBurst(s,Y,x,y-up,140*g,{n:9,seed,g:fl,width:12});}
  ball(s,x,y-up,56,age*9+hash(seed,3)*TAU,{sq:age>0?.18*Math.max(0,1-age*5):0,dir:-Math.PI/2});
 },
};
export default story;
