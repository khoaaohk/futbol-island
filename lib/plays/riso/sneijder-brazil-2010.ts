/** Iconic play film: Wesley Sneijder's header, 2010 FIFA World Cup quarter-final, Netherlands 2–1 Brazil, Nelson Mandela Bay Stadium,
 * Port Elizabeth, 2 July 2010 — the Netherlands' winner, 68th minute: Robben's corner from the right, Kuyt's flick-on at the near post,
 * Sneijder heads in.
 * A RisoStory (chapters mode) played unchanged by the card window (components/CardFilmPlayer.tsx) and StoryFilmPlayer.
 * Narration: public/plays/narration/sneijder-brazil-2010/script.json, voiced with local Kokoro (af_bella, 1.0); timing.json imported below.
 *
 * SOURCES (read Sept 2026 as raw pages; we cannot watch the footage):
 *  - Wikipedia, "2010 FIFA World Cup knockout stage" (raw wikitext: Netherlands vs Brazil account, football box, kit boxes and line-ups citing
 *    FIFA's Tactical Line-up)  https://en.wikipedia.org/wiki/2010_FIFA_World_Cup_knockout_stage
 *  - BBC Sport live text and report, Chris Bevan, "Netherlands 2–1 Brazil" (2 July 2010)
 *    http://news.bbc.co.uk/sport2/hi/football/world_cup_2010/matches/match_57/default.stm
 *  - Wikipedia, "Wesley Sneijder" (infobox height 1.70 m)
 * CONFIRMED by those accounts: 2 July 2010, 16:00 local, Nelson Mandela Bay Stadium, Port Elizabeth, 40,186; Brazil led through Robinho (10');
 *  Sneijder equalised (53'); 68': "ARJEN ROBBEN curls over a CORNER FROM THE RIGHT, DIRK KUYT FLICKS ON AT THE NEAR POST and there is Wesley
 *  SNEIJDER to HEAD INTO THE CORNER" (BBC live); "a Robben corner kick in the 68th minute, Sneijder heading the ball in after a flick-on from
 *  Kuyt" (Wikipedia); the Netherlands held on to win 2–1 and Brazil were out. KITS (FIFA line-up via Wikipedia): Netherlands ALL ORANGE
 *  (orange shirts, shorts and socks, black sock bands); Brazil BLUE shirts, WHITE shorts, BLUE socks. Numbers: Sneijder 10, Kuyt 7, Robben 11,
 *  Júlio César 1. Sneijder is 1.70 m tall.
 * INFERRED / ILLUSTRATIVE: every position, run and timing in metres and seconds (the corner ≈ 31 m in ≈ 1.3 s, apex ≈ 4 m; Kuyt's glancing
 *  flick ≈ 5 m back across the six-yard box; Sneijder's header from ≈ 5.5 m); Robben's LEFT foot and so an IN-SWINGER (he is left-footed; a
 *  left-foot inside curl bends left → right from the kicker, i.e. in toward the goal from the right corner); WHICH corner of the net ("into the
 *  corner": drawn low into the far-post corner, the side Sneijder was on); where the Brazil defenders stood (drawn without numbers or names)
 *  and Júlio César's position and late reaction; his kit (drawn dark), the referee's kit; the late-afternoon winter light and the stadium's
 *  white petal roof; crowd colours; the ball (the 2010 Jabulani, drawn white with navy panels); the main camera side (drawn with the goal on the
 *  left, the corner on the far touchline); camera placements and lenses; Sneijder's celebration run.
 *
 * STRUCTURE (a 1:1 recreation of the broadcast; never top-down): ONE simulation on τ (seconds; τ = 0 Sneijder's header): ch1 = the high
 * main-stand camera in near real time (the corner, the flick, the header, the net); ch2 = the slow-motion replay high behind the goal (Kuyt
 * glances it on, Sneijder waiting in the space at the far side); ch3 = a low byline camera beside the far post (the header nodded down into the
 * corner; two–one); ch4 = the lesson on a side camera (find the space, attack the ball). Seams are forward passages into the ball.
 * World: right-handed metres, y up, the goal the Dutch attack is the line x = 0, +z = the Netherlands' RIGHT (the corner is at +z).
 * Inks: yellow (sun, teaching marks), orange (the Netherlands, skin), blue (sky, grass with yellow, Brazil), navy (key line).
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
 const cues=cueWords.map(cw=>{const first=nw(cw.split(/\s+/)[0]);for(let i=from;i<words.length;i++)if(nw(words[i])===first){from=i+1;return{at:+on[i].toFixed(2),words:cw};}throw new Error(`sneijder film: cue "${cw}" not in "${label}"`);});
 return{label,narration:text,seconds:+(t+.9).toFixed(2),cues};}
import timingJson from '../../../public/plays/narration/sneijder-brazil-2010/timing.json';
const VOICE:NarrationTiming|null=timingJson as NarrationTiming;
const CHAPTERS:Chapter[]=withTiming([
 prov('Port Elizabeth, 2010','Port Elizabeth, 2010, the World Cup quarter-final: the Netherlands, in orange, against Brazil, in blue. Robben swings in a corner, Kuyt flicks it on at the near post, and there is Wesley Sneijder... header! Goal!',
  ['Port Elizabeth','the World Cup quarter-final','the Netherlands','in orange','against Brazil','in blue','Robben swings in a corner','Kuyt flicks it on','at the near post','Wesley Sneijder','header','Goal']),
 prov('The flick-on','Watch again, slowly. Kuyt glances it on with his head, and Sneijder, only one metre seventy tall, is waiting in the space.',
  ['Watch again','slowly','Kuyt glances it on','with his head','Sneijder','only one metre seventy tall','is waiting in the space']),
 prov('Two-one','He nods it into the corner. Two-one to the Netherlands, and Brazil are out!',
  ['He nods it','into the corner','Two-one','to the Netherlands','Brazil are out']),
 prov('Your turn','Your turn: at corners, find the space and attack the ball, even if you are small.',
  ['Your turn','at corners','find the space','attack the ball','even if you are small']),
],VOICE);
/** cue onset by its words (throws on a typo so a retime can never silently desync) */
const T=(ch:number,words:string)=>{const q=CHAPTERS[ch].cues.find(c=>c.words===words);if(!q)throw new Error(`sneijder film: no cue "${words}" in chapter ${ch+1}`);return q.at;};
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

// ================= Nelson Mandela Bay Stadium, a July (winter) late afternoon: a bowl under a white petal roof, low sun, boards =================
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
 // ≈ 5 pm in a Port Elizabeth winter: blue sky, a warm low-sun band
 s.field(B,.5,.6);
 const hz=P(c,add(c.eye,[c.f[0]*1e4,0,c.f[2]*1e4]))[1];
 s.tone(Y,polyPath([[-Bnd,hz-360],[Bnd,hz-400],[Bnd,hz+40],[-Bnd,hz+40]],true),.5);s.tone(R,polyPath([[-Bnd,hz-160],[Bnd,hz-190],[Bnd,hz+40],[-Bnd,hz+40]],true),.15);
 const low=new Path2D(),roof=new Path2D(),fas=new Path2D();
 for(let i=0;i<NS;i++){const ad=(q:V3[],p:Path2D)=>{const r=quadP(c,q);if(r)p.addPath(polyPath(r,true));};ad(BOWL.low[i],low);ad(BOWL.roof[i],roof);ad(BOWL.fascia[i],fas);}
 s.knockout(low);s.tone(B,low,.3);s.tone(K,low,.3);
 // the crowd: Brazil blue and yellow, the Dutch orange, white
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

// ================= kits (2 July 2010) and the figure adapter =================
const SKIN:AthleteStyle['skin']=[[R,.2],[Y,.45]];
/** Netherlands: all orange (confirmed); navy numbers and trim (inferred; the socks' black bands drawn as navy trim) */
const NED=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:R,shorts:R,socks:R,trim:K,boots:K,skin:SKIN,hair:K,hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',numberInk:[K,.9],...o});
/** Brazil: blue shirts, white shorts, blue socks (confirmed); yellow numbers and trim (inferred) */
const BRA=(o:Partial<AthleteStyle>={}):AthleteStyle=>({shirt:B,shorts:'paper',socks:B,trim:Y,boots:K,skin:SKIN,hair:K,hairStyle:'short',line:K,shade:[K,.3],sleeves:'short',numberInk:Y,number:null,...o});
const SNEIJDER:AthleteStyle=NED({number:10,hair:[Y,.55],build:{height:1.70,bulk:1},seed:10});
const KUYT:AthleteStyle=NED({number:7,hair:[Y,.8],build:{height:1.83},seed:7});
const ROBBEN:AthleteStyle=NED({number:11,hairStyle:'balding',hair:[K,.5],build:{height:1.8,bulk:.95},seed:11});
const JULIO:AthleteStyle={shirt:[K,.8],shorts:[K,.9],socks:[K,.8],trim:Y,boots:K,skin:[[R,.35],[Y,.5],[K,.2]],hair:K,hairStyle:'short',line:K,sleeves:'long',shade:[K,.26],number:1,numberInk:'paper',gloves:'paper',build:{height:1.86},seed:1};
const REF:AthleteStyle={shirt:[K,.92],shorts:[K,.92],socks:[K,.92],trim:'paper',boots:K,skin:SKIN,hair:[K,.6],hairStyle:'short',line:K,sleeves:'short',seed:33};
/** THE figure adapter: every footballer in this film is drawn here (athlete.ts: skeletal pose, continuous-silhouette body). */
function drawPlayer(s:Sheet,pose:Pose,c:Camera,style:AthleteStyle,place:Place,o:{prev?:{pose:Pose;place:Place};smear?:boolean}={}):DrawResult{
 if(o.prev&&o.smear)motionSmear(s,o.prev.pose,pose,c,style,place,{prevPlace:o.prev.place,ink:[K,.35]});
 return drawAthlete(s,pose,c,style,place,o.prev?{prev:o.prev.pose,prevPlace:o.prev.place}:{});
}

// ================= the play as ONE simulation on τ (seconds; τ = 0 Sneijder's header) =================
type TK=[number,number,number];
type Role='hero'|'ned'|'bra'|'gk'|'ref';
type Actor={name:string;role:Role;style:AthleteStyle;keys:TK[];key?:boolean};
const GRAV=9.81,CK=-1.85,FLK=-.55,HDR=0,CFL=FLK-CK,FFL=HDR-FLK,HFL=.34,IN_NET=HDR+HFL;
const CKP:V3=[-.45,.11,33.6],FL:V3=[-4.9,2.3,3.3],HP:V3=[-5.5,1.72,-1.7],GL:V3=[0,.42,-3.05];
/** the in-swinger's bend: bows out away from goal (the kicker's left), curls back in (left-foot inside curl) */
const CD:[number,number]=[FL[0]-CKP[0],FL[2]-CKP[2]],CDL=Math.hypot(CD[0],CD[1]),CRIGHT:[number,number]=[-CD[1]/CDL,CD[0]/CDL],BEND=2.2;
function standAt(b:V3,f:[number,number],ahead=.44,foot:'l'|'r'='r'):[number,number]{const l=Math.hypot(f[0],f[1]),fx=f[0]/l,fz=f[1]/l,rx=-fz,rz=fx,sd=foot==='r'?.1:-.1;return[b[0]-fx*ahead-rx*sd,b[2]-fz*ahead-rz*sd];}
/** under a ball in the air: the head meets it, standing a little behind along facing f */
const under=(b:V3,f:[number,number],back=.12):[number,number]=>{const l=Math.hypot(f[0],f[1]);return[b[0]-f[0]/l*back,b[2]-f[1]/l*back];};
const HDIR:[number,number]=[GL[0]-HP[0],GL[2]-HP[2]],KDIR:[number,number]=[CKP[0]-FL[0],CKP[2]-FL[2]];
const R_CK=standAt(CKP,CD,.44,'l'),S_HP=under(HP,HDIR),K_FL=under(FL,KDIR);
const ACTORS:Actor[]=[
 {name:'Sneijder',role:'hero',style:SNEIJDER,key:true,keys:[[-5,-12.5,-3.4],[-3.5,-11.6,-3],[-2.2,-10,-2.4],[-1.1,-7.9,-1.9],[-.4,-6.3,-1.75],[HDR,S_HP[0],S_HP[1]],[.5,-5.4,-2.1],[1.4,-6.6,-4.8],[2.6,-9.4,-9],[4,-12.4,-13.2],[5.6,-14.5,-16.5],[10,-15.5,-18]]},
 {name:'Kuyt',role:'ned',style:KUYT,key:true,keys:[[-5,-10,6],[-3,-8.8,5.6],[-1.6,-6.8,4.6],[-.9,-5.6,3.8],[FLK,K_FL[0],K_FL[1]],[.6,-4.4,2.8],[2,-5.5,-2],[10,-7,-6]]},
 {name:'Robben',role:'ned',style:ROBBEN,key:true,keys:[[-5,-2.4,35.4],[-3,-2.2,35.3],[-2.4,-1.8,35],[CK,R_CK[0],R_CK[1]],[-1,-1.6,33],[1,-3,30],[10,-8,24]]},
 {name:'Júlio César',role:'gk',style:JULIO,key:true,keys:[[-5,-1.1,.4],[CK,-1.2,1.2],[FLK,-1.3,2.4],[-.2,-1.4,1.4],[HDR,-1.35,.6],[10,-1.35,.6]]},
 {name:'Kuyt marker',role:'bra',style:BRA({seed:44}),key:true,keys:[[-5,-8.6,6.4],[-2,-7.2,5.2],[FLK,-4.5,4.3],[1,-4.4,4],[10,-4.4,4]]},
 {name:'Near defender',role:'bra',style:BRA({seed:43,build:{height:1.88}}),keys:[[-5,-6.5,1],[FLK,-5.8,1.6],[HDR,-5.6,.9],[10,-5.6,.9]]},
 {name:'Sneijder marker',role:'bra',style:BRA({seed:45}),key:true,keys:[[-5,-11,-1.6],[-3,-9.8,-.8],[-1.2,-7.8,.2],[HDR,-6.6,.3],[1,-6.2,-.6],[10,-6.2,-.6]]},
 {name:'Post man',role:'bra',style:BRA({seed:46}),keys:[[-5,-.8,4],[10,-.8,4]]},
 {name:'Edge defender',role:'bra',style:BRA({seed:47}),keys:[[-5,-12,3],[HDR,-11,2],[10,-10,1]]},
 {name:'Edge defender 2',role:'bra',style:BRA({seed:48}),keys:[[-5,-16,-6],[HDR,-14,-5],[10,-13,-5]]},
 {name:'Van Persie',role:'ned',style:NED({seed:49}),keys:[[-5,-7.5,-6],[-2,-6.8,-5.2],[HDR,-6.2,-4.6],[10,-6.4,-5]]},
 {name:'Dutch edge',role:'ned',style:NED({seed:50}),keys:[[-5,-17,1],[HDR,-15,-1],[10,-13,-3]]},
 {name:'Referee',role:'ref',style:REF,keys:[[-5,-20,10],[HDR,-18,8],[10,-16,6]]},
];
const HERO=0,KUI=1,ROB=2,GKI=3;
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
function cornerAt(s:number):V3{const p=arc(CKP,FL,CFL,s),u=s/CFL,off=-BEND*4*u*(1-u);return[p[0]+CRIGHT[0]*off,p[1],p[2]+CRIGHT[1]*off];}
const V_END:V3=(()=>{const a=arc(HP,GL,HFL,HFL-.02),b=arc(HP,GL,HFL,HFL);return[(b[0]-a[0])/.02,(b[1]-a[1])/.02,(b[2]-a[2])/.02];})();
const REST:V3=[1.5,.11,-2.7],NET_HIT:V3=[2,.5,-2.8];
function ballAt(tau:number):V3{
 if(tau<CK)return CKP;
 if(tau<FLK)return cornerAt(tau-CK);
 if(tau<HDR)return arc(FL,HP,FFL,tau-FLK);
 if(tau<IN_NET)return arc(HP,GL,HFL,tau-HDR);
 const s=tau-IN_NET;if(s<.1)return[GL[0]+V_END[0]*s,Math.max(.11,GL[1]+V_END[1]*s),GL[2]+V_END[2]*s];
 const a:V3=[GL[0]+V_END[0]*.1,.11,GL[2]+V_END[2]*.1],u=clamp((s-.1)/.6);return[lerp(a[0],REST[0],easeOut(u)),.11+.15*Math.sin(u*Math.PI)*(1-u),lerp(a[2],REST[2],easeOut(u))];
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
/** Kuyt's glancing flick: head back and round, the ball skimming off the top of it */
const FLICK:Partial<Pose>={neckP:-40,lean:-20,pitch:-8,neckY:-30};
/** Sneijder: a short, early jump (he is 1.70 m), nodding DOWN */
const NOD:Partial<Pose>={neckP:52,lean:34,air:.28};
function poseOf(k:number,tau:number):{p:Pose;yaw:number}{
 const a=ACTORS[k],v=velOf(k,tau),sp=Math.hypot(v[0],v[1]),[x,z]=posOf(k,tau),b=ballAt(tau);
 let yaw=sp>.45?YAW(v[0],v[1]):YAW(b[0]-x,b[2]-z);
 const idle=a.role==='gk'?keeperSet(tau*1.4):a.role==='bra'?READY:stand();
 const s=clamp((sp-2)/5);let p:Pose=blendPose(idle,runCycle(distOf(k,tau)/(2.3+2*s),{speed:s}),clamp((sp-.4)/.8));
 if(k===HERO){
  if(tau>-.9&&tau<.5)yaw=lerpAng(yaw,YAW(HDIR[0],HDIR[1]),Math.min(sm(-.9,-.4,tau),1-sm(.3,.5,tau)));
  p=headerOver(p,tau,HDR,.9,NOD);
  if(tau>1){p=blendPose(p,celebrate((tau-1)*.8,{kind:'run'}),sm(1,1.4,tau));}
  return{p,yaw};}
 if(k===KUI){if(tau>FLK-.8&&tau<FLK+.4)yaw=lerpAng(yaw,YAW(KDIR[0],KDIR[1]),Math.min(sm(FLK-.8,FLK-.4,tau),1-sm(FLK+.2,FLK+.4,tau)));p=headerOver(p,tau,FLK,1,FLICK);return{p,yaw};}
 if(k===ROB){if(tau>CK-.6&&tau<CK+.5)yaw=YAW(CD[0],CD[1]);p=strikeOver(p,tau,CK,1,.8,'l');return{p,yaw};}
 if(a.role==='gk'){yaw=YAW(b[0]-x,b[2]-z);p=idle;
  // too late: the header is past him before he can dive to his right (−z)
  if(tau>HDR+.05)p=keeperDive(clamp((tau-HDR-.05)/.9),{side:'r',height:.2});
  return{p,yaw};}
 if(a.role==='bra'&&tau>FLK-.6&&tau<FLK+.3&&x>-6&&z>2)p=headerOver(p,tau,FLK+.05,1);// the near-post jump, beaten by Kuyt
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
const cornerArc=(n=20):V3[]=>Array.from({length:n+1},(_,i)=>cornerAt(CFL*i/n));
const flickArc=(n=10):V3[]=>Array.from({length:n+1},(_,i)=>arc(FL,HP,FFL,FFL*i/n));
const headArc=(n=8):V3[]=>Array.from({length:n+1},(_,i)=>arc(HP,GL,HFL,HFL*i/n));
/** the far-post corner, lit */
function cornerTarget(s:Sheet,c:Camera,w:number,t:number){if(w<=.02)return;const cz=-3.1,cy=.45,r=.5+.06*Math.sin(t*6),pts:Pt[]=[];for(let i=0;i<20;i++){const a=i/20*TAU,p:V3=[0,Math.max(.02,cy+Math.sin(a)*r),cz+Math.cos(a)*r];if(depthOf(c,p)<NEAR)return;pts.push(P(c,p));}
 const path=polyPath(pts,true);s.tone(Y,path,.3*w);s.stroke(Y,path,Math.max(5,.08*kAt(c,[0,cy,cz])),.95*w);}
/** "only 1.70 m tall": a yellow measuring stick beside him, ground to the top of his head, with ticks */
function ruler(s:Sheet,c:Camera,x:number,z:number,w:number,seed:number){if(w<=.02)return;const pts:V3[]=[[x,.02,z+.55],[x,1.7*clamp(w*1.4),z+.55]];trail3(s,c,pts,.05,Y,{cov:.95*w,head:false,seed});
 for(let i=1;i<=3;i++){const y=i*.5;if(y>1.7*clamp(w*1.4))break;trail3(s,c,[[x,y,z+.45],[x,y,z+.7]],.035,Y,{cov:.95*w,head:false,seed:seed+i});}}

// ================= chapter 1 (live): the high main-stand camera; Robben's corner, Kuyt's flick, Sneijder's header, the net =================
const tau1=(t:number)=>{const E=SEC(0),nl=T(0,'the Netherlands'),rc=T(0,'Robben swings in a corner'),kf=T(0,'Kuyt flicks it on'),np=T(0,'at the near post'),ws=T(0,'Wesley Sneijder'),hd=T(0,'header'),g=T(0,'Goal');
 return key(t,mono([[0,-5],[nl,-4.6],[rc-.2,CK-.35],[rc+.6,CK+.3],[kf,FLK-.05],[np+.3,FLK+.15],[ws,-.3],[hd,HDR+.02],[g,IN_NET+.25],[E+1,IN_NET+.25+(E+1-g)]]),linear);};
const CAM1:V3=[-26,21,-58];
function look1(tau:number):V3{const b=ballAt(tau);
 if(tau<CK)return mix3([-10,1,6],[-5,1,22],sm(-5,CK-.8,tau));
 if(tau<FLK)return mix3([-5,1,22],[-4,1.5,1],sm(CK,FLK,tau,easeInOutSine));
 if(tau<IN_NET+.3)return[-3.5,1.2,-.5];
 const[x,z]=posOf(HERO,tau);return mix3([-3.5,1.2,-.5],[x,1,z],sm(IN_NET+.3,IN_NET+2,tau));void b;}
function cam1(t:number){const tau=tau1(t),a=look1(tau),b=look1(tau-.3),c=look1(tau-.6),look:V3=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
 const F=key(tau,[[-5,2700],[CK,2900],[FLK,3500],[HDR,3800],[IN_NET+.5,3700],[IN_NET+2.5,3900]]);return cam(CAM1,look,F);}
const ch1:Scene={
 draw(s,t){const tt=twos(t),c=cam1(t),tau=tau1(t),tp=tau1(tt),goalIn=tau-IN_NET;frame(s);
  stadium(s,c,{t,cheer:.12+.9*sm(0,.5,goalIn),flash:.1+1*sm(0,.4,goalIn)});
  ground(s,c,{net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  drawWorld(s,c,tau,tp,{ballMin:9});},
 aperture(t){const c=cam1(t),p=ballAt(tau1(t)),[x,y]=P(c,p);return apertureDisc(x,y,Math.max(9,BALL_R*kAt(c,p))*1.1,12);},
 still:12,
};

// ================= chapter 2 (TV replay, slow motion, high behind the goal): Kuyt glances it on, Sneijder waiting in the space =================
const tau2=(t:number)=>{const E=SEC(1),kg=T(1,'Kuyt glances it on'),wh=T(1,'with his head'),sn=T(1,'Sneijder'),om=T(1,'only one metre seventy tall'),ws=T(1,'is waiting in the space');
 return key(t,mono([[0,CK+.5],[kg-.3,FLK-.25],[wh+.3,FLK+.1],[sn,-.34],[om+1.2,-.2],[ws+.4,-.05],[E,HDR+.3]]),linear);};
function cam2(t:number){const E=SEC(1),push=sm(0,E,t,easeInOutSine),f2=sm(T(1,'Sneijder')-.3,T(1,'Sneijder')+.9,t,easeInOutSine);
 const look=mix3([-4.6,1.3,2.2],[-5.4,1.1,-1.2],f2);
 return cam([15-3*push,10-2*push,1.5],look,lerp(1900,2500,push));}
const ch2:Scene={
 draw(s,t){const tt=twos(t),c=cam2(t),tau=tau2(t),tp=tau2(tt),E=SEC(1),kg=T(1,'Kuyt glances it on'),wh=T(1,'with his head'),sn=T(1,'Sneijder'),om=T(1,'only one metre seventy tall'),ws=T(1,'is waiting in the space');frame(s);
  stadium(s,c,{t,cheer:.1});
  ground(s,c);
  // the corner's in-swinging flight (navy dashes), then "glances it on": the flick across the six-yard box (yellow)
  trail3(s,c,cornerArc(),.07,K,{progress:clamp((tau-CK)/CFL),cov:.75*(1-sm(E-.8,E-.3,t)),dashed:true,head:false,seed:21});
  trail3(s,c,flickArc(),.08,Y,{progress:sm(wh-.2,wh+.6,t,easeOut),cov:.95*(1-sm(E-.6,E-.2,t)),seed:23});
  // Kuyt's head at the near post: an orange ring on the grass under him
  const[kx,kz]=posOf(KUI,Math.min(tau,FLK));groundRing(s,c,kx,kz,.8,.06,R,sm(kg-.2,kg+.2,t)*(1-sm(sn,sn+.4,t)),25);
  // "is waiting in the space": a big yellow ring of empty grass round Sneijder, the defenders outside it
  const[hx,hz]=posOf(HERO,tau);groundRing(s,c,hx,hz,1.6+.12*Math.sin(t*5),.07,Y,sm(ws-.2,ws+.3,t)*(1-sm(E-.4,E,t)),27);
  // "only one metre seventy tall": the measuring stick
  ruler(s,c,hx,hz,sm(om-.1,om+.6,t)*(1-sm(ws+.4,ws+.8,t)),29);
  drawWorld(s,c,tau,tp,{ballMin:8,hero:true,glow:sm(sn-.1,sn+.3,t)*(1-sm(om,om+.4,t))});
  if(t<.5)speedLines(s,K,0,0,0,{n:12,seed:33,len:900,spread:520,width:22,cov:.5*(1-t/.5)});
 },
 aperture(t){const c=cam2(t),p=ballAt(tau2(t)),[x,y]=P(c,p),r=Math.max(9,BALL_R*kAt(c,p));return apertureDisc(x,y,r*1.1,12);},
 still:6,
};

// ================= chapter 3 (low byline camera beside the far post): he nods it into the corner; two–one; Brazil are out =================
const tau3=(t:number)=>{const E=SEC(2),hn=T(2,'He nods it'),ic=T(2,'into the corner'),to=T(2,'Two-one');
 return key(t,mono([[0,-.45],[hn,-.1],[hn+.5,HDR+.05],[ic+.3,IN_NET+.05],[to,IN_NET+.6],[E,IN_NET+.6+(E-to)*.8]]),linear);};
function cam3(t:number){const tau=tau3(t),E=SEC(2),[x,z]=posOf(HERO,tau),fol=sm(T(2,'Two-one')-.2,E,t,easeInOutSine);
 const look=mix3([-2.6,1,-2.2],[x,1.2,z],fol);
 return cam([1.6,.95+.5*fol,-8.2],look,lerp(820,1150,fol));}
const ch3:Scene={
 draw(s,t){const tt=twos(t),c=cam3(t),tau=tau3(t),tp=tau3(tt),hn=T(2,'He nods it'),ic=T(2,'into the corner'),to=T(2,'Two-one'),tn=T(2,'to the Netherlands'),bo=T(2,'Brazil are out'),E=SEC(2),goalIn=tau-IN_NET;frame(s);
  stadium(s,c,{t,cheer:.15+.9*sm(0,.4,goalIn),flash:1.2*sm(to-.2,to+.3,t)});
  ground(s,c,{net:goalIn>0?netRipple(goalIn,NET_HIT):undefined});
  trail3(s,c,headArc(),.08,Y,{progress:sm(hn-.1,hn+.5,t,easeOut),cov:.95*(1-sm(E-.8,E-.4,t)),seed:41});
  cornerTarget(s,c,sm(ic-.3,ic+.2,t)*(1-sm(E-.6,E-.2,t)),t);
  const w=drawWorld(s,c,tau,tp,{ballMin:8,hero:true});
  const q=w.res.get(HERO),ag=t-hn-.5;if(q&&ag>-.1&&ag<.5){const h=q.joints.head;sparkBurst(s,Y,h[0],h[1],kAt(c,HP)*.35,{n:8,seed:43,g:easeOutBack(clamp((ag+.1)/.15))*(1-clamp((ag-.3)/.2)),width:9});}
  if(q){const h=q.joints.head,ab=t-bo;if(ab>-.1&&ab<1.2)sparkBurst(s,R,h[0],h[1]-40,kAt(c,[-8,1,-6])*1.2,{n:12,seed:45,g:easeOutBack(clamp((ab+.1)/.3))*(1-clamp((ab-.8)/.4)),width:12});}
  if(t<.45)speedLines(s,K,0,0,Math.PI,{n:12,seed:47,len:900,spread:520,width:22,cov:.5*(1-t/.45)});
  void tn;
 },
 aperture(t){const c=cam3(t),[x,z]=posOf(HERO,tau3(t)),p:V3=[x,1.3,z],[px,py]=P(c,p);return apertureDisc(px,py,Math.max(12,.22*kAt(c,p)),12);},
 still:4.5,
};

// ================= chapter 4 (the lesson, a side camera): at corners, find the space and attack the ball, even if you are small =================
const tau4=(t:number)=>{const E=SEC(3),ac=T(3,'at corners'),fs=T(3,'find the space'),ab=T(3,'attack the ball'),ey=T(3,'even if you are small');
 return key(t,mono([[0,CK-.3],[ac,CK+.3],[fs,-1.4],[ab-.2,-.6],[ab+.8,HDR+.02],[ey,.2],[E,IN_NET+.5]]),linear);};
function cam4(t:number){const E=SEC(3),push=sm(0,E,t,easeInOutSine);const look:V3=[-5.2,1.2,-1];
 return cam([-17+3*push,3.2,-7.5+1*push],look,lerp(1500,1800,push));}
const ch4:Scene={
 draw(s,t){const tt=twos(t),c=cam4(t),tau=tau4(t),tp=tau4(tt),E=SEC(3),ac=T(3,'at corners'),fs=T(3,'find the space'),ab=T(3,'attack the ball'),ey=T(3,'even if you are small');frame(s);
  stadium(s,c,{t,cheer:.08});
  ground(s,c);
  trail3(s,c,cornerArc(),.07,K,{progress:sm(ac-.1,ac+1,t,easeOut),cov:.7*(1-sm(ab,ab+.5,t)),dashed:true,head:false,seed:51});
  groundRing(s,c,HP[0],HP[2],1.6+.12*Math.sin(t*5),.07,Y,sm(fs-.2,fs+.3,t)*(1-sm(ab+.6,ab+1,t)),53);
  trail3(s,c,onGround(pathOf(HERO,-2.4,HDR)),.2,R,{progress:sm(ab-.2,ab+.5,t,easeOut),cov:.9*(1-sm(E-.5,E-.1,t)),seed:55});
  const[hx,hz]=posOf(HERO,Math.min(tau,HDR));ruler(s,c,hx,hz,sm(ey-.1,ey+.6,t)*(1-sm(E-.4,E,t)),57);
  drawWorld(s,c,tau,tp,{ballMin:10,hero:true,only:[HERO,KUI,GKI,4,6,5]});
 },
 still:5,
};

const story:RisoStory={
 id:'sneijder-brazil-2010',format:'11v11',title:'Sneijder’s header, 2010',
 theme:'At corners, find the space and attack the ball: even a small player can score with his head.',
 ageNote:'2010 World Cup quarter-final, Netherlands 2–1 Brazil, Nelson Mandela Bay Stadium, Port Elizabeth, 2 July 2010 (68th minute). Sneijder was 26.',
 spec:{paper:'#f0ece2',inks:{yellow:'#ffe800',orange:'#ff6c2f',blue:'#0078bf',navy:'#22366b'},order:['yellow','orange','blue','navy'],registration:1.8,alpha:.9,grain:.6,mottle:.5},
 audio:{mode:'chapters'},
 chapters:CHAPTERS,
 draw(f){playChapters(story,f,[ch1,ch2,ch3,ch4]);},
 /** Touch: an orange ring and a ball nodded down from the point. Reduced motion: the ring and ball, still. */
 touch(s,x,y,age,seed){
  const u=age<=0?0:clamp(age/.9),g=age<=0?1:easeOutBack(clamp(age/.25));
  s.stroke(R,polyPath(Array.from({length:20},(_,i)=>{const q=i/20*TAU;return[x+Math.cos(q)*90*g,y+Math.sin(q)*30*g] as Pt;}),true),10,.95);
  if(age>0&&age<.35)sparkBurst(s,Y,x,y-160,110*g,{n:8,seed,g:1-clamp(age/.35),width:10});
  ball(s,x+u*120,y-160+u*u*160,50,age*9+hash(seed,3)*TAU);
 },
};
export default story;
