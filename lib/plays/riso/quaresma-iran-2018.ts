/** Iconic play film: Ricardo Quaresma's trivela, 2018 FIFA World Cup, Group B, Iran 1–1 Portugal, Mordovia Arena, Saransk, 25 June 2018 —
 * Portugal's goal, 45th minute.
 * A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration text: public/plays/narration/quaresma-iran-2018/script.json, voiced with local Kokoro (af_bella, speed 1.0); timing.json is imported
 * below and `withTiming` re-times every action through the cue words (no scene code reads a hard-coded second).
 *
 * SOURCES (read Sept 2026 as raw pages; we cannot watch the footage):
 *  - Wikipedia, "2018 FIFA World Cup Group B" (raw wikitext: Iran vs Portugal account, football box, kit boxes and line-ups citing FIFA's
 *    Tactical Line-up PDF)  https://en.wikipedia.org/wiki/2018_FIFA_World_Cup_Group_B
 *  - BBC Sport, Matthew Henry, "Iran 1-1 Portugal" (25 June 2018)  https://www.bbc.com/sport/football/44439228
 *  - The Guardian, Shaun Walker, "Iran close to stunning Portugal but Quaresma goal is enough" (25 June 2018)
 *    https://www.theguardian.com/football/2018/jun/25/iran-portugal-world-cup-group-b-match-report
 * CONFIRMED by those accounts: 25 June 2018, 21:00 local, Mordovia Arena, Saransk, 41,685; 45th minute ("just before half-time", Guardian);
 *  Quaresma "CUT IN FROM THE RIGHT flank, PLAYED A ONE-TWO with a team-mate, then curled a RIGHT-FOOTED shot from the EDGE OF THE PENALTY AREA
 *  into the FAR TOP CORNER with the OUTSIDE OF HIS BOOT" (BBC); "from the corner of the area … across the keeper, Alireza Beiranvand" (Guardian);
 *  "looped over Beiranvand into the top-left corner" (Wikipedia); man of the match; the Guardian's photo caption: Quaresma celebrates the goal
 *  WITH CRISTIANO RONALDO. KITS (FIFA line-up via Wikipedia): Portugal RED shirts, RED shorts, GREEN socks; Iran ALL WHITE. Numbers: Quaresma 20,
 *  Ronaldo 7, Adrien Silva 23, Beiranvand 1.
 * INFERRED / ILLUSTRATIVE: which team-mate gave the return pass (drawn as No. 23, Adrien Silva, not narrated); every position, run and timing in
 *  metres and seconds (the shot from ≈ 24 m, ≈ 1.1 s flight, a peak ≈ 2.8 m, a sideways bend ≈ 2.4 m); the curve PHYSICS: an outside-of-the-
 *  right-foot strike spins the ball clockwise seen from above, so it swerves to HIS RIGHT: it is struck out to the left of the far post and bends
 *  back in under the bar (the top-left corner from his view = the far post from the right flank, consistent with every account); Beiranvand's
 *  kit (drawn dark navy with paper trim), his position and his late, beaten dive; the other players' places; Quaresma's celebration run toward
 *  the right corner and where Ronaldo meets him; the night light, the single-tier roofed bowl, crowd colours (Iran white/red/green, Portugal red);
 *  the ball (white with navy panels); which side of the ground the main camera sits (drawn: Portugal attacking right → left, the right flank on
 *  the far side); camera placements and lenses.
 *
 * STRUCTURE (a 1:1 recreation of the broadcast; never top-down): the play is ONE simulation on a real clock τ (seconds, τ = 0 the shot):
 * ch1 = the high main-stand broadcast camera in near real time (the cut inside, the one-two, the strike, the net); ch2 = the TV slow-motion
 * replay low behind the shooter (the ball starts out wide and swerves back over the keeper into the far top corner); ch3 = a low track-side
 * camera (he races away, Ronaldo joins); ch4 = the lesson on a close side camera (the outside of the boot, the curve away from the keeper).
 * Seams are forward passages into the ball. Figures: lib/plays/riso/athlete.ts through ONE adapter, drawPlayer(). World: right-handed metres,
 * y up, the goal Portugal attack is the line x = 0, the pitch runs to x = −105, +z = Portugal's RIGHT (athlete.ts: yaw 0 faces +x, right = +z).
 * Inks: yellow (floodlights, teaching marks), red (Portugal, skin), green (grass with yellow, Portugal's socks), navy (night, key line).
 * Scenes read only their local t; figures pose on twos, cameras on ones; all randomness is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,linear,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,laneArrow,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,posed,blendPose,clampPose,runCycle,dribble,stand,strike,backpedal,celebrate,keeperSet,keeperDive,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type Camera,type Place,type V3,type DrawResult} from './athlete';
import {beats,shotAt as shotOf,reframe,near,type Beats,type Keep,type View as DView} from './director';

const K='navy',R='red',Y='yellow',G='green';
const D2R=Math.PI/180;
/** Frame the FULL sheet: world (dx,dy) lands on the sheet centre at `zoom`, ignoring the safe box (the card window is small). */
function frame(s:Sheet,zoom=1,dx=0,dy=0){const S=zoom*s.arrival;DV={w:s.W,h:s.H};s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,zoom/s.fit,0);}
/** the window in camera units (set by frame(); read by the director's reframing, aperture() included) */
let DV:DView={w:1566,h:1080};

// ================= narration (script.json mirrors it) =================
/** Provisional cue onsets (≈2.6 words/s plus pauses) — replaced by the measured Kokoro onsets in timing.json. */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/2.6+(/[.!?]$/.test(w)?.4:/[,;:]$/.test(w)?.18:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`quaresma film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
import timingJson from '../../../public/plays/narration/quaresma-iran-2018/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Saransk, 2018','Saransk, 2018, the World Cup: Portugal, in red, against Iran, in white. Ricardo Quaresma cuts in from the right, plays a quick one-two, and bends it with the outside of his right foot. Goal!',
  ['Saransk','the World Cup','Portugal','in red','against Iran','in white','Ricardo Quaresma','cuts in from the right','plays a quick one-two','bends it','the outside of his right foot','Goal']),
 prov('The trivela','Watch again, slowly. This is the trivela. The ball starts out wide, then swerves back, over keeper Beiranvand, into the far top corner.',
  ['Watch again','slowly','This is the trivela','The ball starts out wide','then swerves back','over keeper Beiranvand','into the far top corner']),
 prov('Half-time lead','Just before half-time! Quaresma races away, and Cristiano Ronaldo joins the celebration.',
  ['Just before','half-time','Quaresma races away','Cristiano Ronaldo','joins the celebration']),
 prov('Your turn','Your turn: hit the ball with the outside of your foot, and it curves away from the keeper.',
  ['Your turn','hit the ball','the outside of your foot','it curves away','from the keeper']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`quaresma film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
const SEC=(ch:number)=>CHAPTERS[ch].seconds;
/** keys forced to increase in time (a retime can never reorder a camera) */
function mono(K0:number[][]):Key[]{let prev=-1e9;return K0.map(k=>{const t=Math.max(k[0],prev+.05);prev=t;return[t,...k.slice(1)];});}

// ================= 3D helpers over athlete.ts cameras =================
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
function quadP(c:Camera,q:V3[],minD=16):Pt[]|null{for(const p of q)if(depthOf(c,p)<minD)return null;return q.map(p=>P(c,p));}

// ================= Mordovia Arena at night: a single roofed tier all round, floodlights in the roof edge, boards =================
const CX=-52.5,NS=56;
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(58+d)*Math.sign(c)*Math.pow(Math.abs(c),.36),y,(40+d)*Math.sign(s)*Math.pow(Math.abs(s),.36)];}
const LOW=(b:number):[number,number]=>[1+26*b,1.4+16*b];
type Bowl={low:V3[][];roof:V3[][];fascia:V3[][];lamps:V3[];seats:{P:V3;h:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],roof:[],fascia:[],lamps:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(d0:number,y0:number,d1:number,y1:number):V3[]=>[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];
  const[l0,h0]=LOW(0),[l1,h1]=LOW(1);o.low.push(Q(l0,h0,l1,h1));
  o.roof.push(Q(20,24,44,28));o.fascia.push(Q(20,22.6,20,24.2));
  for(let k=0;k<2;k++)o.lamps.push(rim((i+(k+.5)/2)/NS*TAU,19.6,23.4));
  for(let r=0;r<11;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7,29);if(h<.1)continue;const[d,y]=LOW((r+.5)/11);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 return o;})();
type Crowd={t:number;cheer?:number;flash?:number};
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{t,cheer=0,flash=0}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5,inV=(p:Pt,m=0)=>Math.abs(p[0])<Bnd+m&&Math.abs(p[1])<Bnd+m;
 // a June night at 21:45: the sky printed navy through a screen, a green-yellow glow low over the roof from the floodlights
 s.field(K,.72,.6);
 const hz=P(c,add(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))[1];
 s.tone(Y,polyPath([[-Bnd,hz-260],[Bnd,hz-300],[Bnd,hz+40],[-Bnd,hz+40]],true),.3);
 const low=new Path2D(),roof=new Path2D(),fas=new Path2D();
 for(let i=0;i<NS;i++){const ad=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};ad(BOWL.low[i],low);ad(BOWL.roof[i],roof);ad(BOWL.fascia[i],fas);}
 s.knockout(low);s.tone(R,low,.3);s.tone(K,low,.45);
 // the crowd: Iran fans in white, red and green; Portugal fans in red; dark coats; bobbing when they cheer
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];let any=0;
 for(const q of BOWL.seats){const d=depthOf(c,q.P);if(d<16)continue;const p=P(c,q.P);if(!inV(p))continue;const z=clamp(c.F*.5/d,2,12),lift=cheer>0?cheer*z*1.2*Math.max(0,Math.sin(tt*11+q.h*TAU)):0;
  inks[q.h<.36?0:q.h<.66?1:q.h<.8?2:3].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);any++;}
 if(any){s.knockout(inks[0],.75);s.fill(R,inks[1],.9);s.fill(G,inks[2],.9);s.fill(K,inks[3],.8);}
 s.knockout(roof);s.fill(K,roof,.85);
 s.knockout(fas);s.tone(R,fas,.3);s.tone(K,fas,.3);
 const lamp=new Path2D(),glow=new Path2D();let nl=0;
 for(const L of BOWL.lamps){const d=depthOf(c,L);if(d<16)continue;const p=P(c,L);if(!inV(p))continue;const z=clamp(c.F*.45/d,2.5,10);lamp.rect(p[0]-z,p[1]-z*.6,z*2,z*1.2);glow.addPath(polyPath(Array.from({length:10},(_,k)=>[p[0]+Math.cos(k/10*TAU)*z*2.6,p[1]+Math.sin(k/10*TAU)*z*1.7] as Pt),true));nl++;}
 if(nl){s.tone(Y,glow,.3);s.knockout(lamp);s.fill(Y,lamp,.95);}
 if(flash>0){const fp=new Path2D(),r=rng(900+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(20*flash);i++){const q=BOWL.seats[Math.floor(r()*BOWL.seats.length)];const d=depthOf(c,q.P);if(d<16)continue;const[x,y]=P(c,q.P),sz=clamp(c.F*1/d,8,22);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.knockout(fp);}
}
// ---- advertising boards (plain blocks, no brands) ----
const BH=.9;
type Panel={q:V3[];kind:number;out:V3};
function panels(n:number,at:(i:number)=>V3,len:number,along:V3,out:V3,seed:number):Panel[]{
 const o:Panel[]=[];for(let i=0;i<n;i++){const a=at(i),b=add(a,[along[0]*len,0,along[2]*len]),up=(p:V3,h:number):V3=>[p[0],h,p[2]];
  o.push({q:[a,b,up(b,BH),up(a,BH)],kind:hash(i*13+seed,5)<.45?0:hash(i*13+seed,5)<.8?1:2,out});}
 return o;}
const BOARDS:Panel[]=[...panels(14,i=>[5,0,-35+5*i],4.9,[0,0,1],[1,0,0],3),...panels(18,i=>[-108+6*i,0,-38],5.9,[1,0,0],[0,0,-1],11),...panels(18,i=>[-108+6*i,0,38],5.9,[1,0,0],[0,0,1],29)];
function boards(s:Sheet,c:Camera){
 const face=new Path2D(),dark=new Path2D(),red=new Path2D(),backs=new Path2D(),edge=new Path2D();let n=0;
 for(const p of BOARDS){const q=quadP(c,p.q,1.2);if(!q)continue;const xs=q.map(v=>v[0]),ys=q.map(v=>v[1]);if(Math.max(...xs)<-s.W*.8||Math.min(...xs)>s.W*.8||Math.max(...ys)<-s.H*.8||Math.min(...ys)>s.H*.8)continue;
  const path=polyPath(q,true),behind=dot(sub(c.eye,p.q[0]),p.out)>0;n++;
  if(behind){backs.addPath(path);continue;}
  face.addPath(path);edge.addPath(path);if(p.kind===1)dark.addPath(path);else if(p.kind===2)red.addPath(path);}
 if(!n)return;
 s.knockout(face);s.tone(Y,face,.3);s.fill(K,dark,.9);s.fill(R,red,.9);s.knockout(backs);s.fill(K,backs,.75);s.stroke(K,edge,3,.7);
}
/** the pitch: floodlit grass (green × yellow), mowing stripes, paper lines, the goals */
function ground(s:Sheet,c:Camera,o:{net?:(p:V3)=>V3}={}){
 const apron=new Path2D();addPoly(apron,clipPoly(c,Array.from({length:NS},(_,i)=>rim(i/NS*TAU,-.6,0))));s.knockout(apron);s.fill(G,apron,.7);s.tone(K,apron,.3);
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-110,0,-38],[5,0,-38],[5,0,38],[-110,0,38]]));s.knockout(gp);s.fill(G,gp,.8);s.tone(Y,gp,.5);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5,0,-34],[x+5,0,34],[x,0,34]]));s.tone(K,stripes,.15);
 const lines=new Path2D(),Ln=(a:[number,number],b:[number,number])=>groundLine(lines,c,a,b,.14);
 Ln([-105,-34],[0,-34]);Ln([-105,34],[0,34]);Ln([0,-34],[0,34]);Ln([-105,-34],[-105,34]);Ln([-52.5,-34],[-52.5,34]);
 const arc=(cx:number,cz:number,r:number,a0:number,a1:number,n:number)=>{let prev:[number,number]|null=null;for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n,p:[number,number]=[cx+Math.cos(a)*r,cz+Math.sin(a)*r];if(prev)Ln(prev,p);prev=p;}};
 arc(-52.5,0,9.15,0,TAU,24);
 for(const[gx,d] of[[0,-1],[-105,1]] as[number,number][]){const bx=gx+d*16.5,sx=gx+d*5.5;Ln([gx,-20.16],[bx,-20.16]);Ln([bx,-20.16],[bx,20.16]);Ln([bx,20.16],[gx,20.16]);Ln([gx,-9.16],[sx,-9.16]);Ln([sx,-9.16],[sx,9.16]);Ln([sx,9.16],[gx,9.16]);
  const a=Math.acos(5.5/9.15);if(d<0)arc(gx-11,0,9.15,Math.PI-a,Math.PI+a,8);else arc(gx+11,0,9.15,-a,a,8);
  addPoly(lines,clipPoly(c,[[gx+d*11-.15,.02,-.15],[gx+d*11+.15,.02,-.15],[gx+d*11+.15,.02,.15],[gx+d*11-.15,.02,.15]]));}
 s.knockout(lines,.95);
 boards(s,c);
 goal(s,c,-105,-1);
 goal(s,c,0,1,o.net);
}
/** a modern goal on the line x = X, net 2 m deep toward dir: posts and bar, a box net; `net` displaces the mesh (ripple) */
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

// ================= the white ball (paper, green shade, navy panels) =================
const BALL_R=.11;
function ball(s:Sheet,x:number,y:number,r:number,spin:number,o:{sq?:number;dir?:number}={}){
 const{sq=0,dir=0}=o;s.save();s.translate(x,y);s.rotate(dir);s.scale(1+sq,1/(1+sq));s.rotate(-dir);
 const disc=polyPath(Array.from({length:28},(_,i)=>{const a=i/28*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),true);
 s.knockout(disc);
 s.save();s.clip(disc);
 s.tone(G,crescent(0,0,r*1.02,[-.4,-.45]),.5);
 const seams=new Path2D();for(let k=0;k<3;k++){const a=spin+k*TAU/3,ca=Math.cos(a),sa=Math.sin(a);for(const off of[-.32,.32]){const pts:Pt[]=[];for(let i=0;i<=8;i++){const u=i/8*2-1,px=u*r*1.1,py=off*r+Math.sin(u*1.5+a)*r*.12;pts.push([px*ca-py*sa,px*sa+py*ca]);}seams.addPath(polyPath(pts,false));}}
 s.stroke(K,seams,Math.max(1.4,r*.05),.8);
 s.restore();
 s.fill(K,ribbon(Array.from({length:40},(_,i)=>{const a=i/40*TAU;return[Math.cos(a)*r*(1+.02*Math.sin(a*3)),Math.sin(a)*r] as Pt;}),Math.max(3,r*.08),{close:true,pressure:.5,wobble:r*.02}));
 s.restore();
}
function ballShadow(s:Sheet,c:Camera,b:V3){const pts:Pt[]=[],rad=.2+b[1]*.03;for(let i=0;i<12;i++){const a=i/12*TAU,p:V3=[b[0]+Math.cos(a)*rad,.02,b[2]+Math.sin(a)*rad];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}s.tone(K,polyPath(pts,true),clamp(.55-b[1]*.05,.2,.55));}

// ================= kits (25 June 2018) and the figure adapter =================
const SKIN:AthleteStyle['skin']=[[R,.2],[Y,.45]];
/** Portugal: red shirts, red shorts, GREEN socks (confirmed); paper numbers and trim (inferred) */
const POR=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:R,socks:G,trim:'paper',boots:K,skin:SKIN,hair:K,hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',numberInk:'paper',...o});
/** Iran: all white (confirmed); navy numbers and trim (inferred) */
const IRN=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',trim:R,boots:K,skin:SKIN,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:[K,.9],...o});
const QUARESMA:AthleteStyle=POR({number:20,build:{height:1.75,bulk:.94},seed:20});
const RONALDO:AthleteStyle=POR({number:7,build:{height:1.87,bulk:1.02,thighs:1.1},seed:7});
const BEIRANVAND:AthleteStyle={shirt:[K,.85],shorts:[K,.92],socks:[K,.85],trim:'paper',boots:K,skin:SKIN,hair:K,hairStyle:'short',line:K,sleeves:'long',shade:[K,.26],number:1,numberInk:'paper',gloves:Y,build:{height:1.94},seed:1};
const REF:AthleteStyle={shirt:[Y,.9],shorts:[K,.92],socks:[K,.92],trim:K,boots:K,skin:SKIN,hair:[K,.6],hairStyle:'short',line:K,sleeves:'short',seed:33};
/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, continuous-silhouette body). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:AthleteStyle,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean}={}):DrawResult{
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,style,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,style,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 the shot) =================
type TK=[number,number,number];
type Role='hero'|'por'|'irn'|'gk'|'ref';
type Actor={name:string;role:Role;style:AthleteStyle;keys:TK[];key?:boolean};
const GRAV=9.81,PASS=-2.2,RET=-1.55,RCV=-.95,SHOT=0,FLIGHT=1.1,IN_NET=SHOT+FLIGHT;
const QP:V3=[-21.2,.11,17.4],TP:V3=[-16.2,.11,9.4],RC:V3=[-18.5,.11,13.9],SH:V3=[-17.3,.11,13.1],LINE:V3=[0,2.2,-3.05];
/** the swerve: struck out left of the chord (wide of the far post), bending right (clockwise spin, outside of the right boot) */
const CHORD:[number,number]=[LINE[0]-SH[0],LINE[2]-SH[2]],CL=Math.hypot(CHORD[0],CHORD[1]),RIGHT:[number,number]=[-CHORD[1]/CL,CHORD[0]/CL],BEND=2.4;
/** where a player stands so his right boot meets a ball at b while facing f */
function standAt(b:V3,f:[number,number],ahead=.44):[number,number]{const l=Math.hypot(f[0],f[1]),fx=f[0]/l,fz=f[1]/l,rx=-fz,rz=fx;return[b[0]-fx*ahead-rx*.1,b[2]-fz*ahead-rz*.1];}
/** he opens his body toward the far post, out wide of it (the start line of the curl) */
const AIM:[number,number]=[CHORD[0]-RIGHT[0]*BEND*1.7,CHORD[1]-RIGHT[1]*BEND*1.7];
const Q_PS=standAt(QP,[TP[0]-QP[0],TP[2]-QP[2]]),Q_RC=standAt(RC,[SH[0]-RC[0],SH[2]-RC[2]],.5),Q_SH=standAt(SH,AIM,.42),A_TP=standAt(TP,[RC[0]-TP[0],RC[2]-TP[2]]);
const ACTORS:Actor[]=[
 {name:'Quaresma',role:'hero',style:QUARESMA,key:true,keys:[[-6,-30,27],[-4.5,-27.2,24.2],[-3.3,-24.4,21],[PASS,Q_PS[0],Q_PS[1]],[-1.6,-20.3,16],[RCV,Q_RC[0],Q_RC[1]],[-.4,-18.1,13.35],[SHOT,Q_SH[0],Q_SH[1]],[.7,-17.2,12.9],[1.6,-15.2,14.6],[2.8,-12,19.5],[4,-9.2,24.5],[5.2,-7.4,27.8],[6.4,-6.6,29.2],[10,-6.4,29.6]]},
 {name:'Beiranvand',role:'gk',style:BEIRANVAND,key:true,keys:[[-6,-2.2,2],[-2,-1.8,2.3],[-.5,-2.4,1.3],[0,-2.6,1],[10,-2.6,1]]},
 {name:'Adrien',role:'por',style:POR({number:23,seed:23,hair:[K,.8]}),key:true,keys:[[-6,-20,6],[-3,-17.6,8.2],[RET,A_TP[0],A_TP[1]],[-.5,-15.8,8.2],[2,-13,8],[4.5,-9.5,20],[10,-8,24]]},
 {name:'Ronaldo',role:'por',style:RONALDO,key:true,keys:[[-6,-14,-2],[-2,-12.5,-4],[0,-10.6,-5.2],[1.5,-10,-2],[3,-9.5,8],[4.6,-8.2,21],[5.8,-7.2,27.6],[6.5,-6.9,28.4],[10,-6.8,28.6]]},
 {name:'André Silva',role:'por',style:POR({number:9,seed:9}),keys:[[-6,-12,4],[0,-8.5,1.5],[3,-7,6],[10,-6,14]]},
 {name:'João Mário',role:'por',style:POR({number:10,seed:10,hair:[K,.8]}),keys:[[-6,-20,-15],[0,-17,-10],[10,-12,-2]]},
 {name:'Hajsafi',role:'irn',style:IRN({number:3,seed:43}),key:true,keys:[[-6,-23,20],[-3.3,-21,17.5],[PASS,-19.4,15.2],[-1,-18.4,14.6],[0,-16.2,12.8],[1,-15.4,12.2],[10,-15,12]]},
 {name:'Pouraliganji',role:'irn',style:IRN({number:8,seed:48}),keys:[[-6,-10,4],[-2,-11.5,6],[0,-12.2,7.6],[1,-11.8,6.8],[10,-11,6]]},
 {name:'Hosseini',role:'irn',style:IRN({number:19,seed:49}),keys:[[-6,-9,-3],[0,-9.6,-3.6],[10,-9,-3]]},
 {name:'Ezatolahi',role:'irn',style:IRN({number:6,seed:46}),key:true,keys:[[-6,-19,4],[-2,-17.4,6.6],[RET,-16.4,7.4],[0,-15.4,9.6],[10,-14.4,10]]},
 {name:'Rezaeian',role:'irn',style:IRN({number:23,seed:53}),keys:[[-6,-10,-12],[0,-9,-9.5],[10,-8,-8]]},
 {name:'Ebrahimi',role:'irn',style:IRN({number:9,seed:59}),keys:[[-6,-24,9],[0,-21,11],[10,-18,12]]},
 {name:'Jahanbakhsh',role:'irn',style:IRN({number:18,seed:58}),keys:[[-6,-26,-2],[0,-22,0],[10,-19,2]]},
 {name:'Referee',role:'ref',style:REF,keys:[[-6,-32,6],[0,-28,4],[10,-22,8]]},
];
const HERO=0,GKI=1,ADI=2,CRI=3,HAJ=6;
function herm(keys:TK[],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:1|2)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
const TA=-6,TB=10,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(TB-TA)/DT;i++){const[x,z]=herm(a.keys,TA+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-TA)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.1),b=posOf(k,tau+.1);return[(b[0]-a[0])/.2,(b[1]-a[1])/.2];};
// ---- the director (lib/plays/riso/director.ts): camera math only, the authored eye/aim/focal reframed about Quaresma ----
const g3=(k:number,tau:number):V3=>{const[x,z]=posOf(k,tau);return[x,0,z];};
/** a soft keep: the feet and head of a player at weight w (0 = free, 1 = hard) */
const soft=(P:V3,w:number,h=1.9):Keep[]=>w>.01?[{P,w},{P:[P[0],h,P[2]],w}]:[];
/** the Iran players and the keeper near Quaresma stay in frame (the men he beats) */
const foes=(tau:number):V3[]=>ACTORS.flatMap((a,k)=>a.role==='irn'||a.role==='gk'?[g3(k,tau)]:[]);
function directed(t:number,B:Beats,pos:V3,look:V3,F:number,hero:V3,ball:V3|null,keep:Keep[]):Camera{
 const r=reframe({eye:pos,target:look,F},{hero,ball,keep,height:1.75},shotOf(t,B),DV);return cam(r.eye,r.target,r.F);}

// ---- the ball ----
function arc(a:V3,b:V3,D:number,s:number):V3{const u=s/D,vy=(b[1]-a[1]+.5*GRAV*D*D)/D;return[lerp(a[0],b[0],u),a[1]+vy*s-.5*GRAV*s*s,lerp(a[2],b[2],u)];}
/** the curling shot: the gravity arc along the chord, plus a sideways offset that bows LEFT of the chord and swerves back (constant side force) */
function shotAt(s:number):V3{const p=arc(SH,LINE,FLIGHT,s),u=s/FLIGHT,off=-BEND*4*u*(1-u);return[p[0]+RIGHT[0]*off,p[1],p[2]+RIGHT[1]*off];}
const V_END:V3=(()=>{const a=shotAt(FLIGHT-.02),b=shotAt(FLIGHT);return[(b[0]-a[0])/.02,(b[1]-a[1])/.02,(b[2]-a[2])/.02];})();
const REST:V3=[1.5,.11,-2.3],NET_HIT:V3=[2,1.7,-2.7];
function ballAt(tau:number):V3{
 if(tau<PASS-.25){const[x,z]=posOf(HERO,tau),v=velOf(HERO,tau),l=Math.hypot(v[0],v[1])||1,ph=distOf(HERO,tau)/1.9,push=.45+.35*Math.abs(Math.sin(ph*Math.PI));return[x+v[0]/l*push-v[1]/l*.1,.11,z+v[1]/l*push+v[0]/l*.1];}
 if(tau<PASS){const[x,z]=posOf(HERO,PASS-.25),v=velOf(HERO,PASS-.25),l=Math.hypot(v[0],v[1])||1,a:V3=[x+v[0]/l*.6,.11,z+v[1]/l*.6];return mix3(a,QP,sm(PASS-.25,PASS,tau));}
 if(tau<RET){const u=(tau-PASS)/(RET-PASS);return mix3(QP,TP,u*(1.25-.25*u));}
 if(tau<RCV){const u=(tau-RET)/(RCV-RET);return mix3(TP,RC,u*(1.2-.2*u));}
 if(tau<SHOT){const u=(tau-RCV)/(SHOT-RCV);return mix3(RC,SH,1-(1-u)*(1-u));}
 if(tau<IN_NET)return shotAt(tau-SHOT);
 const s=tau-IN_NET;if(s<.1)return[LINE[0]+V_END[0]*s,LINE[1]+V_END[1]*s-.5*GRAV*s*s,LINE[2]+V_END[2]*s];
 const a:V3=[LINE[0]+V_END[0]*.1,LINE[1]+V_END[1]*.1-.05,LINE[2]+V_END[2]*.1];
 if(s<.55){const u=(s-.1)/.45;return[lerp(a[0],REST[0],u),lerp(a[1],.11,u*u),lerp(a[2],REST[2],u)];}
 const u=clamp((s-.55)/.5);return[REST[0],.11+.18*Math.sin(u*Math.PI)*(1-u),REST[2]];
}

// ---- poses ----
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
const LIN=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as(keyof Pose)[]){const v=LIN.has(k)?d[k]!:d[k]!*D2R;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
/** the trivela: the right foot turned IN (toes in, ankle locked and pointed), so the OUTSIDE of the boot strikes across the ball */
const TRIVELA:Partial<Pose>={rHipR:-34,rAnk:62,rHipA:-6,twist:-6,lShA:88};
function strikeOver(p:Pose,tau:number,contact:number,D:number,power:number,extra?:Partial<Pose>){const u=(tau-(contact-STRIKE_CONTACT*D))/D;
 if(u>-.1&&u<1.5){p=blendPose(p,strike(clamp(u),{foot:'r',power}),Math.min(sm(-.1,.12,u),1-sm(1.05,1.5,u)));if(extra)p=over(p,extra,bump(.3,.85,u));}return p;}
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.45?YAW(v[0],v[1]):YAW(b[0]-x,b[2]-z);
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='irn'?READY:stand();
 let p:Pose;
 if(k===HERO){
  if(tau>-.6&&tau<.8)yaw=lerpAng(yaw,YAW(AIM[0],AIM[1]),Math.min(sm(-.6,-.25,tau),1-sm(.5,.8,tau)));
  if(tau<PASS||(tau>RCV-.2&&tau<SHOT)){const s=clamp((sp-1.5)/4);p=blendPose(READY,dribble(distOf(k,tau)/1.9,{foot:'r',speed:.4+.4*s}),clamp((sp-.6)/1.4));}
  else{const s=clamp((sp-2)/5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.3+2*s),{speed:s}),clamp((sp-.4)/.8));}
  p=strikeOver(p,tau,PASS,.7,.25);
  p=strikeOver(p,tau,SHOT,.9,.85,TRIVELA);
  if(tau>1.4){const c=celebrate((tau-1.4)*.8,{kind:'run'});p=blendPose(p,c,sm(1.4,1.9,tau)*(1-sm(5.6,6.1,tau)));}
  if(tau>5.8){p=blendPose(p,celebrate((tau-5.8)*.9,{kind:'arms'}),sm(5.8,6.2,tau));}
  return{p,yaw};}
 if(a.role==='gk'){yaw=YAW(b[0]-x,b[2]-z);if(tau>SHOT)yaw=YAW(-1,0);p=idle;
  // late and beaten: a leap to his right (−z) as the ball swerves back over him
  const DV=.52;if(tau>DV){p=keeperDive(clamp((tau-DV)/1.0),{side:'r',height:.9});}
  return{p,yaw};}
 const along=v[0]*Math.cos(yaw)-v[1]*Math.sin(yaw);
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.4+2.2*s),{speed:s}),clamp((sp-.5)/.9));}
 if(k===ADI){if(tau>PASS&&tau<RET+.3)yaw=lerpAng(yaw,YAW(RC[0]-x,RC[2]-z),sm(PASS,RET-.3,tau));p=strikeOver(p,tau,RET,.6,.2);}
 if(k===CRI&&tau>5.9)p=blendPose(p,celebrate((tau-5.9)*.9,{kind:'arms'}),sm(5.9,6.3,tau));
 if(k===HAJ&&tau>-.3&&tau<.3)p=over(p,{rHipF:50,rKnee:20,rHipA:20,lean:24},bump(-.3,.3,tau));
 return{p,yaw};
}

type Item={depth:number;draw:()=>void};
type World={ball:V3;res:Map<number,DrawResult>};
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;glow?:number;lowKeys?:boolean}):World{
 const b=ballAt(tau),items:Item[]=[],res=new Map<number,DrawResult>();
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!(s as unknown as {_passage?:{pending?:unknown}})._passage?.pending;
 ACTORS.forEach((a,k)=>{const[x,z]=posOf(k,tau),g:V3=[x,0,z],d=depthOf(c,g);if(d<1)return;const[gx,gy]=P(c,g),kk=kAt(c,g);if(Math.abs(gx)>s.W*.62+kk*2||gy<-s.H*.6||gy>s.H*.6+2.4*kk)return;
  items.push({depth:d,draw:()=>{const{p,yaw}=poseOf(k,tp),px=kk*1.8*ppu,place:Place={x,z,yaw};
   const detail=passing?(k===HERO?'mid':'low'):px<50||((!a.key||(o.lowKeys&&k!==HERO))&&px<110)?'low':'auto';
   const big=px>=90&&!passing&&(k===HERO||a.key);
   const prev=big?{pose:poseOf(k,tp-1/12).p,place:{x:posOf(k,tau-1/12)[0],z:posOf(k,tau-1/12)[1],yaw:poseOf(k,tp-1/12).yaw}}:undefined;
   res.set(k,drawPlayer(s,p,c,{...a.style,detail},place,{prev,smear:!!o.hero&&k===HERO}));}});});
 items.push({depth:depthOf(c,b),draw:()=>{if(depthOf(c,b)<NEAR)return;const a=P(c,ballAt(tau-.03)),q=P(c,b),dx=q[0]-a[0],dy=q[1]-a[1],sp=Math.hypot(dx,dy),r=Math.max(o.ballMin,BALL_R*kAt(c,b));ballShadow(s,c,b);
  if(o.glow&&o.glow>.02)s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>[q[0]+Math.cos(i/20*TAU)*r*1.6,q[1]+Math.sin(i/20*TAU)*r*1.6] as Pt),true),r*.25*o.glow,.95);
  ball(s,q[0],q[1],r,tau*9,{sq:clamp(sp/(r*3),0,.7),dir:Math.atan2(dy,dx)});}});
 items.sort((a,b2)=>b2.depth-a.depth).forEach(i=>i.draw());
 return{ball:b,res};}

// ================= teaching marks =================
function trail3(s:Sheet,c:Camera,pts:V3[],wm:number,ink:string,o:{progress?:number;cov?:number;head?:boolean;dashed?:boolean;seed?:number}={}){
 const{progress=1,cov=.95,head=true,dashed=false,seed=5}=o;if(progress<=.01||cov<=.02)return;
 const n=Math.max(2,Math.round(pts.length*clamp(progress))),q:Pt[]=[];let d=1;for(const g of pts.slice(0,n)){const dd=depthOf(c,g);if(dd<NEAR+.2)continue;q.push(P(c,g));d=dd;}
 if(q.length<2)return;const w=Math.max(5,c.F*wm/d),gaps:[number,number][]=[];if(dashed)for(let x=.08;x<.95;x+=.14)gaps.push([x,x+.07]);
 s.knockout(ribbon(q,w*1.6,{seed,taper:.1,wobble:.8,gaps}),.8*cov);s.fill(ink,ribbon(q,w,{seed,taper:.1,wobble:.8,gaps}),cov);
 if(head&&q.length>2){const a=q[q.length-2],b=q[q.length-1];laneArrow(s,ink,a,[b[0]+(b[0]-a[0])*.02,b[1]+(b[1]-a[1])*.02],w,{seed:seed+1,head:w*3,cov});}}
const onGround=(p:[number,number][]):V3[]=>p.map(q=>[q[0],.03,q[1]]);
const pathOf=(k:number,t0:number,t1:number,n=16):[number,number][]=>Array.from({length:n+1},(_,i)=>posOf(k,t0+(t1-t0)*i/n));
const curlArc=(n=22):V3[]=>Array.from({length:n+1},(_,i)=>shotAt(FLIGHT*i/n));
/** the straight line the shot would take without the swerve: struck out wide of the far post */
const startLine=():V3[]=>{const e:V3=[SH[0]+AIM[0]*.95,1.9,SH[2]+AIM[1]*.95];return Array.from({length:9},(_,i)=>mix3([SH[0],.3,SH[2]],e,i/8));};
/** the top far corner, lit */
function cornerTarget(s:Sheet,c:Camera,w:number,t:number){if(w<=.02)return;const cz=-3.05,cy=2.05,r=.55+.08*Math.sin(t*6),pts:Pt[]=[];for(let i=0;i<20;i++){const a=i/20*TAU,p:V3=[0,cy+Math.sin(a)*r,cz+Math.cos(a)*r];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}
 const path=polyPath(pts,true);s.tone(Y,path,.3*w);s.stroke(Y,path,Math.max(5,.08*kAt(c,[0,cy,cz])),.95*w);}
/** a spin arrow round the ball (clockwise seen from above) */
function spinRing(s:Sheet,c:Camera,b:V3,w:number,t:number,seed:number){if(w<=.02)return;const pts:V3[]=[];for(let i=0;i<=16;i++){const a=-t*5-i/16*TAU*.78;pts.push([b[0]+Math.cos(a)*.42,b[1]+.02,b[2]+Math.sin(a)*.42]);}
 trail3(s,c,pts,.05,Y,{cov:.95*w,head:true,seed});}

// ================= chapter 1 (live): the high main-stand camera; the cut inside, the one-two, the trivela, the net =================
const tau1=(t:number)=>{const E=SEC(0),pg=T(0,'Portugal'),rq=T(0,'Ricardo Quaresma'),ci=T(0,'cuts in from the right'),ot=T(0,'plays a quick one-two'),bi=T(0,'bends it'),of=T(0,'the outside of his right foot'),g=T(0,'Goal');
 return key(t,mono([[0,-6],[pg,-5.6],[rq,-4.6],[ci+.5,-3.2],[ot+.2,PASS+.1],[ot+1,RCV],[bi,-.3],[bi+.4,SHOT+.1],[of+.4,.6],[g,IN_NET+.05],[E+1,IN_NET+(E+1-g)]]),linear);};
const CAM1:V3=[-28,21,-58];
function look1(tau:number):V3{const b=ballAt(tau);
 if(tau<SHOT)return[b[0]+3,1,b[2]-3];
 if(tau<IN_NET)return mix3([b[0]+3,1,b[2]-3],[lerp(b[0],-3,.5),1.4,lerp(b[2],0,.5)],sm(SHOT,IN_NET,tau));
 const[x,z]=posOf(HERO,tau);return mix3([-3,1.4,0],[x,1,z],sm(IN_NET+.3,IN_NET+2,tau));}
/** Director beats, chapter 1: a short establishing wide of the bowl, then follow Quaresma down the right with the defenders round him;
 * pull out for the one-two so both he and Adrien (the wall pass) are in frame; push in low for the trivela itself (the touch being
 * taught: the outside of the right boot across the ball); then ride with the ball as it curls in, widening so Beiranvand and the goal come
 * into frame before it arrives; hold on the beaten keeper with the ball in the net at "Goal". */
const B1=beats([[0,'wide'],[1.1,'follow'],[T(0,'plays a quick one-two')-.3,{from:'space',size:.24}],[T(0,'bends it')-.45,'tight'],
 [T(0,'bends it')+.33,{from:'space',size:.3,ball:.9}],[T(0,'Goal')+.3,{from:'reaction',size:.32}]]);
function cam1(t:number){const tau=tau1(t),a=look1(tau),b=look1(tau-.3),c=look1(tau-.6),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const F=key(tau,[[-6,3000],[-3,3400],[PASS,3700],[RCV,4000],[SHOT,4000],[IN_NET,3300],[IN_NET+2.5,4400]]);
 const ot=T(0,'plays a quick one-two'),bi=T(0,'bends it'),g=T(0,'Goal'),q=g3(HERO,tau);
 // from the strike (τ 0 at bends it + .3 s) the subject glides onto the ball and rides with it to the goal, then settles on Beiranvand,
 // beaten, with the ball in the net beside him (chapter 3 picks Quaresma up as he races away)
 const ct=bi+.3,ball=ballAt(tau),wK=sm(ct-.05,ct+.45,t),hero=mix3(mix3(q,[ball[0],0,ball[2]],wK),g3(GKI,tau),sm(g-.4,g+.4,t));
 const wA=sm(ot-.7,ot-.2,t)*(1-sm(ot+1,ot+1.5,t)),wT=sm(bi-.6,bi-.2,t);
 // the men he beats stay in frame; at the strike only the block-tackler right on him (the tight shot cannot hold the whole box)
 const keep:Keep[]=[...near(q,foes(tau),lerp(3.5,1.6,wT),lerp(7,3.2,wT)).map(k=>Array.isArray(k)?k:{P:k.P,w:k.w*(1-wK)}),
  ...soft(g3(ADI,tau),wA),...near(hero,[g3(GKI,tau)],4,9,2)];
 return directed(t,B1,CAM1,look,F,hero,ball,keep);}
const ch1:Scene={
 draw(s,t){frame(s);const tt=twos(t),c=cam1(t),tau=tau1(t),tp=tau1(tt),goalIn=tau-IN_NET;
  stadium(s,c,{t,cheer:.12+.9*sm(0,.5,goalIn),flash:.15+1.2*sm(0,.4,goalIn)});
  ground(s,c,{net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  drawWorld(s,c,tau,tp,{ballMin:9,lowKeys:true});},
 aperture(t){const c=cam1(t),p=ballAt(tau1(t)),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(9,BALL_R*kAt(c,p))*1.1,12);},
 still:12,
};

// ================= chapter 2 (TV replay, slow motion, low behind the shooter): it starts out wide, swerves back, over the keeper, far top corner =================
const tau2=(t:number)=>{const E=SEC(1),tt=T(1,'This is the trivela'),sw=T(1,'The ball starts out wide'),sb=T(1,'then swerves back'),ok=T(1,'over keeper Beiranvand'),ft=T(1,'into the far top corner');
 return key(t,mono([[0,-1.4],[tt,-.55],[sw-.1,SHOT],[sb,.42],[ok,.72],[ft,.98],[ft+.8,IN_NET+.1],[E,IN_NET+.6]]),linear);};
/** Director beats, chapter 2 (the replay): the TV shot behind the shooter, then the technique close-up, low on his right boot, as he
 * strikes across the ball ("This is the trivela"); as it leaves the boot the camera eases back out to the authored distance and aims along
 * the flight (start line out wide, the swerve, the keeper), then settles on the authored replay framing for the far top corner. */
const B2=beats([[0,'follow'],[T(1,'This is the trivela')-.4,'detail'],[T(1,'The ball starts out wide')-.25,{from:'space',size:.12,lens:0,low:0,ball:1}],[T(1,'over keeper Beiranvand')+.4,'wide']]);
function cam2(t:number){const c=cam2Authored(t),tau=tau2(t),q=g3(HERO,tau),ball=ballAt(tau),sw=T(1,'The ball starts out wide'),
 // once the ball is struck the subject rides with it (Quaresma is left behind, the keeper and the far corner ahead)
 wB=sm(sw-.1,sw+.6,t),hero=mix3(q,[ball[0],0,ball[2]],wB),wD=sm(T(1,'This is the trivela')-.6,T(1,'This is the trivela'),t);
 return directed(t,B2,c.pos,c.look,c.F,hero,ball,near(q,foes(tau),lerp(2.5,1.2,wD),lerp(5,2.4,wD)).map(k=>Array.isArray(k)?k:{P:k.P,w:k.w*(1-wB)}));}
function cam2Authored(t:number){const E=SEC(1),follow=sm(T(1,'The ball starts out wide')-.2,T(1,'into the far top corner')+.4,t,easeInOutSine),push=sm(0,E,t,easeInOutSine);
 // high behind the shooter and a touch inside him, so the whole curl (boot → far top corner) and the keeper sit in one frame
 const dx=CHORD[0]/CL,dz=CHORD[1]/CL,back:V3=[SH[0]-dx*11-RIGHT[0]*2.2,4.6,SH[2]-dz*11-RIGHT[1]*2.2];
 const look=mix3([SH[0]+CHORD[0]*.3,1.1,SH[2]+CHORD[1]*.3],[SH[0]+CHORD[0]*.75,1.5,SH[2]+CHORD[1]*.75-.8],follow);
 return{pos:[back[0]+dx*2.5*push,back[1]-.6*push,back[2]+dz*2.5*push] as V3,look,F:lerp(1350,1750,follow)};}
const ch2:Scene={
 draw(s,t){frame(s);const tt=twos(t),c=cam2(t),tau=tau2(t),tp=tau2(tt),E=SEC(1),tr=T(1,'This is the trivela'),sw=T(1,'The ball starts out wide'),sb=T(1,'then swerves back'),ok=T(1,'over keeper Beiranvand'),ft=T(1,'into the far top corner'),goalIn=tau-IN_NET;
  stadium(s,c,{t,cheer:.1+.8*sm(0,.4,goalIn)});
  ground(s,c,{net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  // "starts out wide": the straight start line, out past the far post (dashed, red)
  trail3(s,c,startLine(),.06,R,{progress:sm(sw-.2,sw+.5,t,easeOut),cov:.9*(1-sm(sb+.5,sb+1,t)),dashed:true,seed:21});
  // "swerves back": the real curl drawn along the ball's path (yellow)
  trail3(s,c,curlArc(),.07,Y,{progress:clamp((tau-SHOT)/FLIGHT)*sm(sw-.1,sw+.1,t),cov:.95*(1-sm(E-.6,E-.2,t)),seed:23});
  cornerTarget(s,c,sm(ft-.3,ft+.2,t)*(1-sm(E-.5,E-.1,t)),t);
  const w=drawWorld(s,c,tau,tp,{ballMin:8,hero:true,glow:sm(tr-.1,tr+.3,t)*(1-sm(ok,ok+.4,t))});
  // "the trivela": spin ring round the ball at the strike
  spinRing(s,c,ballAt(tau),bump(tr-.1,sb+.6,t),t,25);
  // "over keeper Beiranvand": a spark over his gloves
  const gk=w.res.get(GKI),age=t-ok;if(gk&&age>-.1&&age<.7){const h=gk.joints.rHa;sparkBurst(s,Y,h[0],h[1],kAt(c,[-2.6,2,0])*.5,{n:8,seed:29,g:easeOutBack(clamp((age+.1)/.2))*(1-clamp((age-.45)/.25)),width:9});}
  if(t<.5)speedLines(s,K,0,0,0,{n:12,seed:33,len:900,spread:520,width:22,cov:.5*(1-t/.5)});
 },
 aperture(t){const c=cam2(t),p=ballAt(tau2(t)),[x,y]=P(c,p),r=Math.max(9,BALL_R*kAt(c,p));return apertureDisc(x,y,r*1.1,12);},
 still:6,
};

// ================= chapter 3 (low track-side camera by the right corner): he races away, Ronaldo joins =================
const tau3=(t:number)=>{const E=SEC(2),hf=T(2,'half-time'),ra=T(2,'Quaresma races away'),cr=T(2,'Cristiano Ronaldo'),jc=T(2,'joins the celebration');
 return key(t,mono([[0,IN_NET-.2],[hf+.2,IN_NET+.4],[ra,1.8],[cr,4.2],[jc+.2,5.9],[E,7.4]]),linear);};
const CAM3:V3=[-3,1.6,36.5];
/** Director beats, chapter 3: it opens where chapter 1 left off, on the beaten keeper and the ball in the net ("Just before half-time"),
 * widens as the camera swings across to Quaresma, follows him as he races away, and closes in on the celebration with Ronaldo held in
 * frame as he joins him. */
const B3=beats([[0,{from:'reaction',size:.3}],[T(2,'half-time')-.1,{from:'space',size:.2}],[T(2,'Quaresma races away')-.3,'follow'],[T(2,'joins the celebration')-.3,'reaction']]);
function cam3(t:number){const c=cam3Authored(t),tau=tau3(t),q=g3(HERO,tau),cr=T(2,'Cristiano Ronaldo'),wQ=sm(T(2,'half-time')-.2,T(2,'Quaresma races away'),t);
 const hero=mix3(g3(GKI,tau),q,wQ),b=ballAt(tau);
 return directed(t,B3,c.pos,c.look,c.F,hero,null,[...soft(b,1-wQ,b[1]),...soft(g3(CRI,tau),sm(cr-.9,cr-.2,t)),...near(q,foes(tau),3,6).map(k=>Array.isArray(k)?k:{P:k.P,w:k.w*wQ})]);}
function cam3Authored(t:number){const tau=tau3(t),E=SEC(2),[x,z]=posOf(HERO,tau),b=ballAt(tau),fol=sm(T(2,'Just before'),T(2,'Quaresma races away')+.6,t,easeInOutSine);
 const look=mix3([lerp(b[0],-3,.4),1.3,lerp(b[2],0,.4)],[x,1.2,z],fol);
 return{pos:[CAM3[0]-3*sm(0,E,t),CAM3[1],CAM3[2]] as V3,look,F:key(t,mono([[0,1500],[T(2,'Quaresma races away'),1550],[T(2,'Cristiano Ronaldo'),2000],[E,2400]]))};}
const ch3:Scene={
 draw(s,t){frame(s);const tt=twos(t),c=cam3(t),tau=tau3(t),tp=tau3(tt),ra=T(2,'Quaresma races away'),cr=T(2,'Cristiano Ronaldo'),jc=T(2,'joins the celebration'),E=SEC(2),goalIn=tau-IN_NET;
  stadium(s,c,{t,cheer:.3+.8*sm(0,.5,goalIn),flash:.4+1.2*sm(0,.4,goalIn)});
  ground(s,c,{net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  trail3(s,c,onGround(pathOf(HERO,1,5.8)),.16,R,{progress:sm(ra-.1,ra+1,t,easeOut),cov:.9*(1-sm(E-.9,E-.4,t)),seed:41});
  trail3(s,c,onGround(pathOf(CRI,1.5,6.3)),.14,Y,{progress:sm(cr-.1,cr+.9,t,easeOut),cov:.9*(1-sm(E-.9,E-.4,t)),dashed:true,seed:43});
  const w=drawWorld(s,c,tau,tp,{ballMin:8,hero:true,lowKeys:true});
  const q=w.res.get(HERO),age=t-jc;if(q&&age>-.1&&age<.9){const h=q.joints.head;sparkBurst(s,Y,h[0],h[1]-40,kAt(c,[-7,1,28])*.9,{n:10,seed:45,g:easeOutBack(clamp((age+.1)/.25))*(1-clamp((age-.6)/.3)),width:10});}
  if(t<.45)speedLines(s,K,0,0,Math.PI,{n:12,seed:47,len:900,spread:520,width:22,cov:.5*(1-t/.45)});
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(HERO,tau3(t)),p:V3=[x,1.3,z],[px,py]=P(c,p);return apertureDisc(px,py,Math.max(12,.22*kAt(c,p)),12);},
 still:4.5,
};

// ================= chapter 4 (the lesson, a close low side camera): the outside of the foot, it curves away from the keeper =================
const tau4=(t:number)=>{const E=SEC(3),hb=T(3,'hit the ball'),of=T(3,'the outside of your foot'),cw=T(3,'it curves away'),fk=T(3,'from the keeper');
 return key(t,mono([[0,-.9],[hb,-.5],[of,-.12],[of+1,SHOT+.05],[cw,.35],[fk,.8],[E,IN_NET+.4]]),linear);};
function cam4(t:number){const E=SEC(3),follow=sm(T(3,'it curves away')-.3,E-.4,t,easeInOutSine),push=sm(0,T(3,'the outside of your foot')+.6,t,easeInOutSine);
 const foot:V3=[SH[0]-.2,.5,SH[2]+.2],look=mix3(foot,[-4,1.4,-1.5],follow);
 return cam([SH[0]+RIGHT[0]*4.2-CHORD[0]/CL*1.6,1.05+.6*follow,SH[2]+RIGHT[1]*4.2-CHORD[1]/CL*1.6],look,lerp(1500+400*push,1100,follow));}
const ch4:Scene={
 draw(s,t){const tt=twos(t),c=cam4(t),tau=tau4(t),tp=tau4(tt),E=SEC(3),hb=T(3,'hit the ball'),of=T(3,'the outside of your foot'),cw=T(3,'it curves away'),fk=T(3,'from the keeper');frame(s);
  stadium(s,c,{t,cheer:.08});
  ground(s,c);
  trail3(s,c,curlArc(),.1,Y,{progress:sm(cw-.2,cw+.9,t,easeOut),cov:.95*(1-sm(E-.5,E-.1,t)),seed:55});
  cornerTarget(s,c,sm(fk-.2,fk+.3,t)*(1-sm(E-.5,E-.1,t)),t);
  const w=drawWorld(s,c,tau,tp,{ballMin:10,hero:true,glow:sm(hb-.1,hb+.3,t)*(1-sm(of+1,of+1.4,t))});
  // "the outside of your foot": a yellow ring on the outside of his right boot
  const q=w.res.get(HERO),ow=sm(of-.1,of+.3,t)*(1-sm(cw,cw+.4,t));if(q&&ow>.02){const f=q.joints.rToe,a=q.joints.rAn,m:Pt=[(f[0]+a[0])/2,(f[1]+a[1])/2],r=Math.max(18,Math.hypot(f[0]-a[0],f[1]-a[1])*.9);
   const ring:Pt[]=Array.from({length:18},(_,i)=>[m[0]+Math.cos(i/18*TAU)*r,m[1]+Math.sin(i/18*TAU)*r*.8]),rw=Math.max(6,r*.18);s.knockout(ribbon(ring,rw*1.8,{close:true,taper:0,wobble:.6}),.85*ow);s.fill(Y,ribbon(ring,rw,{close:true,taper:0,wobble:.6}),.95*ow);}
  spinRing(s,c,ballAt(tau),bump(of,cw+.5,t),t,57);
  // "from the keeper": the keeper's reach falls short — a red arrow from his hands toward the ball
  const gk=w.res.get(GKI),kw=sm(fk-.1,fk+.3,t)*(1-sm(E-.4,E,t));if(gk&&kw>.02){const h=gk.joints.rHa,bq=P(c,ballAt(tau));laneArrow(s,R,h,[lerp(h[0],bq[0],.5),lerp(h[1],bq[1],.5)],24,{progress:kw,seed:59,head:64,dashed:true});}
 },
 still:5,
};

const story:RisoStory={
 id:'quaresma-iran-2018',format:'11v11',title:'Quaresma’s trivela, 2018',
 theme:'The outside of the boot: strike across the ball and it bends away from the keeper.',
 ageNote:'2018 World Cup, Group B, Iran 1–1 Portugal, Mordovia Arena, Saransk, 25 June 2018. Quaresma was 34.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',green:'#00a95c',navy:'#22366b'},order:['yellow','red','green','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a white ball curls away from the point on a yellow trivela arc. Reduced motion: the ball and ring, still. */
 touch(s,x,y,age,seed){
  const r=rng(seed),dir=r()<.5?-1:1,u=age<=0?0:clamp(age/.9),g=age<=0?1:easeOutBack(clamp(age/.25));
  const px=x+dir*(u*260-Math.sin(u*Math.PI)*120),py=y-u*120;
  s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>{const q=i/20*TAU;return[x+Math.cos(q)*90*g,y+Math.sin(q)*30*g] as Pt;}),true),10,.95);
  if(age>0)s.stroke(Y,polyPath(Array.from({length:12},(_,i)=>{const v=u*i/11;return[x+dir*(v*260-Math.sin(v*Math.PI)*120),y-v*120] as Pt;}),false),8,.9);
  ball(s,px,py,50,age*9+hash(seed,3)*TAU);
 },
};
export default story;
