/** Iconic play film: Bastian Schweinsteiger gets there first, 2014 FIFA World Cup final, Germany 1–0 Argentina (after extra time), Maracanã
 * Stadium, Rio de Janeiro, 13 July 2014 — the 9th minute: Messi beats Hummels down Argentina's right, reaches the byline and pulls the ball
 * back for Lavezzi, and Schweinsteiger, racing back, intercepts and clears.
 * WHY THIS MOMENT: the card's Top Play is "The Warrior of the World Cup Final" (template interception_counter, lesson "stay goal-side, win the
 * ball back and keep going"). That title describes a whole performance, not one goal; this is the one specific, written-up play of his that
 * matches the lesson (a recovery run goal-side and an interception), so it is staged as the real play, and chapter 3 states the plain fact
 * that he played all 120 minutes of a final Germany won.
 * A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration: public/plays/narration/schweinsteiger-final-2014/script.json, voiced with local Kokoro (af_bella, 1.0); timing.json imported below.
 *
 * SOURCES (read Sept 2026 as raw pages; we cannot watch the footage):
 *  - Wikipedia, "2014 FIFA World Cup final" (raw wikitext: match summary citing The Guardian minute-by-minute and BBC; line-ups; kit boxes)
 *    https://en.wikipedia.org/wiki/2014_FIFA_World_Cup_final
 *  - The Guardian, Scott Murray, "World Cup final 2014: Germany v Argentina – as it happened" (13 July 2014)
 *    https://www.theguardian.com/football/2014/jul/13/world-cup-final-2014-germany-v-argentina-live-report
 * CONFIRMED by those accounts: 13 July 2014, Maracanã, Rio de Janeiro, 4 pm local, 23 °C, fair, 74,738; 9 min: "A brilliant turn of pace
 *  DOWN THE RIGHT by MESSI, who leaves HUMMELS … alone … He zips INTO THE BOX, reaches THE BYLINE, and attempts to find LAVEZZI with a PULLBACK.
 *  The ball's INTERCEPTED BY SCHWEINSTEIGER and hoicked CLEAR" (Guardian); "Schweinsteiger reached it first and cleared" (Wikipedia).
 *  Schweinsteiger started (No. 7, yellow card 29') and was not substituted: he played all 120 minutes; Götze scored in the 113th minute,
 *  1–0 after extra time, Germany world champions. KITS (Wikipedia kit boxes): Germany WHITE shirts with a RED V near the top, WHITE shorts,
 *  WHITE socks with red stripes at the top; Argentina DARK BLUE shirts with LIGHTER BLUE stripes at the bottom, BLUE shorts, BLUE socks.
 *  Numbers: Messi 10, Lavezzi 22, Higuaín 9, Hummels 5, Höwedes 4, Neuer 1, Schweinsteiger 7.
 * INFERRED / ILLUSTRATIVE: every position, run and timing in metres and seconds; Messi's LEFT foot for the pullback (his stronger foot; the
 *  accounts do not say); where Lavezzi and Higuaín were; Schweinsteiger's run starting ≈ 25 m out and his RIGHT-foot clearance out toward the
 *  touchline (the accounts say only "intercepted … and hoicked clear"); Neuer's position; the other players' places; Neuer's kit (drawn in
 *  a dark top), the referee's kit; the afternoon light and the Maracanã's white roof ring; the crowd colours; the ball (the final's Brazuca
 *  "Final Rio" was green, gold and black: drawn as a white ball with navy and yellow panels); the main camera side (Argentina attacking left →
 *  right on screen is NOT asserted: drawn with the goal Germany defend on the left, Messi on the far touchline); camera placements, lenses.
 *
 * STRUCTURE (a 1:1 recreation of the broadcast; never top-down): ONE simulation on τ (seconds; τ = 0 Schweinsteiger's clearance): ch1 = the
 * high main-stand camera in near real time (Messi past Hummels, into the box, the pullback, the interception); ch2 = the slow-motion replay
 * high behind the goal (his run back BETWEEN THE BALL AND HIS GOAL, reading the pass, first to it); ch3 = a low touchline camera (the ball
 * flies clear, he turns and runs on; the crowd, the World Cup won); ch4 = the lesson on a close side camera. Seams are forward passages.
 * World: right-handed metres, y up, the goal Germany defend is the line x = 0, +z = Argentina's RIGHT (athlete.ts: yaw 0 faces +x, right = +z).
 * Inks: yellow (sunlight, teaching marks), red (Germany's trim, skin), blue (sky, grass with yellow, Argentina's stripes), navy (key line,
 * Argentina's shirts). Scenes read only their local t; figures pose on twos, cameras on ones; all randomness is seeded. */
import {withTiming,type NarrationTiming} from './timing';
import type {Sheet} from '../../paths/riso/sheet';
import {type RisoStory,type Scene,type Chapter,playChapters} from '../../paths/riso/story';
import {apertureDisc} from '../../paths/riso/passage';
import {twos,sm,key,clamp,lerp,rng,hash,ribbon,polyPath,easeOut,easeOutBack,easeInOutSine,linear,TAU,type Pt,type Key} from '../../paths/riso/motion';
import {sparkBurst,speedLines,laneArrow,crescent} from '../../paths/riso/shapes';
import {beats,shotAt,reframe,near,steady,type Keep,type Pin,type View as DView} from './director';
import {drawAthlete,motionSmear,makeCamera,posed,blendPose,clampPose,runCycle,dribble,stand,strike,backpedal,celebrate,keeperSet,keeperDive,
 STRIKE_CONTACT,type Pose,type AthleteStyle,type Camera,type Place,type V3,type DrawResult} from './athlete';

const K='navy',R='red',Y='yellow',G='blue',B='blue';
const D2R=Math.PI/180;
/** the window in camera units (set by frame(); read by the director's reframing, aperture() included) */
let DV:DView={w:1566,h:1080};
/** Frame the FULL sheet: world (dx,dy) lands on the sheet centre at `zoom`, ignoring the safe box (the card window is small). */
function frame(s:Sheet,zoom=1,dx=0,dy=0){const S=zoom*s.arrival;DV={w:s.W,h:s.H};s.camera((s.cx-s.W/2)/S+dx,(s.cy-s.H/2)/S+dy,zoom/s.fit,0);}

// ================= narration (script.json mirrors it) =================
/** Provisional cue onsets (≈2.6 words/s plus pauses) — replaced by the measured Kokoro onsets in timing.json. */
function prov(label:string,text:string,cueWords:string[]):Chapter{
 const words=text.split(/\s+/),on:number[]=[];let t=.2;
 for(const w of words){on.push(t);t+=1/2.6+(/[.!?]$/.test(w)?.4:/[,;:]$/.test(w)?.18:0);}
 const nw=(w:string)=>w.toLowerCase().replace(/[^a-z0-9]/g,'');let from=0;
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`schweinsteiger film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
import timingJson from '../../../public/plays/narration/schweinsteiger-final-2014/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Rio, 2014','Rio de Janeiro, 2014, the World Cup final: Germany, in white, against Argentina, in dark blue. Messi races past Hummels, into the box, and pulls it back for Lavezzi... but Bastian Schweinsteiger gets there first and clears it!',
  ['Rio de Janeiro','the World Cup final','Germany','in white','against Argentina','in dark blue','Messi races past Hummels','into the box','pulls it back','for Lavezzi','Bastian Schweinsteiger','gets there first','clears it']),
 prov('Goal-side','Watch again, slowly. Schweinsteiger sprints back, between the ball and his goal. He reads the pass, and steps in first.',
  ['Watch again','slowly','Schweinsteiger sprints back','between the ball','and his goal','He reads the pass','steps in first']),
 prov('All 120 minutes','Then he keeps going. He ran for all one hundred and twenty minutes, and Germany won the World Cup!',
  ['Then he keeps going','He ran','one hundred and twenty minutes','Germany won','the World Cup']),
 prov('Your turn','Your turn: sprint back goal-side, get to the ball first, then keep going.',
  ['Your turn','sprint back goal-side','get to the ball first','then keep going']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`schweinsteiger film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
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

// ================= the Maracanã on a July afternoon: a rounded two-tier bowl under a white roof ring, blue sky, boards =================
const CX=-52.5,NS=56;
function rim(th:number,d:number,y:number):V3{const c=Math.cos(th),s=Math.sin(th);return[CX+(60+d)*Math.sign(c)*Math.pow(Math.abs(c),.5),y,(42+d)*Math.sign(s)*Math.pow(Math.abs(s),.5)];}
const LOW=(b:number):[number,number]=>[1+30*b,1.2+19*b];
type Bowl={low:V3[][];roof:V3[][];fascia:V3[][];lamps:V3[];seats:{P:V3;h:number}[]};
const BOWL:Bowl=(()=>{const o:Bowl={low:[],roof:[],fascia:[],lamps:[],seats:[]};
 for(let i=0;i<NS;i++){const a=i/NS*TAU,b=(i+1)/NS*TAU,Q=(d0:number,y0:number,d1:number,y1:number):V3[]=>[rim(a,d0,y0),rim(b,d0,y0),rim(b,d1,y1),rim(a,d1,y1)];
  const[l0,h0]=LOW(0),[l1,h1]=LOW(1);o.low.push(Q(l0,h0,l1,h1));
  o.roof.push(Q(14,27,48,31));o.fascia.push(Q(14,25.8,14,27.2));
  for(let r=0;r<11;r++)for(let k=0;k<3;k++){const h=hash(i*977+r*31+k*7,31);if(h<.08)continue;const[d,y]=LOW((r+.5)/11);o.seats.push({P:rim((i+(k+.5+(hash(i+r*13+k,4)-.5)*.5)/3)/NS*TAU,d,y+.4),h});}}
 return o;})();
type Crowd={t:number;cheer?:number;flash?:number};
function stadium(s:Sheet,c:Camera,o:Crowd){
 const{t,cheer=0,flash=0}=o,tt=twos(t),Bnd=Math.max(s.W,s.H)*1.5,inV=(p:Pt,m=0)=>Math.abs(p[0])<Bnd+m&&Math.abs(p[1])<Bnd+m;
 // 4 pm in a Rio winter: a clear blue sky, paler and warmer low down
 s.field(B,.5,.6);
 const hz=P(c,add(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))[1];
 s.tone(Y,polyPath([[-Bnd,hz-300],[Bnd,hz-340],[Bnd,hz+40],[-Bnd,hz+40]],true),.3);
 const low=new Path2D(),roof=new Path2D(),fas=new Path2D();
 for(let i=0;i<NS;i++){const ad=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};ad(BOWL.low[i],low);ad(BOWL.roof[i],roof);ad(BOWL.fascia[i],fas);}
 s.knockout(low);s.tone(B,low,.3);s.tone(K,low,.3);
 // the crowd: Argentina sky blue and white, Germany white and red, Brazil yellow, dark shirts
 const inks=[new Path2D(),new Path2D(),new Path2D(),new Path2D()];let any=0;
 for(const q of BOWL.seats){const d=depthOf(c,q.P);if(d<16)continue;const p=P(c,q.P);if(!inV(p))continue;const z=clamp(c.F*.5/d,2,12),lift=cheer>0?cheer*z*1.2*Math.max(0,Math.sin(tt*11+q.h*TAU)):0;
  inks[q.h<.34?0:q.h<.6?1:q.h<.8?2:3].rect(p[0]-z/2,p[1]-z*.7-lift,z,z*1.3);any++;}
 if(any){s.knockout(inks[0],.75);s.fill(B,inks[1],.7);s.fill(Y,inks[2],.9);s.fill(R,inks[3],.8);}
 // the white roof ring: a paper membrane with a light blue shade underneath and a navy edge
 s.knockout(roof);s.tone(B,roof,.15);s.tone(K,roof,.12);
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

// ================= kits (13 July 2014) and the figure adapter =================
const SKIN:AthleteStyle['skin']=[[R,.2],[Y,.45]];
/** Germany: white shirts with a red V, white shorts, white socks (confirmed); navy numbers (inferred) */
const GER=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:'paper',shorts:'paper',socks:'paper',trim:R,boots:K,skin:SKIN,hair:K,hairStyle:'short',line:K,shade:[K,.26],sleeves:'short',numberInk:[K,.9],...o});
/** Argentina: dark blue shirts, blue shorts, blue socks (confirmed); lighter blue trim and paper numbers (inferred) */
const ARG=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:K,shorts:B,socks:B,trim:B,boots:K,skin:SKIN,hair:K,hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',numberInk:'paper',...o});
const SCHWEINI:AthleteStyle=GER({number:7,hair:[Y,.85],build:{height:1.83,bulk:1.02},seed:7});
const MESSI:AthleteStyle=ARG({number:10,hair:[K,.8],build:{height:1.7,bulk:.96},seed:10});
const NEUER:AthleteStyle={shirt:[K,.7],shorts:[K,.9],socks:[K,.8],trim:Y,boots:K,skin:SKIN,hair:[Y,.8],hairStyle:'short',line:K,sleeves:'long',shade:[K,.26],number:1,numberInk:'paper',gloves:'paper',build:{height:1.93},seed:1};
const REF:AthleteStyle={shirt:[Y,.9],shorts:[K,.92],socks:[K,.92],trim:K,boots:K,skin:SKIN,hair:[K,.6],hairStyle:'bald',line:K,sleeves:'short',seed:33};
/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, continuous-silhouette body). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:AthleteStyle,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean}={}):DrawResult{
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,style,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,style,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 Schweinsteiger's clearance) =================
type TK=[number,number,number];
type Role='hero'|'ger'|'arg'|'gk'|'ref';
type Actor={name:string;role:Role;style:AthleteStyle;keys:TK[];key?:boolean};
const GRAV=9.81,PB=-.62,CLR=0,FLY=1.7,LANDT=CLR+FLY;
const BY:V3=[-1.1,.11,9.3],IP:V3=[-5.5,.11,4.9],LAND:V3=[-8,.11,31.5],OUT:V3=[-8.9,.11,36.5],LAV:[number,number]=[-8.8,1.6];
/** where a player stands so his right (or left) boot meets a ball at b while facing f */
function standAt(b:V3,f:[number,number],ahead=.44,foot:'l'|'r'='r'):[number,number]{const l=Math.hypot(f[0],f[1]),fx=f[0]/l,fz=f[1]/l,rx=-fz,rz=fx,sd=foot==='r'?.1:-.1;return[b[0]-fx*ahead-rx*sd,b[2]-fz*ahead-rz*sd];}
const PASSDIR:[number,number]=[IP[0]-BY[0],IP[2]-BY[2]],FACE_CLR:[number,number]=[1,.9];
const M_BY=standAt(BY,PASSDIR,.44,'l'),S_IP=standAt(IP,FACE_CLR,.5);
const ACTORS:Actor[]=[
 {name:'Schweinsteiger',role:'hero',style:SCHWEINI,key:true,keys:[[-6,-37,5],[-4.5,-30,5.4],[-3,-21.5,6],[-1.8,-14,5.9],[-.9,-9,5.2],[-.3,S_IP[0]-.9,S_IP[1]-.6],[CLR,S_IP[0],S_IP[1]],[.6,-5.6,4.4],[1.3,-7.2,5.2],[2.4,-11.5,7.2],[3.8,-17.5,9.6],[5.4,-24.5,11.5],[7.4,-33,13],[10,-43,14]]},
 {name:'Messi',role:'arg',style:MESSI,key:true,keys:[[-6,-35,22.5],[-5,-30.5,21],[-3.8,-22.8,17.6],[-2.6,-14.5,15.2],[-1.6,-8,12.8],[-1.05,-3.8,10.8],[PB,M_BY[0],M_BY[1]],[0,-1.9,9.8],[1.2,-2.6,10.4],[10,-3,10.6]]},
 {name:'Hummels',role:'ger',style:GER({number:5,seed:5,hair:[K,.85]}),key:true,keys:[[-6,-24.5,15.2],[-4.4,-23.2,16.5],[-3.8,-22.4,17],[-3.2,-21,16.9],[-2.2,-16.5,15.4],[-1.1,-10.5,13],[0,-6.6,11.2],[2,-4.6,10.4],[10,-4.4,10.2]]},
 {name:'Lavezzi',role:'arg',style:ARG({number:22,seed:22,hair:[K,.7]}),key:true,keys:[[-6,-25,-4],[-3,-17.5,-2],[-1.2,-11.5,.4],[CLR,LAV[0],LAV[1]],[1,-8.2,2],[10,-8,2.2]]},
 {name:'Neuer',role:'gk',style:NEUER,key:true,keys:[[-6,-3,1.5],[-1.5,-1.4,2.8],[-.6,-1.2,3.3],[0,-1.5,3.6],[10,-1.5,3.6]]},
 {name:'Higuaín',role:'arg',style:ARG({number:9,seed:9}),keys:[[-6,-21,-10],[-2,-12.5,-7],[0,-8,-5],[10,-7.5,-5]]},
 {name:'Höwedes',role:'ger',style:GER({number:4,seed:4}),keys:[[-6,-15,22],[-2,-8.5,17],[0,-5,13.8],[10,-4.6,13.2]]},
 {name:'Boateng',role:'ger',style:GER({number:20,seed:20}),keys:[[-6,-13,1.5],[-2,-8.6,-.2],[0,-6.8,-1.2],[10,-6.5,-1.2]]},
 {name:'Lahm',role:'ger',style:GER({number:16,seed:16}),keys:[[-6,-17,-18],[0,-10.5,-12],[10,-9.5,-10]]},
 {name:'Kroos',role:'ger',style:GER({number:18,seed:18}),keys:[[-6,-31,-5],[0,-22,-2.5],[10,-20,0]]},
 {name:'Pérez',role:'arg',style:ARG({number:19,seed:19}),keys:[[-6,-39,8],[0,-26,6],[10,-22,5]]},
 {name:'Zabaleta',role:'arg',style:ARG({number:4,seed:44}),keys:[[-6,-41,30],[0,-31,26],[10,-26,24]]},
 {name:'Referee',role:'ref',style:REF,keys:[[-6,-40,-2],[0,-28,1],[10,-22,4]]},
];
const HERO=0,MSI=1,HUM=2,LVI=3,GKI=4,BOA=7;
function herm(keys:TK[],t:number):[number,number]{const n=keys.length;if(t<=keys[0][0])return[keys[0][1],keys[0][2]];if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
 let i=0;while(t>keys[i+1][0])i++;const k0=keys[Math.max(0,i-1)],k1=keys[i],k2=keys[i+1],k3=keys[Math.min(n-1,i+2)],h=k2[0]-k1[0],u=(t-k1[0])/h,u2=u*u,u3=u2*u;
 const f=(j:1|2)=>{const m1=(k2[j]-k0[j])/Math.max(1e-6,k2[0]-k0[0])*h,m2=(k3[j]-k1[j])/Math.max(1e-6,k3[0]-k1[0])*h;return(2*u3-3*u2+1)*k1[j]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[j]+(u3-u2)*m2;};return[f(1),f(2)];}
const TA=-6,TB=10,DT=.02;
const TABLES=ACTORS.map(a=>{const X:number[]=[],Z:number[]=[],D:number[]=[];let d=0,px=0,pz=0;for(let i=0;i<=(TB-TA)/DT;i++){const[x,z]=herm(a.keys,TA+i*DT);if(i)d+=Math.hypot(x-px,z-pz);X.push(x);Z.push(z);D.push(d);px=x;pz=z;}return{X,Z,D};});
const samp=(arr:number[],tau:number)=>{const u=clamp((tau-TA)/DT,0,arr.length-1),i=Math.floor(u),f=u-i;return i+1<arr.length?lerp(arr[i],arr[i+1],f):arr[i];};
const posOf=(k:number,tau:number):[number,number]=>[samp(TABLES[k].X,tau),samp(TABLES[k].Z,tau)];
const distOf=(k:number,tau:number)=>samp(TABLES[k].D,tau);
const velOf=(k:number,tau:number):[number,number]=>{const a=posOf(k,tau-.1),b=posOf(k,tau+.1);return[(b[0]-a[0])/.2,(b[1]-a[1])/.2];};

// ---- the ball: Messi's dribble, the pullback, the interception, the clearance out toward the touchline ----
function arc(a:V3,b:V3,D:number,s:number):V3{const u=s/D,vy=(b[1]-a[1]+.5*GRAV*D*D)/D;return[lerp(a[0],b[0],u),a[1]+vy*s-.5*GRAV*s*s,lerp(a[2],b[2],u)];}
function ballAt(tau:number):V3{
 if(tau<PB-.25){const[x,z]=posOf(MSI,tau),v=velOf(MSI,tau),l=Math.hypot(v[0],v[1])||1,ph=distOf(MSI,tau)/1.7,push=.45+.35*Math.abs(Math.sin(ph*Math.PI));return[x+v[0]/l*push+v[1]/l*.1,.11,z+v[1]/l*push-v[0]/l*.1];}
 if(tau<PB){const[x,z]=posOf(MSI,PB-.25),v=velOf(MSI,PB-.25),l=Math.hypot(v[0],v[1])||1,a:V3=[x+v[0]/l*.6,.11,z+v[1]/l*.6];return mix3(a,BY,sm(PB-.25,PB,tau));}
 if(tau<CLR){const u=(tau-PB)/(CLR-PB);return mix3(BY,IP,u*(1.2-.2*u));}
 if(tau<LANDT)return arc(IP,LAND,FLY,tau-CLR);
 const u=clamp((tau-LANDT)/1.2);return[lerp(LAND[0],OUT[0],easeOut(u)),.11+.9*Math.abs(Math.sin(u*Math.PI*1.6))*(1-u)*(1-u),lerp(LAND[2],OUT[2],easeOut(u))];
}

// ---- poses ----
const READY=posed({lHipF:34,rHipF:30,lKnee:46,rKnee:42,lHipA:10,rHipA:10,lean:16,pitch:4,lShA:26,rShA:26,lShF:14,rShF:14,lElb:44,rElb:44,neckP:-8});
const LIN=new Set(['dx','dz','air','lHand','rHand','squash']);
function over(p:Pose,d:Partial<Pose>,w:number):Pose{if(w<=0)return p;const o={...p};for(const k of Object.keys(d) as(keyof Pose)[]){const v=LIN.has(k)?d[k]!:d[k]!*D2R;o[k]=p[k]+(v-p[k])*Math.min(1,w);}return o;}
/** the hoick: a long stretching right leg across the line of the pass, body leaning back and round */
const HOICK:Partial<Pose>={lKnee:58,lHipF:30,lean:4,pitch:-6,roll:-8,lShA:96,rShA:60,neckP:26};
function strikeOver(p:Pose,tau:number,contact:number,D:number,power:number,foot:'l'|'r',extra?:Partial<Pose>){const u=(tau-(contact-STRIKE_CONTACT*D))/D;
 if(u>-.1&&u<1.5){p=blendPose(p,strike(clamp(u),{foot,power}),Math.min(sm(-.1,.12,u),1-sm(1.05,1.5,u)));if(extra)p=over(p,extra,bump(.3,.85,u));}return p;}
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.45?YAW(v[0],v[1]):YAW(b[0]-x,b[2]-z);
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='ger'?READY:stand();
 let p:Pose;
 if(k===HERO){
  if(tau>-.7&&tau<.7)yaw=lerpAng(yaw,YAW(FACE_CLR[0],FACE_CLR[1]),Math.min(sm(-.7,-.3,tau),1-sm(.35,.7,tau)));
  const s=clamp((sp-2)/5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.3+2*s),{speed:s}),clamp((sp-.4)/.8));
  p=strikeOver(p,tau,CLR,.8,.95,'r',HOICK);
  return{p,yaw};}
 if(k===MSI){
  if(tau>PB-.5&&tau<PB+.6)yaw=lerpAng(yaw,YAW(PASSDIR[0],PASSDIR[1]),Math.min(sm(PB-.5,PB-.15,tau),1-sm(PB+.3,PB+.6,tau)));
  if(tau<PB){const s=clamp((sp-1.5)/5);p=blendPose(READY,dribble(distOf(k,tau)/1.7,{foot:'l',speed:.5+.5*s}),clamp((sp-.6)/1.4));}
  else{p=blendPose(stand(),runCycle(distOf(k,tau)/2.4,{speed:.2}),clamp((sp-.5)/.9));if(tau>0)yaw=YAW(IP[0]-x,IP[2]-z);}
  p=strikeOver(p,tau,PB,.6,.35,'l');
  return{p,yaw};}
 if(a.role==='gk'){yaw=YAW(b[0]-x,b[2]-z);p=idle;return{p,yaw};}
 const along=v[0]*Math.cos(yaw)-v[1]*Math.sin(yaw);
 if(sp>.5&&along<-.35*sp)p=blendPose(idle,backpedal(distOf(k,tau)/1.25),clamp((sp-.5)/.8));
 else{const s=clamp((sp-2.2)/5.5);p=blendPose(idle,runCycle(distOf(k,tau)/(2.4+2.2*s),{speed:s}),clamp((sp-.5)/.9));}
 if(k===HUM&&tau>-4.2&&tau<-3.4)p=over(p,{lean:26,rHipF:50,rKnee:40,rHipA:24,roll:10},bump(-4.2,-3.4,tau));// sold the dummy: leans the wrong way
 if(k===LVI&&tau>-.4&&tau<.4){yaw=YAW(BY[0]-x,BY[2]-z);p=over(p,{lShA:60,rShA:60,lean:20},bump(-.4,.4,tau));}
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
/** "between the ball and his goal": the line from the ball to the middle of the goal, on the grass */
const goalLine=(tau:number):V3[]=>{const b=ballAt(Math.min(tau,PB));return Array.from({length:9},(_,i)=>mix3([b[0],.03,b[2]],[0,.03,0],i/8));};
/** the pass Messi wanted: byline → Lavezzi */
const wantLane=():V3[]=>Array.from({length:9},(_,i)=>mix3(BY,[LAV[0]+.4,.11,LAV[1]+.3],i/8));
const clearArc=(n=18):V3[]=>Array.from({length:n+1},(_,i)=>ballAt(CLR+FLY*i/n));

// ================= chapter 1 (live): the high main-stand camera; Messi past Hummels, the pullback, Schweinsteiger first =================
const tau1=(t:number)=>{const E=SEC(0),ge=T(0,'Germany'),mr=T(0,'Messi races past Hummels'),ib=T(0,'into the box'),pb=T(0,'pulls it back'),fl=T(0,'for Lavezzi'),bs=T(0,'Bastian Schweinsteiger'),gf=T(0,'gets there first'),cl=T(0,'clears it');
 return key(t,mono([[0,-6.4],[ge,-6],[mr,-4.6],[mr+1.2,-3.6],[ib+.3,-1.4],[pb+.2,PB],[fl+.2,PB+.25],[bs+.2,-.2],[gf+.3,CLR+.02],[cl+.2,.5],[E+1,.5+(E+1-cl-.2)*.8]]),linear);};
const CAM1:V3=[-24,21,-58];
function look1(tau:number):V3{const b=ballAt(tau);
 if(tau<CLR)return[b[0]-2,1,b[2]-3];
 return mix3([b[0]-2,1,b[2]-3],[lerp(b[0],-7,.5),1.5,lerp(b[2],8,.5)],sm(CLR,CLR+1,tau));}
function cam1Authored(t:number):Pin{const tau=tau1(t),a=look1(tau),b=look1(tau-.3),c=look1(tau-.6),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const F=key(tau,[[-6.4,3400],[-4,3500],[-1.6,3700],[PB,4000],[CLR,4000],[1.5,3300],[3,3100]]);return{eye:CAM1,target:look,F};}
/** Director beats (lib/plays/riso/director.ts, Oct 4 2026): a short establishing wide of the Maracanã, then follow Messi on the ball (no swing
 * across the pitch to Schweinsteiger for "Germany": that 17 m truck read as a snap); push in low as Messi sells Hummels the dummy (the
 * defender being beaten stays in frame), ease back as he carries into the box, pull right out for the pullback (Messi, the lane, Lavezzi and
 * Schweinsteiger racing in all in shot: the decision), slide onto Schweinsteiger, push in tight as he gets there first, then hold on him
 * from just after the clearance (τ 0 lands ≈ .3 s after "gets there first"; "clears it" is spoken a beat later). */
const B1=beats([[0,'wide'],[1.2,{from:'follow',size:.38}],[T(0,'Messi races past Hummels')-.35,'tight'],[T(0,'into the box')-.3,{from:'follow',size:.38}],
 [T(0,'pulls it back')-.45,{from:'space',size:.24}],[T(0,'Bastian Schweinsteiger')-.4,'follow'],[T(0,'gets there first')-.4,{from:'tight',low:.35}],[T(0,'gets there first')+.65,'reaction']]);
/** Schweinsteiger's share of the hero (0 = Messi, the ball carrier): handed over to him after the pullback, over 1 s */
const w1=(t:number)=>sm(T(0,'for Lavezzi')+.1,T(0,'for Lavezzi')+1.1,t,easeInOutSine);
/** the pullback's teaching window: Lavezzi (the target he beats to it), Schweinsteiger (racing in) held in frame
 * until it is cleared; Boateng (covering, nearest the camera, else cropped in the low shots) held a little longer */
const pass1=(t:number)=>sm(T(0,'pulls it back')-.8,T(0,'pulls it back')-.1,t,easeInOutSine)*(1-sm(T(0,'gets there first')+.5,T(0,'clears it')-.1,t,easeInOutSine));
/** the directed cameras are averaged over ±.45 s by steady() (3 samples; 5 in ch3, where the cleared ball flies at the lens) so no keep or hand-over can snap them */
function cam1(t:number):Camera{const r=steady(t,cam1Directed,.45,3);return cam(r.eye,r.target,r.F);}
function cam1Directed(t:number):Pin{const a=cam1Authored(t),tau=tau1(t),w=w1(t),[sx,sz]=posOf(HERO,tau),[mx,mz]=posOf(MSI,tau),b=ballAt(tau);
 const hero:V3=[lerp(mx,sx,w),0,lerp(mz,sz,w)],bl:V3=mix3(b,[sx,.11,sz],w*(1-sm(T(0,'Bastian Schweinsteiger'),T(0,'gets there first')-.4,t)));
 const keys=[HERO,MSI,HUM,LVI].map(k=>{const[x,z]=posOf(k,tau);return[x,0,z] as V3;}),pw=pass1(t),[lx,lz]=posOf(LVI,tau),[bx,bz]=posOf(BOA,tau),bw=sm(T(0,'pulls it back')-.8,T(0,'pulls it back')-.1,t,easeInOutSine)*(1-sm(T(0,'clears it')+.3,T(0,'clears it')+1.1,t,easeInOutSine));
 const keep:Keep[]=[...near(hero,keys,3.5,7),...(pw>.01?[{P:[lx,0,lz] as V3,w:pw},{P:[lx,1.8,lz] as V3,w:pw},{P:[sx,0,sz] as V3,w:pw},{P:[sx,1.9,sz] as V3,w:pw},{P:[mx,0,mz] as V3,w:pw}]:[]),...(bw>.01?[{P:[bx,0,bz] as V3,w:bw}]:[])];
 return reframe(a,{hero,ball:bl,keep},shotAt(t,B1),DV);}
const ch1:Scene={
 draw(s,t){const tt=twos(t),c=cam1(t),tau=tau1(t),tp=tau1(tt),gf=T(0,'gets there first');frame(s);
  stadium(s,c,{t,cheer:.1+.5*sm(gf,gf+.6,t)});
  ground(s,c);
  const w=drawWorld(s,c,tau,tp,{ballMin:9});
  const q=w.res.get(HERO),ag=tp-CLR;if(q&&ag>-.05&&ag<.4){const f=q.joints.rToe;sparkBurst(s,Y,f[0],f[1],kAt(c,IP)*.7,{n:8,seed:11,g:easeOutBack(clamp((ag+.05)/.12))*(1-clamp((ag-.25)/.15)),width:9});}},
 aperture(t){const c=cam1(t),p=ballAt(tau1(t)),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(9,BALL_R*kAt(c,p))*1.1,12);},
 still:12,
};

// ================= chapter 2 (TV replay, slow motion, high behind the goal): back between the ball and his goal, reads the pass, first to it =================
const tau2=(t:number)=>{const E=SEC(1),sb=T(1,'Schweinsteiger sprints back'),bb=T(1,'between the ball'),hg=T(1,'and his goal'),rp=T(1,'He reads the pass'),sf=T(1,'steps in first');
 return key(t,mono([[0,-3.6],[sb,-3.2],[bb,-1.9],[hg,-1.4],[rp,PB-.12],[rp+.8,PB+.2],[sf+.1,-.06],[sf+.9,.3],[E,1.1]]),linear);};
function cam2Authored(t:number):Pin{const tau=tau2(t),E=SEC(1),[sx,sz]=posOf(HERO,tau),b=ballAt(Math.min(tau,.2)),push=sm(0,E,t,easeInOutSine);
 const look:V3=[lerp(sx,b[0],.45),1,lerp(sz,b[2],.45)];
 return{eye:[17-3*push,10.5-1.5*push,-3+1*push],target:look,F:lerp(1800,2300,push)};}
/** Director beats: the replay opens following Schweinsteiger's sprint back (the ball a soft keep, hard from "between the ball"), pulls out for "between the ball and
 * his goal" and "reads the pass" (the ball, the goal and Lavezzi held in frame: the space he is protecting), and pushes in tight as he
 * steps in first. */
const B2=beats([[0,'follow'],[T(1,'between the ball')-.4,{from:'space',size:.26}],[T(1,'steps in first')-.4,'tight']]);
function cam2(t:number):Camera{const r=steady(t,cam2Directed,.45,3);return cam(r.eye,r.target,r.F);}
function cam2Directed(t:number):Pin{const a=cam2Authored(t),tau=tau2(t),[sx,sz]=posOf(HERO,tau),[lx,lz]=posOf(LVI,tau),hero:V3=[sx,0,sz];
 const gw=sm(T(1,'between the ball')-.7,T(1,'between the ball'),t,easeInOutSine)*(1-sm(T(1,'steps in first')-.6,T(1,'steps in first')+.2,t,easeInOutSine)),lw=sm(T(1,'He reads the pass')-.7,T(1,'He reads the pass'),t,easeInOutSine)*(1-sm(T(1,'steps in first')-.4,T(1,'steps in first')+.3,t,easeInOutSine));
 const keep:Keep[]=[...near(hero,[MSI,LVI].map(k=>{const[x,z]=posOf(k,tau);return[x,0,z] as V3;}),3.5,7),...(gw>.01?[{P:[0,1.2,0] as V3,w:gw}]:[]),...(lw>.01?[{P:[lx,0,lz] as V3,w:lw},{P:[lx,1.8,lz] as V3,w:lw}]:[])];
 const r=reframe(a,{hero,keep:[...keep,{P:ballAt(Math.min(tau,.2)),w:lerp(.3,1,sm(T(1,'between the ball')-1.2,T(1,'between the ball')-.4,t,easeInOutSine))}]},shotAt(t,B2),DV);return r;}
const ch2:Scene={
 draw(s,t){const tt=twos(t),c=cam2(t),tau=tau2(t),tp=tau2(tt),E=SEC(1),sb=T(1,'Schweinsteiger sprints back'),bb=T(1,'between the ball'),hg=T(1,'and his goal'),rp=T(1,'He reads the pass'),sf=T(1,'steps in first');frame(s);
  stadium(s,c,{t,cheer:.1});
  ground(s,c);
  // "sprints back": his recovery run lights up on the grass (yellow)
  trail3(s,c,onGround(pathOf(HERO,-4.5,Math.min(tau,CLR))),.2,Y,{progress:sm(sb-.1,sb+.8,t,easeOut),cov:.9*(1-sm(E-.8,E-.3,t)),head:false,seed:21});
  // "between the ball and his goal": the line from the ball to the goal (red), and a ring on him once he is on it
  const lw=Math.max(sm(bb-.1,bb+.4,t),0)*(1-sm(rp+.6,rp+1.1,t));
  trail3(s,c,goalLine(tau),.12,R,{progress:sm(bb-.1,hg+.3,t,easeOut),cov:.9*lw,dashed:true,head:true,seed:23});
  const[hx,hz]=posOf(HERO,tau);groundRing(s,c,hx,hz,.9,.06,Y,sm(hg,hg+.3,t)*(1-sm(sf+.6,sf+1,t)),25);
  // "reads the pass": the pass Messi wants, byline to Lavezzi (navy dashes) …
  trail3(s,c,wantLane(),.1,K,{progress:sm(rp-.2,rp+.5,t,easeOut),cov:.85*(1-sm(sf+.2,sf+.6,t)),dashed:true,seed:27});
  const w=drawWorld(s,c,tau,tp,{ballMin:8,hero:true,glow:sm(rp-.1,rp+.3,t)*(1-sm(sf+.4,sf+.8,t))});
  // … "steps in first": he cuts it: a spark on the lane where his boot arrives
  const q=w.res.get(HERO),ag=t-sf;if(q&&ag>-.1&&ag<.8){const f=q.joints.rToe;sparkBurst(s,Y,f[0],f[1],kAt(c,IP)*.8,{n:9,seed:29,g:easeOutBack(clamp((ag+.1)/.2))*(1-clamp((ag-.5)/.3)),width:10});}
  if(t<.5)speedLines(s,K,0,0,0,{n:12,seed:33,len:900,spread:520,width:22,cov:.5*(1-t/.5)});
 },
 aperture(t){const c=cam2(t),p=ballAt(tau2(t)),[x,y]=P(c,p),r=Math.max(9,BALL_R*kAt(c,p));return apertureDisc(x,y,r*1.1,12);},
 still:6,
};

// ================= chapter 3 (low touchline camera): the ball flies clear, he turns and keeps going; Germany won the World Cup =================
const tau3=(t:number)=>{const E=SEC(2),kg=T(2,'Then he keeps going'),hr=T(2,'He ran'),gw=T(2,'Germany won');
 return key(t,mono([[0,.15],[kg+.2,1.2],[hr,2.4],[gw,4.6],[E,6.4]]),linear);};
const CAM3:V3=[-3,1.6,37.5];
function cam3Authored(t:number):Pin{const tau=tau3(t),E=SEC(2),[x,z]=posOf(HERO,tau),b=ballAt(tau),fol=sm(T(2,'Then he keeps going')-.3,T(2,'He ran')+.5,t,easeInOutSine);
 const look=mix3([b[0],Math.max(1,b[1]*.6),b[2]],[x,1.2,z],fol);
 return{eye:[CAM3[0]-6*sm(0,E,t,easeInOutSine),CAM3[1],CAM3[2]],target:look,F:key(t,mono([[0,2400],[T(2,'Then he keeps going'),2800],[T(2,'He ran'),3300],[E,3700]]))};}
/** Director beats: follow Schweinsteiger as he turns and keeps going (the cleared ball a soft keep until it lands), then close on him for
 * "Germany won the World Cup". */
const B3=beats([[0,'follow'],[T(2,'Germany won')-.2,'reaction']]);
function cam3(t:number):Camera{const r=steady(t,cam3Directed,.45,5);return cam(r.eye,r.target,r.F);}
function cam3Directed(t:number):Pin{const a=cam3Authored(t),tau=tau3(t),[x,z]=posOf(HERO,tau),bw=.6*(1-sm(LANDT-.3,LANDT+.5,tau,easeInOutSine));
 const r=reframe(a,{hero:[x,0,z],keep:bw>.01?[{P:ballAt(tau),w:bw}]:[]},shotAt(t,B3),DV);return r;}
const ch3:Scene={
 draw(s,t){const tt=twos(t),c=cam3(t),tau=tau3(t),tp=tau3(tt),kg=T(2,'Then he keeps going'),hr=T(2,'He ran'),mn=T(2,'one hundred and twenty minutes'),gw=T(2,'Germany won'),wc=T(2,'the World Cup'),E=SEC(2);frame(s);
  stadium(s,c,{t,cheer:.15+.9*sm(gw,gw+.4,t),flash:1.3*sm(wc-.2,wc+.3,t)});
  ground(s,c);
  // the clearance's flight (yellow dashes)
  trail3(s,c,clearArc(),.08,Y,{progress:clamp((tau-CLR)/FLY),cov:.9*(1-sm(kg,kg+.6,t)),dashed:true,head:false,seed:41});
  // "keeps going" / "he ran": his run on upfield (red), and it keeps extending through "120 minutes"
  trail3(s,c,onGround(pathOf(HERO,.8,Math.max(.9,tau))),.18,R,{progress:sm(kg-.1,kg+.5,t,easeOut),cov:.9*(1-sm(E-.9,E-.4,t)),seed:43});
  const w=drawWorld(s,c,tau,tp,{ballMin:8,hero:true});
  const q=w.res.get(HERO);if(q){const h=q.joints.head,g=sm(mn-.1,mn+.4,t)*(1-sm(gw,gw+.3,t));if(g>.02){const[hx,hz]=posOf(HERO,tau);groundRing(s,c,hx,hz,.8+.15*Math.sin(t*7),.07,Y,g,45);}
   const ag=t-gw;if(ag>-.1&&ag<1.2)sparkBurst(s,Y,h[0],h[1]-50,kAt(c,[-12,1,8])*1.2,{n:12,seed:47,g:easeOutBack(clamp((ag+.1)/.3))*(1-clamp((ag-.8)/.4)),width:12});}
  if(t<.45)speedLines(s,K,0,0,Math.PI,{n:12,seed:49,len:900,spread:520,width:22,cov:.5*(1-t/.45)});
  void hr;
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(HERO,tau3(t)),p:V3=[x,1.3,z],[px,py]=P(c,p);return apertureDisc(px,py,Math.max(12,.22*kAt(c,p)),12);},
 still:4.5,
};

// ================= chapter 4 (the lesson, a close low side camera): sprint back goal-side, first to the ball, keep going =================
const tau4=(t:number)=>{const E=SEC(3),sg=T(3,'sprint back goal-side'),gb=T(3,'get to the ball first'),kg=T(3,'then keep going');
 return key(t,mono([[0,-3.2],[sg,-2.6],[gb-.2,-.5],[gb+.6,CLR+.05],[kg,1.1],[E,3.6]]),linear);};
function cam4(t:number){const tau=tau4(t),E=SEC(3),[x,z]=posOf(HERO,tau),follow=sm(T(3,'then keep going')-.3,E,t,easeInOutSine);
 const look:V3=[lerp(x,IP[0],.35),1,lerp(z,IP[2],.35)];
 return cam([look[0]+2,1.7,look[2]-12+2*follow],look,lerp(1450,1250,follow));}
const ch4:Scene={
 draw(s,t){const tt=twos(t),c=cam4(t),tau=tau4(t),tp=tau4(tt),E=SEC(3),sg=T(3,'sprint back goal-side'),gb=T(3,'get to the ball first'),kg=T(3,'then keep going');frame(s);
  stadium(s,c,{t,cheer:.08});
  ground(s,c);
  trail3(s,c,goalLine(tau),.12,R,{progress:sm(sg-.1,sg+.6,t,easeOut),cov:.9*(1-sm(gb+.4,gb+.8,t)),dashed:true,seed:51});
  trail3(s,c,onGround(pathOf(HERO,-3.2,Math.min(tau,CLR))),.2,Y,{progress:sm(sg-.1,sg+.9,t,easeOut),cov:.9*(1-sm(kg,kg+.4,t)),head:false,seed:53});
  groundRing(s,c,IP[0],IP[2],.7+.1*Math.sin(t*6),.06,Y,sm(gb-.2,gb+.2,t)*(1-sm(gb+.9,gb+1.3,t)),55);
  const[hx,hz]=posOf(HERO,Math.max(tau,.8));trail3(s,c,[[hx,.05,hz],[hx-3,.05,hz+.8],[hx-6,.05,hz+1.8]],.3,Y,{progress:sm(kg-.1,kg+.5,t,easeOut),cov:.95*(1-sm(E-.5,E-.1,t)),seed:57});
  drawWorld(s,c,tau,tp,{ballMin:10,hero:true,only:[HERO,MSI,LVI,GKI]});
 },
 still:5,
};

const story:RisoStory={
 id:'schweinsteiger-final-2014',format:'11v11',title:'Schweinsteiger gets there first, 2014',
 theme:'Sprint back goal-side, read the pass, get to the ball first, then keep going.',
 ageNote:'2014 World Cup final, Germany 1–0 Argentina after extra time, Maracanã, Rio de Janeiro, 13 July 2014 (9th minute). Schweinsteiger was 29.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',red:'#ff665e',blue:'#0078bf',navy:'#22366b'},order:['yellow','red','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: a boot-print ring and a ball kicked clear from the point. Reduced motion: the ring and ball, still. */
 touch(s,x,y,age,seed){
  const r=rng(seed),dir=r()<.5?-1:1,u=age<=0?0:clamp(age/.9),g=age<=0?1:easeOutBack(clamp(age/.25));
  s.stroke(Y,polyPath(Array.from({length:20},(_,i)=>{const q=i/20*TAU;return[x+Math.cos(q)*90*g,y+Math.sin(q)*30*g] as Pt;}),true),10,.95);
  if(age>0&&age<.4)sparkBurst(s,R,x,y,120*g,{n:8,seed,g:1-clamp(age/.4),width:10});
  ball(s,x+dir*u*240,y-Math.sin(u*Math.PI)*160,50,age*9+hash(seed,3)*TAU);
 },
};
export default story;
