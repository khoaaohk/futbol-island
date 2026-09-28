/** Iconic play film: Peter Crouch's volley, Premier League, Stoke City 1–1 Manchester City, Britannia Stadium, Stoke-on-Trent,
 * 24 March 2012 — Stoke's goal, 59th minute: Begović's long kick, Crouch heads it on, Pennant returns it, Crouch pops it up and volleys it
 * back across himself, without looking, over Joe Hart into the far top corner.
 * A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration: public/plays/narration/crouch-man-city-2012/script.json, voiced with local Kokoro (af_bella, 1.0); timing.json imported below.
 *
 * SOURCES (read Sept 2026 as raw pages; we cannot watch the footage):
 *  - Al Jazeera / AFP, "Peter Crouch stunner stuns City" (24 March 2012)  https://www.aljazeera.com/sports/2012/3/24/peter-crouch-stunner-stuns-city
 *  - Planet Football, Raj Bains, "Great Goals Revisited: Peter Crouch for Stoke City v Man City, 2012" (and its lead press photograph, PA:
 *    "Stoke City's Peter Crouch (centre) celebrates scoring their first goal of the game with team-mates")
 *    https://www.planetfootball.com/nostalgia/great-goals-revisited-peter-crouch-stoke-city-v-man-city-2012
 *  - Inside World Soccer, "Goal of the day: Peter Crouch (Stoke) vs Man City" (25 March 2012, quoting Crouch to ESPN and Tony Pulis)
 *  - Wikipedia, "2011–12 Stoke City F.C. season" (raw wikitext: match summary)
 * CONFIRMED by those accounts: 24 March 2012, Britannia Stadium; 59th minute (AFP); "a long goal-kick from BEGOVIĆ was HEADED BY CROUCH on to
 *  PENNANT, who passed back to the forward, who then took a touch and fired a VOLLEY past goalkeeper JOE HART" (Wikipedia); "Crouch picked up a
 *  Pennant flick 25 YARDS from the goal on the FAR RIGHT … arced an incredible volley OVER HART into the TOP CORNER from around 30 yards"
 *  (AFP); "FACING TOWARDS THE CORNER FLAG in the right-hand corner, Crouch takes an uncomfortable-looking touch … at around waist height to
 *  control the ball, before striking the ball BACK ACROSS HIMSELF BLIND, with his entire body momentarily off the ground … over the head of
 *  Joe Hart and straight into the FAR CORNER" (Planet Football); "dipped into the top far corner" (Inside World Soccer); Crouch: "It's probably
 *  the best goal I've ever scored … when the ball dropped I popped it up and went for it"; Touré equalised (76'), 1–1. KITS (the PA photograph
 *  of the celebration): Stoke RED-AND-WHITE STRIPED shirts, WHITE shorts, WHITE socks; Manchester City SKY BLUE shirts and shorts, sky blue
 *  socks with white hoops; Hart in GREY; Crouch No. 25; floodlights on, dark crowd behind the goal.
 * INFERRED / ILLUSTRATIVE: every position, run and timing in metres and seconds (the volley from ≈ 28 m, ≈ 1.35 s flight, peak ≈ 5 m); his
 *  RIGHT foot (right-footed; "back across himself" while facing the right corner flag suits the right foot swinging to his left); the touch
 *  drawn as a thigh/knee pop-up (the accounts differ: instep at waist height / chest onto knee); Pennant's number and position (drawn
 *  unnumbered); where the City players were (unnumbered); Hart's position off his line and his token dive; the dusk sky and the stadium drawn as
 *  a single roofed bowl; the ball (white with navy panels); the main camera side (drawn with the goal on the left, the right flank far side);
 *  camera placements and lenses; the celebration run.
 *
 * STRUCTURE (a 1:1 recreation of the broadcast; never top-down): ONE simulation on τ (seconds; τ = 0 the volley): ch1 = the high main-stand
 * camera in near real time (the long ball, Crouch's header, Pennant's return, the volley, the net); ch2 = the slow-motion replay low behind
 * Crouch (facing the corner flag, the pop-up, the no-look swing across his body); ch3 = a replay from behind the goal (it dips over Hart into
 * the far top corner; his best goal); ch4 = the lesson on a close side camera (eyes on the dropping ball, strike before it bounces).
 * World: right-handed metres, y up, the goal Stoke attack is the line x = 0, +z = Stoke's RIGHT (the right flank, the right corner flag).
 * Inks: yellow (floodlights, teaching marks), red (Stoke, skin), blue (dusk sky, grass with yellow, City's sky blue as a light screen), navy.
 * Scenes read only their local t; figures pose on twos, cameras on ones; all randomness is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,linear,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,laneArrow,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,posed,blendPose,clampPose,runCycle,dribble,stand,strike,volley,header,backpedal,celebrate,keeperSet,keeperDive,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type Camera,type Place,type V3,type DrawResult} from './athlete';

const K='navy',R='red',Y='yellow',G='blue',B='blue';
const D2R=Math.PI/180;
/** Frame the FULL sheet: world (dx,dy) lands on the sheet centre at `zoom`, ignoring the safe box (the card window is small). */
function frame(s:Sheet,zoom=1,dx=0,dy=0){const S=zoom*s.arrival;s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,zoom/s.fit,0);}

// ================= narration (script.json mirrors it) =================
/** Provisional cue onsets (≈2.6 words/s plus pauses) — replaced by the measured Kokoro onsets in timing.json. */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/2.6+(/[.!?]$/.test(w)?.4:/[,;:]$/.test(w)?.18:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`crouch film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
import timingJson from '../../../public/plays/narration/crouch-man-city-2012/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Stoke, 2012','Stoke, 2012, the Premier League: Stoke, in red and white stripes, against Manchester City, in sky blue. A long ball, Crouch heads it on, Pennant heads it back... Peter Crouch volleys from thirty yards. Goal!',
  ['Stoke','the Premier League','in red and white stripes','against Manchester City','in sky blue','A long ball','Crouch heads it on','Pennant heads it back','Peter Crouch volleys','from thirty yards','Goal']),
 prov('No look','Watch again, slowly. He faces the corner flag, pops it up, and without looking at goal, volleys it across his body.',
  ['Watch again','slowly','He faces the corner flag','pops it up','without looking at goal','volleys it across his body']),
 prov('Over Hart','It dips over Joe Hart into the far top corner! Crouch said it was probably his best goal ever.',
  ['It dips over Joe Hart','into the far top corner','Crouch said it','his best goal ever']),
 prov('Your turn','Your turn: keep your eyes on the dropping ball, and strike it cleanly before it bounces.',
  ['Your turn','keep your eyes','on the dropping ball','strike it cleanly','before it bounces']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`crouch film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
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

// ================= the Britannia Stadium at dusk (drawn as a single roofed bowl with floodlights in the roof edge), boards =================
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
 // a March evening just after sunset: a deep blue dusk sky printed through a screen, a floodlight glow low over the roof
 s.field(K,.55,.6);s.field(B,.3,.4);
 const hz=P(c,add(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))[1];
 s.tone(Y,polyPath([[-Bnd,hz-260],[Bnd,hz-300],[Bnd,hz+40],[-Bnd,hz+40]],true),.3);
 const low=new Path2D(),roof=new Path2D(),fas=new Path2D();
 for(let i=0;i<NS;i++){const ad=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};ad(BOWL.low[i],low);ad(BOWL.roof[i],roof);ad(BOWL.fascia[i],fas);}
 s.knockout(low);s.tone(R,low,.3);s.tone(K,low,.45);
 // the crowd: Stoke red and white, City sky blue, dark coats; bobbing when they cheer
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

// ================= kits (24 March 2012, from the PA photograph) and the figure adapter =================
const SKIN:AthleteStyle['skin']=[[R,.2],[Y,.45]];
/** Stoke: red-and-white striped shirts, white shorts, white socks (photo) */
const STK=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,pattern:'stripes',patternInk:'paper',shorts:'paper',socks:'paper',trim:R,boots:K,skin:SKIN,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:[K,.9],number:null,...o});
/** Manchester City: sky blue shirts and shorts, sky blue socks (photo; the white hoops not drawn) */
const MCI=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:[B,.45],shorts:[B,.45],socks:[B,.45],trim:'paper',boots:K,skin:SKIN,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:K,number:null,...o});
const CROUCH:AthleteStyle=STK({number:25,hair:[K,.7],build:{height:2.01,bulk:.86},seed:25});
const HART:AthleteStyle={shirt:[K,.45],shorts:[K,.55],socks:[K,.45],trim:K,boots:K,skin:SKIN,hair:[Y,.5],hairStyle:'short',line:K,sleeves:'long',shade:[K,.26],number:null,gloves:'paper',build:{height:1.96},seed:1};
const REF:AthleteStyle={shirt:[K,.92],shorts:[K,.92],socks:[K,.92],trim:'paper',boots:K,skin:SKIN,hair:[K,.6],hairStyle:'bald',line:K,sleeves:'short',seed:33};
/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, continuous-silhouette body). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:AthleteStyle,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean}={}):DrawResult{
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,style,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,style,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 the volley) =================
type TK=[number,number,number];
type Role='hero'|'stk'|'mci'|'gk'|'ref';
type Actor={name:string;role:Role;style:AthleteStyle;keys:TK[];key?:boolean};
const GRAV=9.81,DROP=-4.6,CH1=-3.3,PH=-2.2,POP=-.95,VOL=0,FLIGHT=1.35,IN_NET=VOL+FLIGHT;
const FAR:V3=[-62,.11,4],C1:V3=[-32.4,2.1,16.6],PN:V3=[-28.6,2.2,22.8],PU:V3=[-24.9,.75,14.3],VP:V3=[-24.6,.95,14.1],GL:V3=[0,2.12,-3.15];
/** where a player stands so his head meets a ball at b while facing f */
const under=(b:V3,f:[number,number],back=.12):[number,number]=>{const l=Math.hypot(f[0],f[1]);return[b[0]-f[0]/l*back,b[2]-f[1]/l*back];};
/** he FACES the right corner flag (+x, +z) and volleys back across himself: right foot, body swivelling to his left */
const FACE_FLAG:[number,number]=[34,20],SHOTDIR:[number,number]=[GL[0]-VP[0],GL[2]-VP[2]];
const C_C1=under(C1,[PN[0]-C1[0],PN[2]-C1[2]]),P_PN=under(PN,[PU[0]-PN[0],PU[2]-PN[2]]);
/** the volley's contact point is to his right side and a little ahead as he swivels */
const C_VP:[number,number]=[VP[0]-.35,VP[2]-.55];
const ACTORS:Actor[]=[
 {name:'Crouch',role:'hero',style:CROUCH,key:true,keys:[[-6,-35,15.4],[-4.6,-33.6,16],[CH1,C_C1[0],C_C1[1]],[-2.6,-31.4,16.1],[-1.8,-28.2,15.2],[POP,VP[0]-.9,VP[2]-.2],[-.4,C_VP[0]-.15,C_VP[1]],[VOL,C_VP[0],C_VP[1]],[.7,-24.6,13.6],[1.8,-23.6,11],[3.2,-21.5,6.5],[4.8,-19,1.5],[6.5,-17,-3],[10,-16,-5]]},
 {name:'Pennant',role:'stk',style:STK({seed:16,hair:[K,.8]}),key:true,keys:[[-6,-31,26],[-3.6,-29.6,24],[PH,P_PN[0],P_PN[1]],[-1,-28,22],[2,-24,17],[10,-20,8]]},
 {name:'Hart',role:'gk',style:HART,key:true,keys:[[-6,-3.4,1.4],[-2,-3.8,2.6],[VOL,-3.6,2.2],[10,-3.6,2.2]]},
 {name:'City centre-back',role:'mci',style:MCI({seed:44,build:{height:1.9}}),key:true,keys:[[-6,-37,14],[-4.6,-35.4,15],[CH1,-33.6,15.8],[-2,-31.5,15.4],[-.8,-28.2,14.2],[VOL,-26.8,13.4],[10,-25,12]]},
 {name:'City full-back',role:'mci',style:MCI({seed:45}),key:true,keys:[[-6,-31,28],[CH1,-30,25.4],[PH,-29.6,24.2],[VOL,-27,19.5],[10,-25,17]]},
 {name:'City midfielder',role:'mci',style:MCI({seed:46}),keys:[[-6,-28,8],[VOL,-22.5,10],[10,-21,9]]},
 {name:'City defender 2',role:'mci',style:MCI({seed:47}),keys:[[-6,-24,2],[VOL,-18,3],[10,-16,2]]},
 {name:'City defender 3',role:'mci',style:MCI({seed:48}),keys:[[-6,-25,-8],[VOL,-19,-6],[10,-17,-6]]},
 {name:'Stoke forward',role:'stk',style:STK({seed:49}),keys:[[-6,-27,-2],[VOL,-19,-1],[10,-15,-1]]},
 {name:'Stoke midfielder',role:'stk',style:STK({seed:50}),keys:[[-6,-40,4],[VOL,-33,6],[10,-28,6]]},
 {name:'Referee',role:'ref',style:REF,keys:[[-6,-44,8],[VOL,-36,9],[10,-30,8]]},
];
const HERO=0,PNI=1,GKI=2;
function herm(keys:TK[],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:1|2)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
const TA=-6,TB=10,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(TB-TA)/DT;i++){const[x,z]=herm(a.keys,TA+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-TA)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.1),b=posOf(k,tau+.1);return[(b[0]-a[0])/.2,(b[1]-a[1])/.2];};

// ---- the ball: Begović's long kick dropping in, Crouch's header on, Pennant's header back, the pop-up, the volley ----
function arc(a:V3,b:V3,D:number,s:number):V3{const u=s/D,vy=(b[1]-a[1]+.5*GRAV*D*D)/D;return[lerp(a[0],b[0],u),a[1]+vy*s-.5*GRAV*s*s,lerp(a[2],b[2],u)];}
const HIGH:V3=[-45,22,11];
const V_END:V3=(()=>{const a=arc(VP,GL,FLIGHT,FLIGHT-.02),b=arc(VP,GL,FLIGHT,FLIGHT);return[(b[0]-a[0])/.02,(b[1]-a[1])/.02,(b[2]-a[2])/.02];})();
const REST:V3=[1.4,.11,-2.6],NET_HIT:V3=[2,1.8,-2.8];
function ballAt(tau:number):V3{
 if(tau<DROP)return mix3(HIGH,[HIGH[0]+4,HIGH[1]+1,HIGH[2]+1.6],sm(-6,DROP,tau));
 if(tau<CH1){const s=tau-DROP,D=CH1-DROP,a:V3=[HIGH[0]+4,HIGH[1]+1,HIGH[2]+1.6];const u=s/D;return[lerp(a[0],C1[0],u),lerp(a[1],C1[1],u*u),lerp(a[2],C1[2],u)];}
 if(tau<PH)return arc(C1,PN,PH-CH1,tau-CH1);
 if(tau<POP)return arc(PN,PU,POP-PH,tau-PH);
 if(tau<VOL)return arc(PU,VP,VOL-POP,tau-POP);
 if(tau<IN_NET)return arc(VP,GL,FLIGHT,tau-VOL);
 const s=tau-IN_NET;if(s<.1)return[GL[0]+V_END[0]*s,GL[1]+V_END[1]*s,GL[2]+V_END[2]*s];
 const a:V3=[GL[0]+V_END[0]*.1,GL[1]+V_END[1]*.1,GL[2]+V_END[2]*.1];
 if(s<.55){const u=(s-.1)/.45;return[lerp(a[0],REST[0],u),lerp(a[1],.11,u*u),lerp(a[2],REST[2],u)];}
 const u=clamp((s-.55)/.6);return[REST[0],.11+.2*Math.sin(u*Math.PI)*(1-u),REST[2]];
}
void FAR;

// ---- poses ----
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
const LIN=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as(keyof Pose)[]){const v=LIN.has(k)?d[k]!:d[k]!*D2R;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
function headerOver(p:Pose,tau:number,contact:number,D:number,extra?:Partial<Pose>){const u=(tau-(contact-.52*D))/D;
 if(u>-.1&&u<1.4){p=blendPose(p,header(clamp(u)),Math.min(sm(-.1,.1,u),1-sm(1,1.4,u)));if(extra)p=over(p,extra,bump(.35,.75,u));}return p;}
/** the pop-up: the right thigh lifts under the dropping ball, knee bent, eyes down on it */
const POPUP:Partial<Pose>={rHipF:78,rKnee:84,rAnk:20,lKnee:20,neckP:44,lean:10,lShA:40,rShA:36};
/** the scissor volley across his body: both feet off the ground at contact (Planet Football), the right leg swinging high and across */
function volleyOver(p:Pose,tau:number){const D=.95,u=(tau-(VOL-.5*D))/D;
 if(u>-.1&&u<1.5){p=blendPose(p,volley(clamp(u),{foot:'r',height:.85}),Math.min(sm(-.1,.12,u),1-sm(1.1,1.5,u)));p=over(p,{air:.32,lKnee:60,lHipF:30},bump(.35,.68,u));}return p;}
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.45?YAW(v[0],v[1]):YAW(b[0]-x,b[2]-z);
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='mci'?READY:stand();
 const s=clamp((sp-2)/5);let p:Pose=blendPose(idle,runCycle(distOf(k,tau)/(2.3+2*s),{speed:s}),clamp((sp-.4)/.8));
 if(k===HERO){
  if(tau>CH1-.8&&tau<CH1+.3)yaw=lerpAng(yaw,YAW(PN[0]-x,PN[2]-z),Math.min(sm(CH1-.8,CH1-.5,tau),1-sm(CH1+.1,CH1+.3,tau)));
  // facing the corner flag for the pop-up; the volley() swivel turns the body round to the goal itself (yaw -62° → +34° in the generator)
  if(tau>-1.6&&tau<1){const fy=lerpAng(YAW(FACE_FLAG[0],FACE_FLAG[1])-.5,YAW(FACE_FLAG[0],FACE_FLAG[1])+.35,sm(-.6,-.38,tau));yaw=lerpAng(yaw,fy,Math.min(sm(-1.6,-1.2,tau),1-sm(.6,1,tau)));}
  p=headerOver(p,tau,CH1,.9,{neckP:-10,neckY:30});
  p=over(p,POPUP,bump(POP-.35,POP+.3,tau));
  p=volleyOver(p,tau);
  if(tau>1.6){p=blendPose(p,celebrate((tau-1.6)*.8,{kind:'run'}),sm(1.6,2,tau));}
  return{p,yaw};}
 if(k===PNI){if(tau>PH-.8&&tau<PH+.3)yaw=lerpAng(yaw,YAW(PU[0]-x,PU[2]-z),Math.min(sm(PH-.8,PH-.5,tau),1-sm(PH+.1,PH+.3,tau)));p=headerOver(p,tau,PH,.9);return{p,yaw};}
 if(a.role==='gk'){yaw=YAW(b[0]-x,b[2]-z);p=idle;
  // a token dive, back and to his right (−z), nowhere near it
  if(tau>VOL+.55)p=keeperDive(clamp((tau-VOL-.55)/1),{side:'r',height:.95});
  return{p,yaw};}
 if(k===3&&tau>CH1-.5&&tau<CH1+.3)p=headerOver(p,tau,CH1+.05,.9);
 const along=v[0]*Math.cos(yaw)-v[1]*Math.sin(yaw);
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 return{p,yaw};
}

type Item={depth:number;draw:()=>void};
type World={ball:V3;res:Map<number,DrawResult>};
function drawWorld(s:Sheet,c:Camera,tau:number,tp:number,o:{ballMin:number;hero?:boolean;glow?:number;only?:number[]}):World{
 const b=ballAt(tau),items:Item[]=[],res=new Map<number,DrawResult>();
 const m0=s.getTransform(),ppu=Math.sqrt(Math.abs(m0.a*m0.d-m0.b*m0.c))/s.dpr,passing=!!(s as unknown as {_passage?:{pending?:unknown}})._passage?.pending;
 ACTORS.forEach((a,k)=>{if(o.only&&!o.only.includes(k))return;const[x,z]=posOf(k,tau),g:V3=[x,0,z],d=depthOf(c,g);if(d<1)return;const[gx,gy]=P(c,g),kk=kAt(c,g);if(Math.abs(gx)>s.W*.62+kk*2||gy<-s.H*.6||gy>s.H*.6+2.4*kk)return;
  items.push({depth:d,draw:()=>{const{p,yaw}=poseOf(k,tp),px=kk*1.8*ppu,place:Place={x,z,yaw};
   const detail=passing?(k===HERO?'mid':'low'):px<50||(!a.key&&px<110)?'low':'auto';
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
/** a ring on the grass */
function groundRing(s:Sheet,c:Camera,cx:number,cz:number,r:number,wm:number,ink:string,cov:number,seed=7){
 if(cov<=.02)return;const pts:Pt[]=[];let d=1;for(let i=0;i<32;i++){const g:V3=[cx+Math.cos(i/32*TAU)*r,.03,cz+Math.sin(i/32*TAU)*r];const dd=depthOf(c,g);if(dd<NEAR+.2)return;pts.push(P(c,g));d=dd;}
 const w=Math.max(5,c.F*wm/d);s.knockout(ribbon(pts,w*1.6,{close:true,seed,taper:0,wobble:1}),.8*cov);s.fill(ink,ribbon(pts,w,{close:true,seed,taper:0,wobble:1}),cov);}
const volArc=(n=22):V3[]=>Array.from({length:n+1},(_,i)=>arc(VP,GL,FLIGHT,FLIGHT*i/n));
const dropArc=(n=8):V3[]=>Array.from({length:n+1},(_,i)=>arc(PU,VP,VOL-POP,(VOL-POP)*i/n));
/** the top far corner, lit */
function cornerTarget(s:Sheet,c:Camera,w:number,t:number){if(w<=.02)return;const cz=-3.1,cy=2.05,r=.55+.08*Math.sin(t*6),pts:Pt[]=[];for(let i=0;i<20;i++){const a=i/20*TAU,p:V3=[0,cy+Math.sin(a)*r,cz+Math.cos(a)*r];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}
 const path=polyPath(pts,true);s.tone(Y,path,.3*w);s.stroke(Y,path,Math.max(5,.08*kAt(c,[0,cy,cz])),.95*w);}
/** "eyes on the ball": a dashed sight line from his face to the ball */
/** a yellow arrow that shows on grass: paper knocked out under it first (yellow alone would vanish into the yellow × blue grass) */
function arrowK(s:Sheet,a:Pt,b:Pt,w:number,o:{progress:number;seed:number;head:number;dashed?:boolean;fade?:number}){const fd=o.fade??1;if(o.progress<=.02||fd<=.02)return;const e:Pt=[lerp(a[0],b[0],o.progress),lerp(a[1],b[1],o.progress)];
 s.knockout(ribbon([a,e],w*1.9,{seed:o.seed,taper:.1,wobble:.8}),.85*fd);const dx=e[0]-a[0],dy=e[1]-a[1],L=Math.hypot(dx,dy)||1;s.knockout(polyPath(Array.from({length:10},(_,i)=>[e[0]-dx/L*o.head*.5+Math.cos(i/10*TAU)*o.head*.75,e[1]-dy/L*o.head*.5+Math.sin(i/10*TAU)*o.head*.75] as Pt),true),.6*fd);
 laneArrow(s,Y,a,b,w,{progress:o.progress,seed:o.seed,head:o.head,dashed:o.dashed,cov:.95*fd});}
function sightLine(s:Sheet,c:Camera,face:Pt,b:V3,w:number,seed:number){if(w<=.02||depthOf(c,b)<NEAR)return;const q=P(c,b);arrowK(s,face,[lerp(face[0],q[0],.85),lerp(face[1],q[1],.85)],16,{progress:w,seed,head:44,dashed:true});}

// ================= chapter 1 (live): the high main-stand camera; the long ball, the header on, the header back, the volley, the net =================
const tau1=(t:number)=>{const E=SEC(0),lb=T(0,'A long ball'),ch=T(0,'Crouch heads it on'),ph=T(0,'Pennant heads it back'),pc=T(0,'Peter Crouch volleys'),ft=T(0,'from thirty yards'),g=T(0,'Goal');
 return key(t,mono([[0,-6],[lb,DROP],[ch+.2,CH1],[ph+.2,PH],[pc-.3,POP],[pc+.2,VOL+.02],[ft+.2,.7],[g,IN_NET+.1],[E+1,IN_NET+.1+(E+1-g)]]),linear);};
const CAM1:V3=[-30,20,-58];
function look1(tau:number):V3{const b=ballAt(tau);
 if(tau<VOL)return[lerp(b[0],-26,.5),1.5,lerp(b[2],16,.5)-2];
 if(tau<IN_NET)return mix3([-25,1.5,12],[-4,1.6,-1],sm(VOL,IN_NET,tau,easeInOutSine));
 const[x,z]=posOf(HERO,tau);return mix3([-4,1.6,-1],[x,1,z],sm(IN_NET+.3,IN_NET+2,tau));}
function cam1(t:number){const tau=tau1(t),a=look1(tau),b=look1(tau-.3),c=look1(tau-.6),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const F=key(tau,[[-6,2800],[CH1,3400],[POP,3900],[VOL,3900],[IN_NET,3000],[IN_NET+2.5,3600]]);return cam(CAM1,look,F);}
const ch1:Scene={
 draw(s,t){const tt=twos(t),c=cam1(t),tau=tau1(t),tp=tau1(tt),goalIn=tau-IN_NET;frame(s);
  stadium(s,c,{t,cheer:.12+.9*sm(0,.5,goalIn),flash:.15+1.2*sm(0,.4,goalIn)});
  ground(s,c,{net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  drawWorld(s,c,tau,tp,{ballMin:9});},
 aperture(t){const c=cam1(t),p=ballAt(tau1(t)),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(9,BALL_R*kAt(c,p))*1.1,12);},
 still:12,
};

// ================= chapter 2 (TV replay, slow motion, low behind Crouch): facing the corner flag, the pop-up, the no-look volley across his body =================
const tau2=(t:number)=>{const E=SEC(1),fc=T(1,'He faces the corner flag'),pu=T(1,'pops it up'),wl=T(1,'without looking at goal'),va=T(1,'volleys it across his body');
 return key(t,mono([[0,PH-.2],[fc,-1.35],[pu+.3,POP+.05],[wl,-.45],[va+.2,VOL+.02],[va+1,.55],[E,1.1]]),linear);};
function cam2(t:number){const E=SEC(1),push=sm(0,T(1,'volleys it across his body'),t,easeInOutSine),fol=sm(T(1,'volleys it across his body'),E,t,easeInOutSine);
 const look=mix3([VP[0],1,VP[2]],[VP[0]+7,1.8,VP[2]-5.2],fol);
 return cam([VP[0]-5.2+1.2*push,1.7,VP[2]+5.2-1.2*push],look,lerp(1450,1250,fol));}
const ch2:Scene={
 draw(s,t){const tt=twos(t),c=cam2(t),tau=tau2(t),tp=tau2(tt),E=SEC(1),fc=T(1,'He faces the corner flag'),pu=T(1,'pops it up'),wl=T(1,'without looking at goal'),va=T(1,'volleys it across his body');frame(s);
  stadium(s,c,{t,cheer:.1});
  ground(s,c);
  // "faces the corner flag": an arrow on the grass from his feet toward the flag (red)
  const[hx,hz]=posOf(HERO,Math.min(tau,-.6));trail3(s,c,[[hx,.04,hz],[hx+3.4,.04,hz+2],[hx+6.8,.04,hz+4]],.22,R,{progress:sm(fc-.1,fc+.5,t,easeOut),cov:.9*(1-sm(wl,wl+.4,t)),seed:21});
  // "pops it up": the little loop of the ball off his thigh (yellow)
  trail3(s,c,dropArc(),.06,Y,{progress:sm(pu-.1,pu+.6,t,easeOut),cov:.95*(1-sm(va+.4,va+.8,t)),dashed:true,head:false,seed:23});
  // "volleys it across his body": the swing and the ball's line away toward the far corner
  trail3(s,c,volArc(),.08,Y,{progress:clamp((tau-VOL)/FLIGHT)*sm(va-.1,va+.1,t),cov:.95*(1-sm(E-.5,E-.1,t)),seed:25});
  const w=drawWorld(s,c,tau,tp,{ballMin:9,hero:true,glow:sm(pu-.1,pu+.3,t)*(1-sm(va,va+.3,t))});
  // "without looking at goal": his eyes stay on the ball (sight line), not on the goal
  const q=w.res.get(HERO);if(q)sightLine(s,c,q.joints.face,ballAt(tau),sm(wl-.1,wl+.3,t)*(1-sm(va+.2,va+.5,t)),27);
  if(q){const f=q.joints.rToe,ag=tp-VOL;if(ag>-.05&&ag<.35)sparkBurst(s,Y,f[0],f[1],kAt(c,VP)*.45,{n:8,seed:29,g:easeOutBack(clamp((ag+.05)/.12))*(1-clamp((ag-.2)/.15)),width:9});}
  if(t<.5)speedLines(s,K,0,0,0,{n:12,seed:33,len:900,spread:520,width:22,cov:.5*(1-t/.5)});
 },
 aperture(t){const c=cam2(t),p=ballAt(tau2(t)),[x,y]=P(c,p),r=Math.max(9,BALL_R*kAt(c,p));return apertureDisc(x,y,r*1.1,12);},
 still:6,
};

// ================= chapter 3 (replay from behind the goal): it dips over Hart into the far top corner; his best goal =================
const tau3=(t:number)=>{const E=SEC(2),dh=T(2,'It dips over Joe Hart'),ft=T(2,'into the far top corner'),cs=T(2,'Crouch said it');
 return key(t,mono([[0,VOL+.1],[dh+.2,.7],[ft+.3,IN_NET+.05],[cs,IN_NET+.9],[E,IN_NET+.9+(E-cs)*.9]]),linear);};
function cam3(t:number){const tau=tau3(t),E=SEC(2),b=ballAt(Math.min(tau,IN_NET)),[x,z]=posOf(HERO,tau),fol=sm(T(2,'Crouch said it')-.2,E,t,easeInOutSine);
 const look=mix3([lerp(b[0],-6,.35),lerp(b[1],1.6,.5),lerp(b[2],-1,.35)],[x,1.3,z],fol);
 return cam([7,2.4,2],look,lerp(1150,2200,fol));void E;}
const ch3:Scene={
 draw(s,t){const tt=twos(t),c=cam3(t),tau=tau3(t),tp=tau3(tt),dh=T(2,'It dips over Joe Hart'),ft=T(2,'into the far top corner'),cs=T(2,'Crouch said it'),bg=T(2,'his best goal ever'),E=SEC(2),goalIn=tau-IN_NET;frame(s);
  stadium(s,c,{t,cheer:.2+.9*sm(0,.4,goalIn),flash:.2+1.2*sm(0,.4,goalIn)});
  ground(s,c,{net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  trail3(s,c,volArc(),.09,Y,{progress:clamp((tau-VOL)/FLIGHT)*sm(dh-.2,dh,t),cov:.95*(1-sm(cs,cs+.5,t)),seed:41});
  cornerTarget(s,c,sm(ft-.3,ft+.2,t)*(1-sm(cs+.2,cs+.6,t)),t);
  const w=drawWorld(s,c,tau,tp,{ballMin:8,hero:true});
  const q=w.res.get(HERO);if(q){const h=q.joints.head,ag=t-bg;if(ag>-.1&&ag<1.2)sparkBurst(s,Y,h[0],h[1]-40,kAt(c,[-20,1,4])*1.4,{n:12,seed:43,g:easeOutBack(clamp((ag+.1)/.3))*(1-clamp((ag-.8)/.4)),width:12});}
  if(t<.45)speedLines(s,K,0,0,Math.PI,{n:12,seed:47,len:900,spread:520,width:22,cov:.5*(1-t/.45)});
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(HERO,tau3(t)),p:V3=[x,1.3,z],[px,py]=P(c,p);return apertureDisc(px,py,Math.max(12,.22*kAt(c,p)),12);},
 still:4,
};

// ================= chapter 4 (the lesson, a close side camera): eyes on the dropping ball, strike it cleanly before it bounces =================
const tau4=(t:number)=>{const E=SEC(3),ke=T(3,'keep your eyes'),db=T(3,'on the dropping ball'),sc=T(3,'strike it cleanly'),bb=T(3,'before it bounces');
 return key(t,mono([[0,POP-.4],[ke,POP],[db+.4,-.45],[sc,-.12],[sc+.9,VOL+.03],[bb+.3,.4],[E,1]]),linear);};
function cam4(t:number){const E=SEC(3),push=sm(0,E,t,easeInOutSine),look:V3=[VP[0]+.3,1,VP[2]-.2];
 return cam([VP[0]+5.5-1*push,1.3,VP[2]-5.5+1*push],look,lerp(1500,1700,push));}
const ch4:Scene={
 draw(s,t){const tt=twos(t),c=cam4(t),tau=tau4(t),tp=tau4(tt),E=SEC(3),ke=T(3,'keep your eyes'),db=T(3,'on the dropping ball'),sc=T(3,'strike it cleanly'),bb=T(3,'before it bounces');frame(s);
  stadium(s,c,{t,cheer:.08});
  ground(s,c);
  trail3(s,c,dropArc(),.07,Y,{progress:sm(db-.1,db+.6,t,easeOut),cov:.95*(1-sm(sc+.3,sc+.7,t)),dashed:true,head:true,seed:51});
  // "before it bounces": the spot where it WOULD bounce, a red ring on the grass it never reaches
  groundRing(s,c,VP[0]+.6,VP[2]-.3,.35+.05*Math.sin(t*7),.05,R,sm(bb-.2,bb+.2,t)*(1-sm(E-.4,E,t)),53);
  const w=drawWorld(s,c,tau,tp,{ballMin:10,hero:true,only:[HERO]});
  const q=w.res.get(HERO);if(q){sightLine(s,c,q.joints.face,ballAt(tau),sm(ke-.1,ke+.3,t)*(1-sm(sc,sc+.3,t)),55);
   const f=q.joints.rToe,ag=tp-VOL;if(ag>-.05&&ag<.4)sparkBurst(s,Y,f[0],f[1],kAt(c,VP)*.5,{n:9,seed:57,g:easeOutBack(clamp((ag+.05)/.12))*(1-clamp((ag-.25)/.15)),width:10});}
 },
 still:5,
};

const story:RisoStory={
 id:'crouch-man-city-2012',format:'11v11',title:'Crouch’s volley, 2012',
 theme:'Keep your eyes on the dropping ball and strike it cleanly before it bounces.',
 ageNote:'Premier League, Stoke City 1–1 Manchester City, Britannia Stadium, Stoke-on-Trent, 24 March 2012 (59th minute). Crouch was 31.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a ball popped up from the point and volleyed away. Reduced motion: the ring and ball, still. */
 touch(s,x,y,age,seed){
  const u=age<=0?0:clamp(age/.9),g=age<=0?1:easeOutBack(clamp(age/.25)),dir=hash(seed,5)<.5?-1:1;
  s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>{const q=i/20*TAU;return[x+Math.cos(q)*90*g,y+Math.sin(q)*30*g] as Pt;}),true),10,.95);
  const up=u<.4?Math.sin(u/.4*Math.PI)*120:0,px=u<.4?x:x+dir*(u-.4)/.6*260,py=u<.4?y-up:y-Math.sin((u-.4)/.6*Math.PI)*200;
  ball(s,px,py,50,age*9+hash(seed,3)*TAU);
 },
};
export default story;
