/** Iconic play film: Ian Rush's equaliser, 1986 FA Cup final, Everton 1–3 Liverpool, Wembley Stadium, London, 10 May 1986 — Rush's first
 * goal (56th minute; Liverpool FC Stats: 57th): Mølby sends him clear, he side-steps Bobby Mimms and slots the ball home.
 * A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration: public/plays/narration/rush-final-1986/script.json, voiced with local Kokoro (af_bella, 1.0); timing.json imported below.
 *
 * SOURCES (read Sept 2026 as raw pages; we cannot watch the footage):
 *  - Wikipedia, "1986 FA Cup final" (raw wikitext: football box, kit boxes, line-ups)  https://en.wikipedia.org/wiki/1986_FA_Cup_final
 *  - Liverpool FC Stats, "FA Cup Final 1985-86 - Liverpool v Everton" (match report and line-up)
 *    http://www.liverpoolfcstats.co.uk/p/fa-cup-final-1985-86-liverpool-3-1.html
 *  - Liverpool FC, "FA Cup final memories: 1986"  https://www.liverpoolfc.com/news/first-team/118758-fa-cup-final-memories-1986
 *  - fa-cupfinals.co.uk, "1986 Liverpool" (via web.archive.org)
 * CONFIRMED by those accounts: 10 May 1986, 15:00 BST, Wembley, 98,000; Everton led 1–0 at half-time (Lineker 27'); "It started with a SLOPPY
 *  PASS by Everton's GARY STEVENS, KEVIN MACDONALD INTERCEPTED, slipped the ball to JAN MOLBY and the Dane SENT RUSH CLEAR … Rush hardly checked
 *  his stride as he SIDE-STEPPED young goalkeeper BOBBY MIMMS and SLOTTED THE BALL HOME" (Liverpool FC Stats); Johnston made it 2–1 (62'),
 *  Rush scored again six minutes from time; Liverpool won 3–1 (the double); Rush man of the match. KITS (Wikipedia kit boxes): Liverpool ALL
 *  RED; Everton ROYAL BLUE shirts, WHITE shorts, WHITE socks. Numbers: Rush 9, Mølby 10, MacDonald 11; Mimms 1; Stevens 2.
 * INFERRED / ILLUSTRATIVE: every position, run and timing in metres and seconds (Mølby's pass ≈ 20 m from the centre circle area, Rush clear
 *  from ≈ 25 m, Mimms out to ≈ 8 m); Rush being level with/behind the last defender at the pass (onside: the goal stood); WHICH WAY he went round
 *  Mimms (drawn: a touch to his right, +z, while Mimms goes down to HIS right, −z) and his RIGHT foot for the finish; where Stevens, MacDonald and the
 *  other players were; Mimms's kit (drawn in a light grey top); the referee's black; Wembley as drawn (the twin towers, roofed stands, the dog
 *  track, plain advertising boards, no brands); the May afternoon light; the main camera side (drawn with the goal on the left); camera
 *  placements and lenses; Rush's celebration run.
 *
 * STRUCTURE (a 1:1 recreation of the broadcast; never top-down): ONE simulation on τ (seconds; τ = 0 Rush's finish): ch1 = the high main-stand
 * camera in near real time (the interception, Mølby's pass, Rush clear, round the keeper, the net); ch2 = the slow-motion replay from a high
 * side camera level with the play (the offside line: he times his run, the keeper comes out, the side-step, the slot); ch3 = a low camera
 * behind the goal (the net, Rush away; three–one later); ch4 = the lesson on a low side camera. Seams are forward passages into the ball.
 * World: right-handed metres, y up, the goal Liverpool attack is the line x = 0, +z = Liverpool's RIGHT.
 * Inks: yellow (sun, teaching marks), red (Liverpool, skin, cinder track), blue (sky, grass with yellow, Everton), navy (key line).
 * Scenes read only their local t; figures pose on twos, cameras on ones; all randomness is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,linear,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,laneArrow,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,posed,blendPose,clampPose,runCycle,dribble,stand,strike,backpedal,celebrate,keeperSet,keeperDive,
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
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`rush film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
import timingJson from '../../../public/plays/narration/rush-final-1986/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Wembley, 1986','Wembley, 1986, the FA Cup final: Liverpool, in red, against Everton, in blue. Everton lead, until Jan Mølby slides a pass through. Ian Rush races clear, steps round the keeper, and scores!',
  ['Wembley','the FA Cup final','Liverpool','in red','against Everton','in blue','Everton lead','Jan Mølby slides a pass through','Ian Rush races clear','steps round the keeper','and scores']),
 prov('Onside','Watch again, slowly. Rush times his run, so he stays onside. The keeper, Mimms, comes out. One touch to the side, and he slots it in.',
  ['Watch again','slowly','Rush times his run','stays onside','The keeper, Mimms, comes out','One touch to the side','slots it in']),
 prov('One-all','One-all! Rush scored again later, and Liverpool won three-one.',
  ['One-all','Rush scored again','Liverpool won','three-one']),
 prov('Your turn','Your turn: time your run so you are onside, then take the ball round the keeper.',
  ['Your turn','time your run','you are onside','take the ball round','the keeper']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`rush film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
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

// ================= Wembley on a May afternoon: roofed stands all round, the dog track, the twin towers, boards =================
const CX=-52.5,NS=56;
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(63+d)*Math.sign(c)*Math.pow(Math.abs(c),.42),y,(46+d)*Math.sign(s)*Math.pow(Math.abs(s),.42)];}
const LOW=(b:number):[number,number]=>[1+21*b,1.2+10.5*b];
type Bowl={low:V3[][];back:V3[][];roof:V3[][];fascia:V3[][];seats:{P:V3;h:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],back:[],roof:[],fascia:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(d0:number,y0:number,d1:number,y1:number):V3[]=>[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];
  const[l0,h0]=LOW(0),[l1,h1]=LOW(1);o.low.push(Q(l0,h0,l1,h1));
  o.back.push([rim(a,22,11.6),rim(b,22,11.6),rim(b,22,21.5),rim(a,22,21.5)]);
  o.roof.push(Q(13,20.6,34,23.5));o.fascia.push(Q(13,19.4,13,20.7));
  for(let r=0;r<10;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7,37);if(h<.1)continue;const[d,y]=LOW((r+.5)/10);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 return o;})();
type Crowd={t:number;cheer?:number;flash?:number};
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{t,cheer=0,flash=0}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5,inV=(p:Pt,m=0)=>Math.abs(p[0])<Bnd+m&&Math.abs(p[1])<Bnd+m;
 // a sunny May afternoon: a blue sky, warmer low down
 s.field(B,.45,.6);
 const hz=P(c,add(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))[1];
 s.tone(Y,polyPath([[-Bnd,hz-300],[Bnd,hz-340],[Bnd,hz+40],[-Bnd,hz+40]],true),.35);
 towers(s,c);
 const low=new Path2D(),back=new Path2D(),roof=new Path2D(),fas=new Path2D();
 for(let i=0;i<NS;i++){const ad=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};ad(BOWL.back[i],back);ad(BOWL.low[i],low);ad(BOWL.roof[i],roof);ad(BOWL.fascia[i],fas);}
 s.knockout(back);s.fill(K,back,.6);
 s.knockout(low);s.tone(B,low,.3);s.tone(K,low,.3);
 // the crowd: Merseyside split, Liverpool red and Everton blue, white scarves, dark coats
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];let any=0;
 for(const q of BOWL.seats){const d=depthOf(c,q.P);if(d<16)continue;const p=P(c,q.P);if(!inV(p))continue;const z=clamp(c.F*.5/d,2,12),lift=cheer>0?cheer*z*1.2*Math.max(0,Math.sin(tt*11+q.h*TAU)):0;
  inks[q.h<.3?0:q.h<.62?1:q.h<.88?2:3].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);any++;}
 if(any){s.knockout(inks[0],.75);s.fill(R,inks[1],.9);s.fill(B,inks[2],.9);s.fill(K,inks[3],.8);}
 s.knockout(roof);s.fill(K,roof,.8);
 s.knockout(fas);s.tone(Y,fas,.3);s.tone(K,fas,.3);
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
/** the pitch: the cinder dog track (red × navy), afternoon grass (yellow × blue = green), mowing stripes, paper lines, the goals */
function ground(s:Sheet,c:Camera,o:{net?:(p:V3)=>V3}={}){
 const apron=new Path2D();addPoly(apron,clipPoly(c,Array.from({length:NS},(_,i)=>rim(i/NS*TAU,-.6,0))));s.knockout(apron);s.fill(R,apron,.55);s.tone(K,apron,.2);
 const gp=new Path2D();addPoly(gp,clipPoly(c,[[-110,0,-38],[5,0,-38],[5,0,38],[-110,0,38]]));s.knockout(gp);s.fill(Y,gp,.85);s.tone(B,gp,.6);
 const stripes=new Path2D();for(let x=-105;x<0;x+=10)addPoly(stripes,clipPoly(c,[[x,0,-34],[x+5,0,-34],[x+5,0,34],[x,0,34]]));s.tone(B,stripes,.2);
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

// ================= kits (10 May 1986) and the figure adapter =================
const SKIN:AthleteStyle['skin']=[[R,.2],[Y,.45]];
/** Liverpool: all red (confirmed); white trim and numbers (inferred; sponsor not drawn) */
const LIV=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:R,socks:R,trim:'paper',boots:K,skin:SKIN,hair:K,hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',numberInk:'paper',number:null,...o});
/** Everton: royal blue shirts, white shorts, white socks (confirmed); paper numbers (inferred) */
const EVE=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,shorts:'paper',socks:'paper',trim:'paper',boots:K,skin:SKIN,hair:K,hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',numberInk:'paper',number:null,...o});
const RUSH:AthleteStyle=LIV({number:9,hair:K,build:{height:1.83,bulk:.97},seed:9});
const MOLBY:AthleteStyle=LIV({number:10,hair:[Y,.7],build:{height:1.86,bulk:1.12},seed:10});
const MACDONALD:AthleteStyle=LIV({number:11,hair:[R,.6],seed:11});
const MIMMS:AthleteStyle={shirt:[K,.3],shorts:[K,.9],socks:[K,.3],trim:K,boots:K,skin:SKIN,hair:K,hairStyle:'curly',line:K,sleeves:'long',shade:[K,.26],number:1,numberInk:[K,.9],gloves:'paper',build:{height:1.85},seed:1};
const REF:AthleteStyle={shirt:[K,.92],shorts:[K,.92],socks:[K,.92],trim:'paper',boots:K,skin:SKIN,hair:[K,.6],hairStyle:'balding',line:K,sleeves:'short',seed:33};
/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, continuous-silhouette body). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:AthleteStyle,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean}={}):DrawResult{
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,style,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,style,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 Rush's finish) =================
type TK=[number,number,number];
type Role='hero'|'liv'|'eve'|'gk'|'ref';
type Actor={name:string;role:Role;style:AthleteStyle;keys:TK[];key?:boolean};
const SP=-5.2,IC=-4.4,MR=-3.5,MP=-3.1,RCV=-2,SS=-.45,FIN=0,IN_NET=.55;
const SPP:V3=[-38.6,.11,-12.4],ICP:V3=[-44.2,.11,-6.6],MRP:V3=[-42.1,.11,1.2],RC:V3=[-22.2,.11,-1.9],SSP:V3=[-9.6,.11,-.5],FP:V3=[-7.4,.11,1.8],GP:V3=[0,.14,.9];
/** the last Everton defender's line when Mølby passes (Rush is behind it: onside) */
const LINE_X=-26.4;
function standAt(b:V3,f:[number,number],ahead=.44,foot:'l'|'r'='r'):[number,number]{const l=Math.hypot(f[0],f[1]),fx=f[0]/l,fz=f[1]/l,rx=-fz,rz=fx,sd=foot==='r'?.1:-.1;return[b[0]-fx*ahead-rx*sd,b[2]-fz*ahead-rz*sd];}
const d2=(a:V3,b:V3):[number,number]=>[b[0]-a[0],b[2]-a[2]];
const R_RC=standAt(RC,[1,.05],.5),R_SS=standAt(SSP,d2(SSP,FP),.42),R_FP=standAt(FP,d2(FP,GP),.44),M_MP=standAt(MRP,d2(MRP,RC)),D_IC=standAt(ICP,d2(ICP,MRP)),S_SP=standAt(SPP,d2(SPP,ICP));
const ACTORS:Actor[]=[
 {name:'Rush',role:'hero',style:RUSH,key:true,keys:[[-6,-33,-4.2],[-4.4,-30.4,-3.7],[MP,-27.2,-3.3],[-2.5,-24.4,-2.5],[RCV,R_RC[0],R_RC[1]],[-1.2,-15.8,-1.2],[SS,R_SS[0],R_SS[1]],[-.2,-8.3,.9],[FIN,R_FP[0],R_FP[1]],[.6,-5.9,2.4],[1.6,-6.6,6],[3,-9,12],[4.6,-12,18],[6.4,-14,23],[10,-15,26]]},
 {name:'Mølby',role:'liv',style:MOLBY,key:true,keys:[[-6,-44.5,3.4],[-4.4,-43.4,2.4],[MP,M_MP[0],M_MP[1]],[-1.5,-39,.6],[10,-32,0]]},
 {name:'MacDonald',role:'liv',style:MACDONALD,key:true,keys:[[-6,-47.5,-9.5],[IC,D_IC[0],D_IC[1]],[-3.6,-43.8,-5.8],[10,-40,-5]]},
 {name:'Mimms',role:'gk',style:MIMMS,key:true,keys:[[-6,-2.4,0],[MP,-4,-.2],[-1.6,-6.8,-.4],[-.8,-8.6,-.5],[SS,-9,-.6],[FIN,-9.1,-.8],[10,-9.1,-.8]]},
 {name:'Stevens',role:'eve',style:EVE({number:2,seed:2}),key:true,keys:[[-6,-37.2,-13.6],[SP,S_SP[0],S_SP[1]],[-4,-36,-12],[-2,-30,-9],[0,-20,-6],[10,-15,-5]]},
 {name:'Ratcliffe',role:'eve',style:EVE({seed:44}),key:true,keys:[[-6,-28,4],[MP,LINE_X,3.2],[-2,-22,2.4],[-1,-16.5,1.8],[FIN,-11.5,1.4],[10,-9,1]]},
 {name:'Mountfield',role:'eve',style:EVE({seed:45}),keys:[[-6,-27.5,-7],[MP,-26.2,-7.4],[-1.5,-18.5,-5],[FIN,-12,-3.4],[10,-10,-3]]},
 {name:'Van den Hauwe',role:'eve',style:EVE({seed:43}),keys:[[-6,-26,-17],[MP,-25,-15.5],[FIN,-15,-9],[10,-13,-8]]},
 {name:'Reid',role:'eve',style:EVE({seed:46}),keys:[[-6,-43,-2],[MP,-40,-3],[FIN,-34,-2],[10,-30,-1]]},
 {name:'Bracewell',role:'eve',style:EVE({seed:47}),keys:[[-6,-48,4],[FIN,-40,3],[10,-36,3]]},
 {name:'Dalglish',role:'liv',style:LIV({seed:7,hair:[K,.7]}),keys:[[-6,-34,10],[MP,-30,9],[FIN,-18,7],[10,-12,8]]},
 {name:'Johnston',role:'liv',style:LIV({seed:8,hairStyle:'curly'}),keys:[[-6,-36,-20],[FIN,-24,-14],[10,-18,-10]]},
 {name:'Referee',role:'ref',style:REF,keys:[[-6,-50,-12],[MP,-44,-10],[FIN,-28,-8],[10,-22,-6]]},
];
const HERO=0,MOI=1,MCI=2,GKI=3,STI=4;
function herm(keys:TK[],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:1|2)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
const TA=-6,TB=10,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(TB-TA)/DT;i++){const[x,z]=herm(a.keys,TA+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-TA)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.1),b=posOf(k,tau+.1);return[(b[0]-a[0])/.2,(b[1]-a[1])/.2];};

// ---- the ball: the sloppy pass, the interception, Mølby's pass, Rush's run, the side-step, the slot ----
const roll=(a:V3,b:V3,u:number)=>mix3(a,b,u*(1.25-.25*u));
const REST:V3=[1.5,.11,1.1],NET_HIT:V3=[2,.3,1];
function glued(tau:number):V3{const[x,z]=posOf(HERO,tau),v=velOf(HERO,tau),l=Math.hypot(v[0],v[1])||1,ph=distOf(HERO,tau)/2.1,push=.5+.5*Math.abs(Math.sin(ph*Math.PI));return[x+v[0]/l*push-v[1]/l*.1,.11,z+v[1]/l*push+v[0]/l*.1];}
function ballAt(tau:number):V3{
 if(tau<SP)return SPP;
 if(tau<IC)return roll(SPP,ICP,(tau-SP)/(IC-SP));
 if(tau<MR)return roll(ICP,MRP,(tau-IC)/(MR-IC));
 if(tau<MP)return mix3(MRP,[MRP[0]+.3,.11,MRP[2]-.05],sm(MR,MP,tau));
 if(tau<RCV)return roll(MRP,RC,(tau-MP)/(RCV-MP));
 if(tau<SS-.25){const u=sm(RCV,RCV+.3,tau);return mix3(RC,glued(tau),u);}
 if(tau<SS)return mix3(glued(SS-.25),SSP,sm(SS-.25,SS,tau));
 if(tau<FIN)return roll(SSP,FP,(tau-SS)/(FIN-SS));
 if(tau<IN_NET)return roll(FP,GP,(tau-FIN)/(IN_NET-FIN));
 const u=clamp((tau-IN_NET)/.6);return[lerp(GP[0],REST[0],easeOut(u)),.11+.12*Math.sin(u*Math.PI)*(1-u),lerp(GP[2],REST[2],easeOut(u))];
}

// ---- poses ----
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
const LIN=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as(keyof Pose)[]){const v=LIN.has(k)?d[k]!:d[k]!*D2R;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
function strikeOver(p:Pose,tau:number,contact:number,D:number,power:number,foot:'l'|'r'){const u=(tau-(contact-STRIKE_CONTACT*D))/D;
 if(u>-.1&&u<1.5)p=blendPose(p,strike(clamp(u),{foot,power}),Math.min(sm(-.1,.12,u),1-sm(1.05,1.5,u)));return p;}
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.45?YAW(v[0],v[1]):YAW(b[0]-x,b[2]-z);
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='eve'?READY:stand();
 const s=clamp((sp-2)/5);let p:Pose=blendPose(idle,runCycle(distOf(k,tau)/(2.3+2*s),{speed:s}),clamp((sp-.4)/.8));
 if(k===HERO){
  if(tau>RCV&&tau<FIN-.2){p=blendPose(READY,dribble(distOf(k,tau)/2.1,{foot:'r',speed:.5+.5*s}),clamp((sp-.6)/1.4));}
  if(tau>-.35&&tau<.4)yaw=lerpAng(yaw,YAW(GP[0]-x,GP[2]-z),Math.min(sm(-.35,-.1,tau),1-sm(.25,.4,tau)));
  p=strikeOver(p,tau,SS,.5,.15,'r');p=strikeOver(p,tau,FIN,.7,.45,'r');
  if(tau>1.2){p=blendPose(p,celebrate((tau-1.2)*.8,{kind:'run'}),sm(1.2,1.6,tau));}
  return{p,yaw};}
 if(k===MOI){if(tau>MP-.6&&tau<MP+.4)yaw=lerpAng(yaw,YAW(RC[0]-x,RC[2]-z),Math.min(sm(MP-.6,MP-.3,tau),1-sm(MP+.2,MP+.4,tau)));p=strikeOver(p,tau,MP,.8,.55,'r');return{p,yaw};}
 if(k===MCI){p=strikeOver(p,tau,IC+.02,.5,.2,'r');return{p,yaw};}
 if(k===STI){p=strikeOver(p,tau,SP,.6,.3,'r');return{p,yaw};}
 if(a.role==='gk'){yaw=YAW(b[0]-x,b[2]-z);if(sp>1)p=blendPose(idle,runCycle(distOf(k,tau)/2.6,{speed:clamp((sp-1)/5)}),clamp((sp-.6)/1));
  // he goes down at Rush's feet, to his right (−z), as Rush pushes it the other way
  if(tau>SS-.12){yaw=YAW(1,0)+Math.PI;p=keeperDive(clamp((tau-SS+.12)/.9),{side:'r',height:.02});}
  return{p,yaw};}
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
/** the offside line: across the pitch at the last defender (x = LINE_X), with a tick where Rush is, behind it */
function offsideLine(s:Sheet,c:Camera,w:number,seed:number){if(w<=.02)return;trail3(s,c,[[LINE_X,.03,-30],[LINE_X,.03,30]],.4,Y,{cov:.95*w,head:false,dashed:true,seed});}
const passLane=():V3[]=>Array.from({length:9},(_,i)=>mix3(MRP,RC,i/8));
const roundPath=():V3[]=>Array.from({length:12},(_,i)=>{const u=i/11;return u<.5?mix3(SSP,FP,u*2):mix3(FP,GP,(u-.5)*2);});

// ================= chapter 1 (live): the high main-stand camera; the interception, Mølby's pass, Rush clear, round the keeper, the net =================
const tau1=(t:number)=>{const E=SEC(0),el=T(0,'Everton lead'),jm=T(0,'Jan Mølby slides a pass through'),ir=T(0,'Ian Rush races clear'),sr=T(0,'steps round the keeper'),as=T(0,'and scores');
 return key(t,mono([[0,-6],[el,-5.4],[jm-.3,MP-.1],[jm+1,MP+.7],[ir,RCV+.1],[ir+1,-1],[sr,SS-.05],[sr+.8,-.1],[as+.1,FIN+.02],[as+.8,IN_NET+.2],[E+1,IN_NET+.2+(E+.2-as)]]),linear);};
const CAM1:V3=[-34,21,-60];
function look1(tau:number):V3{const b=ballAt(tau);
 if(tau<IN_NET+.2)return[b[0]+4,1,b[2]-2];
 const[x,z]=posOf(HERO,tau);return mix3([b[0]+4,1,b[2]-2],[x,1,z],sm(IN_NET+.2,IN_NET+1.8,tau));}
function cam1(t:number){const tau=tau1(t),a=look1(tau),b=look1(tau-.3),c=look1(tau-.6),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const F=key(tau,[[-6,2600],[MP,2800],[RCV,3200],[SS,3900],[IN_NET,3900],[IN_NET+2,3500]]);return cam(CAM1,look,F);}
const ch1:Scene={
 draw(s,t){const tt=twos(t),c=cam1(t),tau=tau1(t),tp=tau1(tt),goalIn=tau-IN_NET;frame(s);
  stadium(s,c,{t,cheer:.12+.9*sm(0,.5,goalIn),flash:.1+1*sm(0,.4,goalIn)});
  ground(s,c,{net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  drawWorld(s,c,tau,tp,{ballMin:9});},
 aperture(t){const c=cam1(t),p=ballAt(tau1(t)),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(9,BALL_R*kAt(c,p))*1.1,12);},
 still:12,
};

// ================= chapter 2 (TV replay, slow motion, a high side camera level with the play): onside, the keeper out, the side-step, the slot =================
const tau2=(t:number)=>{const E=SEC(1),rt=T(1,'Rush times his run'),so=T(1,'stays onside'),kc=T(1,'The keeper, Mimms, comes out'),ot=T(1,'One touch to the side'),si=T(1,'slots it in');
 return key(t,mono([[0,MP-.9],[rt,MP-.3],[so+.6,MP+.05],[kc,RCV-.1],[kc+1.2,-1],[ot,SS-.1],[ot+.8,-.15],[si+.1,FIN+.02],[E,IN_NET+.3]]),linear);};
function cam2(t:number){const tau=tau2(t),E=SEC(1),[rx]=posOf(HERO,tau),push=sm(T(1,'The keeper, Mimms, comes out')-.3,T(1,'One touch to the side'),t,easeInOutSine);
 const lx=lerp(rx+3,-8,push),look:V3=[lx,.8,-.5];
 return cam([lx-2,lerp(15,9,push),-44+14*push],look,lerp(2300,2200,push));void E;}
const ch2:Scene={
 draw(s,t){const tt=twos(t),c=cam2(t),tau=tau2(t),tp=tau2(tt),E=SEC(1),rt=T(1,'Rush times his run'),so=T(1,'stays onside'),kc=T(1,'The keeper, Mimms, comes out'),ot=T(1,'One touch to the side'),si=T(1,'slots it in'),goalIn=tau-IN_NET;frame(s);
  stadium(s,c,{t,cheer:.1+.8*sm(0,.4,goalIn)});
  ground(s,c,{net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  // "stays onside": the last defender's line across the grass, Rush behind it as the pass goes
  offsideLine(s,c,sm(rt-.1,rt+.4,t)*(1-sm(kc,kc+.5,t)),21);
  const[hx,hz]=posOf(HERO,Math.min(tau,MP));groundRing(s,c,hx,hz,1,.07,Y,sm(so-.2,so+.2,t)*(1-sm(kc,kc+.5,t)),23);
  trail3(s,c,passLane(),.12,K,{progress:sm(rt,so+.6,t,easeOut),cov:.8*(1-sm(kc+.3,kc+.8,t)),dashed:true,seed:25});
  // "comes out": the keeper's run off his line (red)
  trail3(s,c,onGround(pathOf(GKI,MP,SS)),.16,R,{progress:sm(kc-.1,kc+.8,t,easeOut),cov:.9*(1-sm(si,si+.4,t)),seed:27});
  // "one touch to the side" / "slots it in": the path round him and into the net (yellow)
  trail3(s,c,roundPath(),.1,Y,{progress:sm(ot-.1,si+.5,t,easeOut),cov:.95*(1-sm(E-.5,E-.1,t)),seed:29});
  drawWorld(s,c,tau,tp,{ballMin:8,hero:true});
  if(t<.5)speedLines(s,K,0,0,0,{n:12,seed:33,len:900,spread:520,width:22,cov:.5*(1-t/.5)});
 },
 aperture(t){const c=cam2(t),p=ballAt(tau2(t)),[x,y]=P(c,p),r=Math.max(9,BALL_R*kAt(c,p));return apertureDisc(x,y,r*1.1,12);},
 still:6,
};

// ================= chapter 3 (low behind the goal): the net, Rush away; two goals and a 3–1 win =================
const tau3=(t:number)=>{const E=SEC(2),oa=T(2,'One-all'),rs=T(2,'Rush scored again');
 return key(t,mono([[0,FIN-.1],[oa+.3,IN_NET+.3],[rs,2.2],[E,5.6]]),linear);};
function cam3(t:number){const tau=tau3(t),E=SEC(2),[x,z]=posOf(HERO,tau),fol=sm(T(2,'One-all'),T(2,'Rush scored again')+.5,t,easeInOutSine);
 const look=mix3([-5,.8,1.2],[x,1.2,z],fol);
 return cam([5.5,1.4+.6*fol,-4.5],look,lerp(1150,1700,fol));void E;}
const ch3:Scene={
 draw(s,t){const tt=twos(t),c=cam3(t),tau=tau3(t),tp=tau3(tt),oa=T(2,'One-all'),rs=T(2,'Rush scored again'),lw=T(2,'Liverpool won'),to=T(2,'three-one'),E=SEC(2),goalIn=tau-IN_NET;frame(s);
  stadium(s,c,{t,cheer:.3+.8*sm(0,.4,goalIn),flash:.2+1.2*sm(lw-.2,lw+.3,t)});
  ground(s,c,{net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  trail3(s,c,onGround(pathOf(HERO,.8,5)),.16,R,{progress:sm(oa,rs+.6,t,easeOut),cov:.9*(1-sm(E-.8,E-.4,t)),seed:41});
  const w=drawWorld(s,c,tau,tp,{ballMin:8,hero:true});
  const q=w.res.get(HERO);if(q){const h=q.joints.head;
   const a1=t-rs;if(a1>-.1&&a1<.9)sparkBurst(s,Y,h[0],h[1]-40,kAt(c,[-8,1,8])*.9,{n:10,seed:43,g:easeOutBack(clamp((a1+.1)/.25))*(1-clamp((a1-.6)/.3)),width:10});
   const a2=t-to;if(a2>-.1&&a2<1.1)sparkBurst(s,R,h[0],h[1]-40,kAt(c,[-10,1,12])*1.3,{n:12,seed:45,g:easeOutBack(clamp((a2+.1)/.3))*(1-clamp((a2-.7)/.4)),width:12});}
  if(t<.45)speedLines(s,K,0,0,Math.PI,{n:12,seed:47,len:900,spread:520,width:22,cov:.5*(1-t/.45)});
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(HERO,tau3(t)),p:V3=[x,1.3,z],[px,py]=P(c,p);return apertureDisc(px,py,Math.max(12,.22*kAt(c,p)),12);},
 still:4,
};

// ================= chapter 4 (the lesson, a low side camera): time your run, stay onside, take it round the keeper =================
const tau4=(t:number)=>{const E=SEC(3),tr=T(3,'time your run'),yo=T(3,'you are onside'),tb=T(3,'take the ball round'),tk=T(3,'the keeper');
 return key(t,mono([[0,MP-.5],[tr,MP-.2],[yo+.5,MP+.2],[tb-.2,-1.1],[tk+.2,SS+.05],[tk+1,FIN+.05],[E,IN_NET+.4]]),linear);};
function cam4(t:number){const tau=tau4(t),E=SEC(3),[rx]=posOf(HERO,tau),push=sm(T(3,'take the ball round')-.4,T(3,'the keeper')+.3,t,easeInOutSine);
 const lx=lerp(rx+2,-8.4,push),look:V3=[lx,.8,-.5];
 return cam([lx-1.5,lerp(11,6,push),lerp(-34,-16,push)],look,lerp(2200,1900,push));void E;}
const ch4:Scene={
 draw(s,t){const tt=twos(t),c=cam4(t),tau=tau4(t),tp=tau4(tt),E=SEC(3),tr=T(3,'time your run'),yo=T(3,'you are onside'),tb=T(3,'take the ball round'),tk=T(3,'the keeper');frame(s);
  stadium(s,c,{t,cheer:.08});
  ground(s,c);
  offsideLine(s,c,sm(tr-.1,tr+.4,t)*(1-sm(tb,tb+.5,t)),51);
  const[hx,hz]=posOf(HERO,Math.min(tau,MP));groundRing(s,c,hx,hz,1,.07,Y,sm(yo-.2,yo+.2,t)*(1-sm(tb,tb+.5,t)),53);
  trail3(s,c,roundPath(),.12,Y,{progress:sm(tb-.1,tk+.8,t,easeOut),cov:.95*(1-sm(E-.5,E-.1,t)),seed:55});
  drawWorld(s,c,tau,tp,{ballMin:10,hero:true,only:[HERO,GKI,5,6,7]});
 },
 still:5,
};

const story:RisoStory={
 id:'rush-final-1986',format:'11v11',title:'Rush rounds the keeper, 1986',
 theme:'Time your run so you stay onside, then take the ball round the keeper.',
 ageNote:'1986 FA Cup final, Everton 1–3 Liverpool, Wembley Stadium, London, 10 May 1986 (Rush’s first goal, 56th minute). Rush was 24.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a red ring and a ball stepped round a little arc from the point. Reduced motion: the ring and ball, still. */
 touch(s,x,y,age,seed){
  const u=age<=0?0:clamp(age/.9),g=age<=0?1:easeOutBack(clamp(age/.25)),dir=hash(seed,5)<.5?-1:1;
  s.stroke(R,polyPath(Array.from({length:20},(_,i)=>{const q=i/20*TAU;return[x+Math.cos(q)*90*g,y+Math.sin(q)*30*g] as Pt;}),true),10,.95);
  ball(s,x+dir*Math.sin(u*Math.PI)*110,y-u*180,50,age*9+hash(seed,3)*TAU);
 },
};
export default story;
