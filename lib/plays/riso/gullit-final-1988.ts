/** Iconic play film: Ruud Gullit's header, UEFA Euro 1988 final, Soviet Union 0–2 Netherlands, Olympiastadion, Munich, 25 June 1988 —
 * the opening goal, 32nd minute: from the corner that followed Gullit's free kick, the ball comes back into the box, Van Basten heads it on
 * and Gullit, unmarked, heads it in.
 * A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration: public/plays/narration/gullit-final-1988/script.json, voiced with local Kokoro (af_bella, 1.0); timing.json imported below.
 *
 * SOURCES (read Sept 2026 as raw pages; we cannot watch the footage):
 *  - Wikipedia, "UEFA Euro 1988 final" (raw wikitext: summary citing O'Brien 2021 pp. 173–174; football box; kit boxes; line-ups)
 *    https://en.wikipedia.org/wiki/UEFA_Euro_1988_final
 *  - Wikipedia (nl), "Finale Europees kampioenschap voetbal 1988" (raw wikitext)
 *    https://nl.wikipedia.org/wiki/Finale_Europees_kampioenschap_voetbal_1988
 * CONFIRMED by those accounts: 25 June 1988, 15:30 CEST, Olympiastadion, Munich; 32': "Dasayev conceded a corner when he punched Gullit's
 *  free kick over the crossbar and although ERWIN KOEMAN's set piece was headed away, HE PASSED THE BALL INTO THE BOX, VAN BASTEN NODDED IT ON
 *  and GULLIT SCORED WITH A HEADER" (en); Gullit scored "ONGEDEKT" (UNMARKED) "na doorkoppen van Marco van Basten" (nl); Van Basten made it
 *  2–0 (53'); the Netherlands won 2–0, European champions. Gullit was captain (No. 10); Van Basten 12; Erwin Koeman 13 (left midfield);
 *  Dasayev 1 (USSR captain). KITS (Wikipedia kit boxes): Soviet Union ALL WHITE with red stripes; Netherlands ALL ORANGE.
 * INFERRED / ILLUSTRATIVE: every position, run and timing in metres and seconds; the SIDE of Erwin Koeman's ball into the box (drawn from the
 *  left, where he played; his foot drawn as the left); Van Basten meeting it beyond the far post and heading it back across; Gullit ≈ 7 m out
 *  in the middle; the header's height and corner (drawn under the bar on Dasayev's right, not narrated); Dasayev's position and dive; the
 *  other players' places (unnamed, no numbers); the Soviet red trim printed in orange (this sheet's inks); Gullit's look (dreadlocks,
 *  moustache, 1.91 m); the ball; the afternoon light and the stadium drawn as an open bowl with a translucent tent canopy on one side; the main
 *  camera side (drawn with the goal on the left); camera placements and lenses; Gullit's celebration run.
 *
 * STRUCTURE (a 1:1 recreation of the broadcast; never top-down): ONE simulation on τ (seconds; τ = 0 Gullit's header): ch1 = the high main
 * stand camera in near real time (the ball in from the left, Van Basten's header back across, Gullit's header, the net); ch2 = the slow-motion
 * replay high behind the goal (nobody marking him, an early jump, eyes open, past Dasayev); ch3 = a low camera by the corner flag (he runs to
 * celebrate; two–nil and champions); ch4 = the lesson on a side camera. Seams are forward passages into the ball.
 * World: right-handed metres, y up, the goal the Dutch attack is the line x = 0, +z = the Netherlands' RIGHT.
 * Inks: yellow (sun, teaching marks), orange (the Netherlands, Soviet trim, skin), blue (sky, grass with yellow), navy (key line).
 * Scenes read only their local t; figures pose on twos, cameras on ones; all randomness is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,linear,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,laneArrow,crescent} from '../../paths/riso/shapes';
import {drawAthlete,motionSmear,makeCamera,posed,blendPose,clampPose,runCycle,dribble,stand,strike,header,backpedal,celebrate,keeperSet,keeperDive,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type Camera,type Place,type V3,type DrawResult} from './athlete';

const K='navy',R='orange',Y='yellow',G='blue',B='blue';
const D2R=Math.PI/180;
/** Frame the FULL sheet: world (dx,dy) lands on the sheet centre at `zoom`, ignoring the safe box (the card window is small). */
function frame(s:Sheet,zoom=1,dx=0,dy=0){const S=zoom*s.arrival;s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,zoom/s.fit,0);}

// ================= narration (script.json mirrors it) =================
/** Provisional cue onsets (≈2.6 words/s plus pauses) — replaced by the measured Kokoro onsets in timing.json. */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/2.6+(/[.!?]$/.test(w)?.4:/[,;:]$/.test(w)?.18:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`gullit film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
import timingJson from '../../../public/plays/narration/gullit-final-1988/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Munich, 1988','Munich, 1988, the Euro final: the Netherlands, in orange, against the Soviet Union, in white. The ball is crossed in, Marco van Basten heads it back across, and captain Ruud Gullit heads it in!',
  ['Munich','the Euro final','the Netherlands','in orange','against the Soviet Union','in white','The ball is crossed in','Marco van Basten','heads it back across','captain Ruud Gullit','heads it in']),
 prov('Unmarked','Watch again, slowly. Nobody is marking Gullit. He jumps early, keeps his eyes open, and heads it past Dasayev.',
  ['Watch again','slowly','Nobody is marking Gullit','He jumps early','keeps his eyes open','and heads it','past Dasayev']),
 prov('Champions','One-nil! Gullit runs to celebrate, and the Netherlands went on to win two-nil and become champions of Europe!',
  ['One-nil','Gullit runs to celebrate','win two-nil','champions of Europe']),
 prov('Your turn','Your turn: jump early, keep your eyes open, and head the ball down towards the goal.',
  ['Your turn','jump early','keep your eyes open','head the ball down','towards the goal']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`gullit film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
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

// ================= Munich Olympiastadion, a June afternoon: an open bowl with the translucent tent canopy over the main stand, boards =================
const CX=-52.5,NS=56;
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(60+d)*Math.sign(c)*Math.pow(Math.abs(c),.5),y,(42+d)*Math.sign(s)*Math.pow(Math.abs(s),.5)];}
const LOW=(b:number):[number,number]=>[1+30*b,1.2+19*b];
type Bowl={low:V3[][];roof:V3[][];fascia:V3[][];lamps:V3[];seats:{P:V3;h:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],roof:[],fascia:[],lamps:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(d0:number,y0:number,d1:number,y1:number):V3[]=>[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];
  const[l0,h0]=LOW(0),[l1,h1]=LOW(1);o.low.push(Q(l0,h0,l1,h1));
  if(Math.sin(a)<-.35){o.roof.push(Q(12,26,46,33));o.fascia.push(Q(12,25,12,26.2));}
  for(let r=0;r<11;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7,31);if(h<.08)continue;const[d,y]=LOW((r+.5)/11);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 return o;})();
type Crowd={t:number;cheer?:number;flash?:number};
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{t,cheer=0,flash=0}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5,inV=(p:Pt,m=0)=>Math.abs(p[0])<Bnd+m&&Math.abs(p[1])<Bnd+m;
 // 4 pm on a June afternoon in Munich: a bright blue sky
 s.field(B,.5,.6);
 const hz=P(c,add(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))[1];
 s.tone(Y,polyPath([[-Bnd,hz-360],[Bnd,hz-400],[Bnd,hz+40],[-Bnd,hz+40]],true),.5);s.tone(R,polyPath([[-Bnd,hz-160],[Bnd,hz-190],[Bnd,hz+40],[-Bnd,hz+40]],true),.15);
 const low=new Path2D(),roof=new Path2D(),fas=new Path2D();
 for(let i=0;i<NS;i++){const ad=(q:V3[]|undefined,p:Path2D)=>{if(!q)return;const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};ad(BOWL.low[i],low);}
 for(let i=0;i<BOWL.roof.length;i++){const ad=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};ad(BOWL.roof[i],roof);ad(BOWL.fascia[i],fas);}
 s.knockout(low);s.tone(B,low,.3);s.tone(K,low,.3);
 // the crowd: the Dutch orange, Soviet red and white
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];let any=0;
 for(const q of BOWL.seats){const d=depthOf(c,q.P);if(d<16)continue;const p=P(c,q.P);if(!inV(p))continue;const z=clamp(c.F*.5/d,2,12),lift=cheer>0?cheer*z*1.2*Math.max(0,Math.sin(tt*11+q.h*TAU)):0;
  inks[q.h<.34?0:q.h<.6?1:q.h<.8?2:3].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);any++;}
 if(any){s.knockout(inks[0],.75);s.fill(B,inks[1],.7);s.fill(Y,inks[2],.9);s.fill(R,inks[3],.8);}
 // the white roof ring: a paper membrane with a light blue shade underneath and a navy edge
 s.knockout(roof,.55);s.tone(B,roof,.1);s.stroke(K,roof,2,.5);
 s.knockout(fas);s.fill(K,fas,.6);
 if(flash>0){const fp=new Path2D(),r=rng(900+Math.floor(tt*12));let n=0;for(let i=0;i<Math.round(20*flash);i++){const q=BOWL.seats[Math.floor(r()*BOWL.seats.length)];const d=depthOf(c,q.P);if(d<16)continue;const[x,y]=P(c,q.P),sz=clamp(c.F*1/d,8,22);fp.addPath(polyPath([[x,y-sz],[x+sz*.3,y],[x,y+sz],[x-sz*.3,y]],true));fp.addPath(polyPath([[x-sz,y],[x,y-sz*.3],[x+sz,y],[x,y+sz*.3]],true));n++;}if(n)s.fill(Y,fp,.95);}
 void BOWL.lamps;
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
/** the pitch: afternoon grass (yellow × blue = green), mowing stripes, paper lines, the goals */
function ground(s:Sheet,c:Camera,o:{net?:(p:V3)=>V3}={}){
 const apron=new Path2D();addPoly(apron,clipPoly(c,Array.from({length:NS},(_,i)=>rim(i/NS*TAU,-.6,0))));s.knockout(apron);s.fill(Y,apron,.7);s.tone(B,apron,.5);s.tone(K,apron,.2);
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

// ================= kits (25 June 1988) and the figure adapter =================
const SKIN:AthleteStyle['skin']=[[R,.2],[Y,.45]];
const SKIN_D:AthleteStyle['skin']=[[R,.72],[K,.36]];
/** Netherlands: all orange (confirmed); paper numbers (inferred) */
const NED=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:R,socks:R,trim:'paper',boots:K,skin:SKIN,hair:K,hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',numberInk:'paper',number:null,...o});
/** Soviet Union: all white with red stripes (confirmed; the red printed in orange) */
const URS=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',trim:R,boots:K,skin:SKIN,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:R,number:null,...o});
const GULLIT:AthleteStyle=NED({number:10,skin:SKIN_D,hair:K,hairStyle:'long',build:{height:1.91,bulk:1.05},seed:10});
const VANBASTEN:AthleteStyle=NED({number:12,hair:[K,.6],build:{height:1.88},seed:12});
const EKOEMAN:AthleteStyle=NED({number:13,hair:[Y,.7],build:{height:1.78},seed:13});
const DASAYEV:AthleteStyle={shirt:[K,.85],shorts:[K,.92],socks:[K,.85],trim:'paper',boots:K,skin:SKIN,hair:K,hairStyle:'short',line:K,sleeves:'long',shade:[K,.26],number:1,numberInk:'paper',gloves:'paper',build:{height:1.89},seed:1};
const REF:AthleteStyle={shirt:[K,.92],shorts:[K,.92],socks:[K,.92],trim:'paper',boots:K,skin:SKIN,hair:[K,.6],hairStyle:'balding',line:K,sleeves:'short',seed:33};
/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, continuous-silhouette body). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:AthleteStyle,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean}={}):DrawResult{
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,style,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,style,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 Sneijder's header) =================
type TK=[number,number,number];
type Role='hero'|'ned'|'urs'|'gk'|'ref';
type Actor={name:string;role:Role;style:AthleteStyle;keys:TK[];key?:boolean};
const GRAV=9.81,CR=-1.9,VBH=-.55,HDR=0,CFL=VBH-CR,FFL=HDR-VBH,HFL=.32,IN_NET=HDR+HFL;
const CRP:V3=[-15,.11,-22],VBP:V3=[-5.2,2.45,4.6],HP:V3=[-7,2.15,.2],GL:V3=[0,1.85,-1.9];
/** Erwin Koeman's ball in from the left, left foot: an out-swinger (bows toward goal first, bends away) */
const CD:[number,number]=[VBP[0]-CRP[0],VBP[2]-CRP[2]],CDL=Math.hypot(CD[0],CD[1]),CRIGHT:[number,number]=[-CD[1]/CDL,CD[0]/CDL],BEND=1.5;
function standAt(b:V3,f:[number,number],ahead=.44,foot:'l'|'r'='r'):[number,number]{const l=Math.hypot(f[0],f[1]),fx=f[0]/l,fz=f[1]/l,rx=-fz,rz=fx,sd=foot==='r'?.1:-.1;return[b[0]-fx*ahead-rx*sd,b[2]-fz*ahead-rz*sd];}
const under=(b:V3,f:[number,number],back=.12):[number,number]=>{const l=Math.hypot(f[0],f[1]);return[b[0]-f[0]/l*back,b[2]-f[1]/l*back];};
const HDIR:[number,number]=[GL[0]-HP[0],GL[2]-HP[2]],KDIR:[number,number]=[HP[0]-VBP[0],HP[2]-VBP[2]];
const E_CR=standAt(CRP,CD,.44,'l'),S_HP=under(HP,HDIR),V_HP=under(VBP,KDIR);
const ACTORS:Actor[]=[
 {name:'Gullit',role:'hero',style:GULLIT,key:true,keys:[[-5,-14.5,-4.4],[-3.4,-12.6,-3],[-1.8,-10.2,-1.5],[-.7,-8.2,-.4],[HDR,S_HP[0],S_HP[1]],[.6,-6.6,.8],[1.6,-7.8,4.2],[3,-9.4,10],[4.5,-10.6,16],[6.2,-11.6,22],[10,-12,25]]},
 {name:'Van Basten',role:'ned',style:VANBASTEN,key:true,keys:[[-5,-10.5,7.5],[-3,-8.4,6.8],[-1.5,-6.4,5.6],[VBH,V_HP[0],V_HP[1]],[.6,-4.9,4.2],[2.2,-7.2,8.4],[10,-10,17]]},
 {name:'Erwin Koeman',role:'ned',style:EKOEMAN,key:true,keys:[[-5,-19.5,-26],[-3,-17.6,-23.8],[CR,E_CR[0],E_CR[1]],[0,-14.2,-20.6],[10,-13.5,-18]]},
 {name:'Dasayev',role:'gk',style:DASAYEV,key:true,keys:[[-5,-1.2,-1],[CR,-1.3,-1.6],[VBH,-1.4,2.3],[-.2,-1.45,1.7],[HDR,-1.45,1.4],[10,-1.45,1.4]]},
 {name:'Van Basten marker',role:'urs',style:URS({seed:44}),key:true,keys:[[-5,-9.5,6.6],[-2,-6.8,5.8],[VBH,-4.4,5.6],[1,-4.4,5],[10,-4.4,5]]},
 {name:'Six-yard man',role:'urs',style:URS({seed:43,build:{height:1.86}}),keys:[[-5,-6,-2],[VBH,-5.4,-1],[HDR,-4.6,-2.4],[10,-4.6,-2.4]]},
 {name:'Slow to cover',role:'urs',style:URS({seed:45}),key:true,keys:[[-5,-12,1],[-2,-10.4,2.2],[HDR,-9.8,3],[1,-8.8,2],[10,-8.8,2]]},
 {name:'Edge defender',role:'urs',style:URS({seed:46}),keys:[[-5,-15,-10],[HDR,-12.5,-6],[10,-11,-5]]},
 {name:'Far defender',role:'urs',style:URS({seed:47}),keys:[[-5,-7,10],[HDR,-5.6,8.6],[10,-5.4,8]]},
 {name:'Deep defender',role:'urs',style:URS({seed:48}),keys:[[-5,-18,4],[HDR,-15,3],[10,-14,2]]},
 {name:'Dutch edge',role:'ned',style:NED({seed:49}),keys:[[-5,-19,0],[HDR,-17,-1],[10,-16,-2]]},
 {name:'Dutch left',role:'ned',style:NED({seed:50}),keys:[[-5,-13,-12],[HDR,-11,-9],[10,-10,-8]]},
 {name:'Referee',role:'ref',style:REF,keys:[[-5,-22,-6],[HDR,-20,-4],[10,-18,-2]]},
];
const HERO=0,VBI=1,EKI=2,GKI=3;
function herm(keys:TK[],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:1|2)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
const TA=-5,TB=10,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(TB-TA)/DT;i++){const[x,z]=herm(a.keys,TA+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-TA)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.1),b=posOf(k,tau+.1);return[(b[0]-a[0])/.2,(b[1]-a[1])/.2];};

// ---- the ball ----
function arc(a:V3,b:V3,D:number,s:number):V3{const u=s/D,vy=(b[1]-a[1]+.5*GRAV*D*D)/D;return[lerp(a[0],b[0],u),a[1]+vy*s-.5*GRAV*s*s,lerp(a[2],b[2],u)];}
function crossAt(s:number):V3{const p=arc(CRP,VBP,CFL,s),u=s/CFL,off=-BEND*4*u*(1-u);return[p[0]+CRIGHT[0]*off,p[1],p[2]+CRIGHT[1]*off];}
const V_END:V3=(()=>{const a=arc(HP,GL,HFL,HFL-.02),b=arc(HP,GL,HFL,HFL);return[(b[0]-a[0])/.02,(b[1]-a[1])/.02,(b[2]-a[2])/.02];})();
const REST:V3=[1.4,.11,-1.6],NET_HIT:V3=[2,1.4,-1.8];
function ballAt(tau:number):V3{
 if(tau<CR)return CRP;
 if(tau<VBH)return crossAt(tau-CR);
 if(tau<HDR)return arc(VBP,HP,FFL,tau-VBH);
 if(tau<IN_NET)return arc(HP,GL,HFL,tau-HDR);
 const s=tau-IN_NET;if(s<.1)return[GL[0]+V_END[0]*s,GL[1]+V_END[1]*s,GL[2]+V_END[2]*s];
 const a:V3=[GL[0]+V_END[0]*.1,GL[1]+V_END[1]*.1,GL[2]+V_END[2]*.1];
 if(s<.5){const u=(s-.1)/.4;return[lerp(a[0],REST[0],u),lerp(a[1],.11,u*u),lerp(a[2],REST[2],u)];}
 const u=clamp((s-.5)/.6);return[REST[0],.11+.2*Math.sin(u*Math.PI)*(1-u),REST[2]];
}

// ---- poses ----
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
const LIN=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as(keyof Pose)[]){const v=LIN.has(k)?d[k]!:d[k]!*D2R;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
function strikeOver(p:Pose,tau:number,contact:number,D:number,power:number,foot:'l'|'r'){const u=(tau-(contact-STRIKE_CONTACT*D))/D;
 if(u>-.1&&u<1.5)p=blendPose(p,strike(clamp(u),{foot,power}),Math.min(sm(-.1,.12,u),1-sm(1.05,1.5,u)));return p;}
/** a header timed so the neck snap (header() contact .52) lands at `contact` */
function headerOver(p:Pose,tau:number,contact:number,D:number,extra?:Partial<Pose>){const u=(tau-(contact-.52*D))/D;
 if(u>-.1&&u<1.4){p=blendPose(p,header(clamp(u)),Math.min(sm(-.1,.1,u),1-sm(1,1.4,u)));if(extra)p=over(p,extra,bump(.35,.75,u));}return p;}
/** Van Basten's header back across: turned in, head snapping round to his left */
const BACK:Partial<Pose>={neckY:40,twist:24,neckP:30};
/** Gullit: an early, strong jump, eyes open, driving through the ball */
const DRIVE:Partial<Pose>={neckP:40,lean:30,air:.46};
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.45?YAW(v[0],v[1]):YAW(b[0]-x,b[2]-z);
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='urs'?READY:stand();
 const s=clamp((sp-2)/5);let p:Pose=blendPose(idle,runCycle(distOf(k,tau)/(2.3+2*s),{speed:s}),clamp((sp-.4)/.8));
 if(k===HERO){
  if(tau>-1&&tau<.5)yaw=lerpAng(yaw,YAW(HDIR[0],HDIR[1]),Math.min(sm(-1,-.5,tau),1-sm(.3,.5,tau)));
  p=headerOver(p,tau,HDR,1,DRIVE);
  if(tau>1){p=blendPose(p,celebrate((tau-1)*.8,{kind:'run'}),sm(1,1.4,tau));}
  if(tau>6.4){p=blendPose(p,celebrate((tau-6.4)*.9,{kind:'arms'}),sm(6.4,6.8,tau));}
  return{p,yaw};}
 if(k===VBI){if(tau>VBH-.8&&tau<VBH+.4)yaw=lerpAng(yaw,YAW(-CD[0],-CD[1]),Math.min(sm(VBH-.8,VBH-.4,tau),1-sm(VBH+.2,VBH+.4,tau)));p=headerOver(p,tau,VBH,1,BACK);return{p,yaw};}
 if(k===EKI){if(tau>CR-.6&&tau<CR+.5)yaw=YAW(CD[0],CD[1]);p=strikeOver(p,tau,CR,1,.8,'l');return{p,yaw};}
 if(a.role==='gk'){yaw=YAW(b[0]-x,b[2]-z);p=idle;
  if(tau>HDR+.04)p=keeperDive(clamp((tau-HDR-.04)/.9),{side:'r',height:.75});
  return{p,yaw};}
 if(k===4&&tau>VBH-.6&&tau<VBH+.3)p=headerOver(p,tau,VBH+.05,1);// Van Basten's marker jumps too late
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
const crossArc=(n=20):V3[]=>Array.from({length:n+1},(_,i)=>crossAt(CFL*i/n));
const backArc=(n=10):V3[]=>Array.from({length:n+1},(_,i)=>arc(VBP,HP,FFL,FFL*i/n));
const headArc=(n=8):V3[]=>Array.from({length:n+1},(_,i)=>arc(HP,GL,HFL,HFL*i/n));
/** "eyes open": two small yellow sight lines from his face to the ball */
/** a yellow arrow that shows on grass: paper knocked out under it first (yellow alone would vanish into the yellow × blue grass) */
function arrowK(s:Sheet,a:Pt,b:Pt,w:number,o:{progress:number;seed:number;head:number;dashed?:boolean;fade?:number}){const fd=o.fade??1;if(o.progress<=.02||fd<=.02)return;const e:Pt=[lerp(a[0],b[0],o.progress),lerp(a[1],b[1],o.progress)];
 s.knockout(ribbon([a,e],w*1.9,{seed:o.seed,taper:.1,wobble:.8}),.85*fd);const dx=e[0]-a[0],dy=e[1]-a[1],L=Math.hypot(dx,dy)||1;s.knockout(polyPath(Array.from({length:10},(_,i)=>[e[0]-dx/L*o.head*.5+Math.cos(i/10*TAU)*o.head*.75,e[1]-dy/L*o.head*.5+Math.sin(i/10*TAU)*o.head*.75] as Pt),true),.6*fd);
 laneArrow(s,Y,a,b,w,{progress:o.progress,seed:o.seed,head:o.head,dashed:o.dashed,cov:.95*fd});}
function sightLine(s:Sheet,c:Camera,face:Pt,b:V3,w:number,seed:number){if(w<=.02||depthOf(c,b)<NEAR)return;const q=P(c,b);arrowK(s,face,[lerp(face[0],q[0],.85),lerp(face[1],q[1],.85)],16,{progress:w,seed,head:44,dashed:true});}

// ================= chapter 1 (live): the high main-stand camera; the ball in, Van Basten back across, Gullit's header, the net =================
const tau1=(t:number)=>{const E=SEC(0),nl=T(0,'the Netherlands'),bc=T(0,'The ball is crossed in'),vb=T(0,'Marco van Basten'),hb=T(0,'heads it back across'),rg=T(0,'captain Ruud Gullit'),hi=T(0,'heads it in');
 return key(t,mono([[0,-5],[nl,-4.4],[bc-.2,CR-.3],[bc+.9,CR+.6],[vb+.2,VBH-.1],[hb+.3,VBH+.25],[rg+.2,-.15],[hi+.1,HDR+.02],[hi+.8,IN_NET+.3],[E+1,IN_NET+.3+(E+.2-hi)]]),linear);};
const CAM1:V3=[-26,20,-58];
function look1(tau:number):V3{
 if(tau<CR)return mix3([-14,1,-8],[-12,1,-12],sm(-5,CR,tau));
 if(tau<VBH)return mix3([-12,1,-12],[-5,1.5,2.5],sm(CR,VBH,tau,easeInOutSine));
 if(tau<IN_NET+.3)return mix3([-5,1.5,2.5],[-3.6,1.4,-.4],sm(VBH,HDR,tau));
 const[x,z]=posOf(HERO,tau);return mix3([-3.6,1.4,-.4],[x,1,z],sm(IN_NET+.3,IN_NET+2,tau));}
function cam1(t:number){const tau=tau1(t),a=look1(tau),b=look1(tau-.3),c=look1(tau-.6),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const F=key(tau,[[-5,2900],[CR,3200],[VBH,3600],[HDR,3900],[IN_NET+.5,3700],[IN_NET+2.5,3500]]);return cam(CAM1,look,F);}
const ch1:Scene={
 draw(s,t){const tt=twos(t),c=cam1(t),tau=tau1(t),tp=tau1(tt),goalIn=tau-IN_NET;frame(s);
  stadium(s,c,{t,cheer:.12+.9*sm(0,.5,goalIn),flash:.1+1*sm(0,.4,goalIn)});
  ground(s,c,{net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  drawWorld(s,c,tau,tp,{ballMin:9});},
 aperture(t){const c=cam1(t),p=ballAt(tau1(t)),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(9,BALL_R*kAt(c,p))*1.1,12);},
 still:12,
};

// ================= chapter 2 (TV replay, slow motion, high behind the goal): nobody marking him, an early jump, eyes open, past Dasayev =================
const tau2=(t:number)=>{const E=SEC(1),nm=T(1,'Nobody is marking Gullit'),je=T(1,'He jumps early'),eo=T(1,'keeps his eyes open'),ah=T(1,'and heads it'),pd=T(1,'past Dasayev');
 return key(t,mono([[0,VBH-.5],[nm,VBH+.05],[je,-.42],[eo,-.2],[ah+.2,HDR+.01],[pd+.3,IN_NET],[E,IN_NET+.5]]),linear);};
function cam2(t:number){const E=SEC(1),push=sm(0,E,t,easeInOutSine),f2=sm(T(1,'and heads it')-.3,T(1,'past Dasayev')+.4,t,easeInOutSine);
 const look=mix3([-6.2,1.4,1.6],[-3.6,1.5,-.8],f2);
 return cam([15-2.5*push,9.5-2*push,.5],look,lerp(1900,2300,push));}
const ch2:Scene={
 draw(s,t){const tt=twos(t),c=cam2(t),tau=tau2(t),tp=tau2(tt),E=SEC(1),nm=T(1,'Nobody is marking Gullit'),je=T(1,'He jumps early'),eo=T(1,'keeps his eyes open'),ah=T(1,'and heads it'),pd=T(1,'past Dasayev'),goalIn=tau-IN_NET;frame(s);
  stadium(s,c,{t,cheer:.1+.8*sm(0,.4,goalIn)});
  ground(s,c,{net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  trail3(s,c,backArc(),.07,K,{progress:clamp((tau-VBH)/FFL),cov:.75*(1-sm(E-.8,E-.3,t)),dashed:true,head:false,seed:21});
  // "nobody is marking Gullit": a big yellow ring of free grass round him
  const[hx,hz]=posOf(HERO,Math.min(tau,HDR));groundRing(s,c,hx,hz,2.2+.15*Math.sin(t*5),.07,Y,sm(nm-.2,nm+.3,t)*(1-sm(je+.4,je+.8,t)),23);
  // "jumps early": his take-off spot flashes orange
  groundRing(s,c,hx,hz,.55,.06,R,bump(je-.1,je+.9,t),25);
  trail3(s,c,headArc(),.08,Y,{progress:sm(ah-.1,ah+.4,t,easeOut),cov:.95*(1-sm(E-.6,E-.2,t)),seed:27});
  const w=drawWorld(s,c,tau,tp,{ballMin:8,hero:true,glow:sm(eo-.1,eo+.3,t)*(1-sm(ah,ah+.4,t))});
  const q=w.res.get(HERO);if(q)sightLine(s,c,q.joints.face,ballAt(tau),sm(eo-.1,eo+.3,t)*(1-sm(ah+.1,ah+.4,t)),29);
  const gk=w.res.get(GKI),ag=t-pd;if(gk&&ag>-.1&&ag<.7){const h=gk.joints.rHa;sparkBurst(s,Y,h[0],h[1],kAt(c,[-1.4,1.5,1])*.5,{n:8,seed:31,g:easeOutBack(clamp((ag+.1)/.2))*(1-clamp((ag-.45)/.25)),width:9});}
  if(t<.5)speedLines(s,K,0,0,0,{n:12,seed:33,len:900,spread:520,width:22,cov:.5*(1-t/.5)});
 },
 aperture(t){const c=cam2(t),p=ballAt(tau2(t)),[x,y]=P(c,p),r=Math.max(9,BALL_R*kAt(c,p));return apertureDisc(x,y,r*1.1,12);},
 still:6,
};

// ================= chapter 3 (low camera by the right corner flag): he runs to celebrate; two–nil; champions of Europe =================
const tau3=(t:number)=>{const E=SEC(2),on=T(2,'One-nil'),gr=T(2,'Gullit runs to celebrate'),tw=T(2,'win two-nil');
 return key(t,mono([[0,IN_NET-.1],[on+.3,IN_NET+.5],[gr,1.3],[tw,4.8],[E,7.4]]),linear);};
function cam3(t:number){const tau=tau3(t),E=SEC(2),[x,z]=posOf(HERO,tau),b=ballAt(tau),fol=sm(T(2,'One-nil'),T(2,'Gullit runs to celebrate')+.6,t,easeInOutSine);
 const look=mix3([lerp(b[0],-3,.3),1.3,lerp(b[2],0,.3)],[x,1.2,z],fol);
 return cam([-1.5-3*sm(0,E,t),1.5,36.5],look,key(t,mono([[0,1300],[T(2,'Gullit runs to celebrate'),1500],[T(2,'win two-nil'),2100],[E,2400]])));}
const ch3:Scene={
 draw(s,t){const tt=twos(t),c=cam3(t),tau=tau3(t),tp=tau3(tt),on=T(2,'One-nil'),gr=T(2,'Gullit runs to celebrate'),tw=T(2,'win two-nil'),ce=T(2,'champions of Europe'),E=SEC(2),goalIn=tau-IN_NET;frame(s);
  stadium(s,c,{t,cheer:.3+.8*sm(0,.5,goalIn),flash:.3+1.2*sm(tw-.2,tw+.3,t)});
  ground(s,c,{net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  trail3(s,c,onGround(pathOf(HERO,1,6.4)),.16,R,{progress:sm(gr-.1,gr+1,t,easeOut),cov:.9*(1-sm(E-.9,E-.4,t)),seed:41});
  const w=drawWorld(s,c,tau,tp,{ballMin:8,hero:true});
  const q=w.res.get(HERO);if(q){const h=q.joints.head,ag=t-ce;if(ag>-.1&&ag<1.2)sparkBurst(s,Y,h[0],h[1]-50,kAt(c,[-11,1,20])*1.2,{n:12,seed:43,g:easeOutBack(clamp((ag+.1)/.3))*(1-clamp((ag-.8)/.4)),width:12});
   const a2=t-on;if(a2>-.1&&a2<.8)sparkBurst(s,R,h[0],h[1]-30,kAt(c,[-8,1,4])*.8,{n:8,seed:45,g:easeOutBack(clamp((a2+.1)/.2))*(1-clamp((a2-.5)/.3)),width:10});}
  if(t<.45)speedLines(s,K,0,0,Math.PI,{n:12,seed:47,len:900,spread:520,width:22,cov:.5*(1-t/.45)});
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(HERO,tau3(t)),p:V3=[x,1.3,z],[px,py]=P(c,p);return apertureDisc(px,py,Math.max(12,.22*kAt(c,p)),12);},
 still:4.5,
};

// ================= chapter 4 (the lesson, a side camera): jump early, eyes open, head it down towards the goal =================
const tau4=(t:number)=>{const E=SEC(3),je=T(3,'jump early'),ey=T(3,'keep your eyes open'),hd=T(3,'head the ball down'),tg=T(3,'towards the goal');
 return key(t,mono([[0,VBH-.3],[je,-.45],[ey,-.2],[hd+.2,HDR+.02],[tg,.2],[E,IN_NET+.4]]),linear);};
function cam4(t:number){const E=SEC(3),push=sm(0,E,t,easeInOutSine),look:V3=[-5.6,1.6,-.4];
 return cam([-9.5+1.5*push,2.1,-12+1.5*push],look,lerp(1350,1600,push));}
const ch4:Scene={
 draw(s,t){const tt=twos(t),c=cam4(t),tau=tau4(t),tp=tau4(tt),E=SEC(3),je=T(3,'jump early'),ey=T(3,'keep your eyes open'),hd=T(3,'head the ball down'),tg=T(3,'towards the goal');frame(s);
  stadium(s,c,{t,cheer:.08});
  ground(s,c);
  const[hx,hz]=posOf(HERO,Math.min(tau,HDR));groundRing(s,c,hx,hz,.55,.06,R,bump(je-.1,je+1,t),51);
  const w=drawWorld(s,c,tau,tp,{ballMin:10,hero:true,only:[HERO,VBI,GKI]});
  const q=w.res.get(HERO);if(q){sightLine(s,c,q.joints.face,ballAt(tau),sm(ey-.1,ey+.3,t)*(1-sm(hd,hd+.3,t)),53);
   // "head the ball down towards the goal": a yellow arrow from the forehead, angled down at the goal mouth
   const f=q.joints.face,g=P(c,[0,.6,-1.2]),dw=sm(hd-.1,hd+.4,t);arrowK(s,f,[lerp(f[0],g[0],.7),lerp(f[1],g[1],.7)],30,{progress:dw,seed:55,head:80,fade:1-sm(E-.4,E,t)});}
  void tg;
 },
 still:5,
};

const story:RisoStory={
 id:'gullit-final-1988',format:'11v11',title:'Gullit’s header, 1988',
 theme:'Jump early, keep your eyes open, and head the ball towards the goal.',
 ageNote:'UEFA Euro 1988 final, Soviet Union 0–2 Netherlands, Olympiastadion, Munich, 25 June 1988 (32nd minute). Gullit was 25 and captain.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',blue:'#0078bf',navy:'#22366b'},order:['yellow','orange','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: an orange ring and a ball headed away from the point. Reduced motion: the ring and ball, still. */
 touch(s,x,y,age,seed){
  const r=rng(seed),dir=r()<.5?-1:1,u=age<=0?0:clamp(age/.9),g=age<=0?1:easeOutBack(clamp(age/.25));
  s.stroke(R,polyPath(Array.from({length:20},(_,i)=>{const q=i/20*TAU;return[x+Math.cos(q)*90*g,y+Math.sin(q)*30*g] as Pt;}),true),10,.95);
  if(age>0&&age<.35)sparkBurst(s,Y,x,y-150,110*g,{n:8,seed,g:1-clamp(age/.35),width:10});
  ball(s,x+dir*u*200,y-150+u*60,50,age*9+hash(seed,3)*TAU);
 },
};
export default story;
