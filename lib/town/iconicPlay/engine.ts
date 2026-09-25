/**
 * Iconic-play engine — draws one riso-printed frame of a Play (types.ts) into a player card's picture window.
 *
 * Reuses the story riso engine (lib/paths/riso: acquireSheet → plates → press) without changing it:
 * cream paper, yellow/blue/opponent/star/navy plates with multiply overprint, halftone, speckle grain and a
 * slow registration drift. The pitch is yellow × blue = green with chalk knocked out to paper; the goal sits at
 * the top (goal line y = 0) and anything with height h is drawn raised by h (up the screen).
 *
 * Performance: static geometry (chalk, net, stripes) is built once per field and reused as Path2D; each frame
 * builds only the figure/ball/effect paths that are on screen. Pure function of (play, t, look): no state, no clock.
 */
import {acquireSheet,type Sheet,type SheetSpec} from '../../paths/riso/sheet';
import {footballPanels,sparkBurst,speedLines,ripple,dust,confetti} from '../../paths/riso/shapes';
import {clamp,lerp,easeIO,easeOut,easeOutBack,keyPath,linear,ribbon,TAU,hash,type Key,type Pt} from '../../paths/riso/motion';
import type {Actor,Field,Play,PlayEvent,PlayLook,Pose} from './types';

// ---------------------------------------------------------------- inks
const PAPER='#f0ece2',NAVY='#22366b',YELLOW='#ffe800',BLUE='#0078bf',PINK='#ff48b0';
type Inks={spec:SheetSpec;star:string;mate:string;opp:string;key:string};
let inkCache:Inks|null=null;
const rgb=(hex:string):[number,number,number]|null=>{let h=(hex||'').trim().replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');if(!/^[0-9a-f]{6}$/i.test(h))return null;return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];};
const dist=(a:string,b:string)=>{const p=rgb(a),q=rgb(b);return p&&q?Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]):999;};
/** Plates: yellow (pitch, keeper), blue (pitch, mates), opp, star, navy key — plus a mate plate only for a custom mate ink.
 * A star ink that is (nearly) one of the plate inks prints on that plate, so most cards press 4–5 plates. */
function inksFor(look:PlayLook):Inks{
 const starHex=rgb(look.starInk)?look.starInk:'#e98acb',mateHex=look.mateInk&&rgb(look.mateInk)?look.mateInk:BLUE,oppHex=look.oppInk&&rgb(look.oppInk)?look.oppInk:PINK;
 const key=starHex+'|'+mateHex+'|'+oppHex;if(inkCache&&inkCache.key===key)return inkCache;
 const inks:Record<string,string>={yellow:YELLOW,blue:BLUE,opp:oppHex,navy:NAVY},order=['yellow','blue','opp'];
 let mate='blue';if(dist(mateHex,BLUE)>30){inks.mate=mateHex;order.push('mate');mate='mate';}
 let star='star';for(const n of order)if(dist(inks[n],starHex)<40){star=n;break;}
 if(star==='star'){inks.star=starHex;order.push('star');}
 order.push('navy');
 inkCache={key,star,mate,opp:'opp',spec:{paper:PAPER,inks,order,registration:1.5,alpha:.9,grain:.55,mottle:.55}};
 return inkCache;
}

// ---------------------------------------------------------------- sampling (pure, smooth)
type Row=readonly number[];
const segIndex=(K:readonly Row[],t:number)=>{let k=0;while(k<K.length-2&&t>=K[k+1][0])k++;return k;};
/** Hermite (Catmull-Rom-like, time-aware) through keys; `sharp(k)` keeps a corner at key k (a kick, a cut), holds decelerate to rest. */
function hermite(K:readonly Row[],t:number,c:number,sharp:(k:number)=>boolean,still:(a:number,b:number)=>boolean):number{
 const n=K.length;if(n===1||t<=K[0][0])return K[0][c];if(t>=K[n-1][0])return K[n-1][c];
 const k=segIndex(K,t),a=K[k],b=K[k+1],dt=b[0]-a[0];if(dt<=1e-6)return b[c];
 const slope=(i:number)=>i<0||i>=n-1?null:(K[i+1][c]-K[i][c])/Math.max(1e-6,K[i+1][0]-K[i][0]);
 const tan=(i:number,start:boolean)=>{
  if((i>0&&still(i-1,i))||(i<n-1&&still(i,i+1)))return 0;
  const prev=slope(i-1),next=slope(i);
  if(sharp(i))return start?(next??prev??0):(prev??next??0);
  if(prev===null||next===null)return next??prev??0;
  return (K[i+1][c]-K[i-1][c])/Math.max(1e-6,K[i+1][0]-K[i-1][0]);};
 if(still(k,k+1))return a[c];
 const u=(t-a[0])/dt,u2=u*u,u3=u2*u;
 return (2*u3-3*u2+1)*a[c]+(u3-2*u2+u)*dt*tan(k,true)+(-2*u3+3*u2)*b[c]+(u3-u2)*dt*tan(k+1,false);
}
const sharpCache=new WeakMap<object,boolean[]>();
/** Corners: a turn sharper than `turn` radians or a speed change beyond `ratio` (touches, passes, kicks, cuts). */
function corners(K:readonly Row[],turn:number,ratio:number):boolean[]{
 let out=sharpCache.get(K);if(out)return out;out=[];
 for(let i=0;i<K.length;i++){if(i===0||i===K.length-1){out.push(true);continue;}
  const ax=K[i][1]-K[i-1][1],ay=K[i][2]-K[i-1][2],bx=K[i+1][1]-K[i][1],by=K[i+1][2]-K[i][2],la=Math.hypot(ax,ay),lb=Math.hypot(bx,by);
  if(la<.5||lb<.5){out.push(false);continue;}
  const va=la/Math.max(1e-6,K[i][0]-K[i-1][0]),vb=lb/Math.max(1e-6,K[i+1][0]-K[i][0]),r=va>vb?va/Math.max(1e-6,vb):vb/Math.max(1e-6,va);
  let ang=Math.abs(Math.atan2(by,bx)-Math.atan2(ay,ax));if(ang>Math.PI)ang=TAU-ang;
  out.push(ang>turn||r>ratio);}
 sharpCache.set(K,out);return out;
}
const stillXY=(K:readonly Row[])=>(a:number,b:number)=>Math.abs(K[a][1]-K[b][1])<.5&&Math.abs(K[a][2]-K[b][2])<.5;
/** An actor's ground position at t. */
export function sampleTrack(track:Actor['track'],t:number,out:Pt=[0,0]):Pt{
 if(!track||!track.length){out[0]=0;out[1]=0;return out;}
 const sh=corners(track,1.05,2.4),sharp=(k:number)=>sh[k],still=stillXY(track);
 out[0]=hermite(track,t,1,sharp,still);out[1]=hermite(track,t,2,sharp,still);return out;
}
/** The ball at t: [x, y, h] (h ≥ 0). Ground contacts (h≈0 keys) and direction changes stay sharp; flights arc smoothly. */
export function sampleBall(ball:Play['ball'],t:number,out:[number,number,number]=[0,0,0]):[number,number,number]{
 if(!ball||!ball.length){out[0]=0;out[1]=0;out[2]=0;return out;}
 const sh=corners(ball,.5,1.8),sharp=(k:number)=>sh[k],still=stillXY(ball);
 out[0]=hermite(ball,t,1,sharp,still);out[1]=hermite(ball,t,2,sharp,still);
 out[2]=Math.max(0,hermite(ball,t,3,k=>ball[k][3]<=1||sh[k],(a,b)=>ball[a][3]===ball[b][3]&&ball[a][3]<=1));return out;
}

// ---------------------------------------------------------------- field geometry (cached per field)
type FieldGeo={w:number;len:number;goal:number;bar:number;depth:number;zoom:number;pitch:Path2D;chalk:Path2D;spots:Path2D;stripes:Path2D;area?:Path2D;net:Path2D;netGrid:Path2D;posts:Path2D;postsIn:Path2D;stand:Path2D};
const geoCache:Partial<Record<Field,FieldGeo>>={};
const line=(p:Path2D,pts:Pt[],w:number,seed:number)=>p.addPath(ribbon(pts,w,{seed,pressure:.35,taper:.15,wobble:.9,step:9}));
const arcPts=(cx:number,cy:number,r:number,a0:number,a1:number,n=18):Pt[]=>{const o:Pt[]=[];for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;o.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}return o;};
function capsule(p:Path2D,ax:number,ay:number,bx:number,by:number,r:number){const a=Math.atan2(by-ay,bx-ax),c=Math.cos(a-Math.PI/2)*r,s=Math.sin(a-Math.PI/2)*r;p.moveTo(ax+c,ay+s);p.lineTo(bx+c,by+s);p.arc(bx,by,r,a-Math.PI/2,a+Math.PI/2);p.arc(ax,ay,r,a+Math.PI/2,a+Math.PI*1.5);p.closePath();}
function geometry(field:Field):FieldGeo{
 const hit=geoCache[field];if(hit)return hit;
 const court=field==='court',w=court?200:340,len=court?560:900,goal=court?50:75,bar=court?32:40,depth=court?20:25,chalkW=court?3.4:4;
 const pitch=new Path2D();pitch.rect(-w,0,w*2,len+1400);
 const chalk=new Path2D(),spots=new Path2D();
 // touchlines + goal line
 line(chalk,[[-w,len+1400],[-w,0],[w,0],[w,len+1400]],chalkW,3);
 if(!court){
  line(chalk,[[-200,0],[-200,165],[200,165],[200,0]],chalkW,5);
  line(chalk,[[-92,0],[-92,55],[92,55],[92,0]],chalkW,7);
  const da=Math.asin(55/90);line(chalk,arcPts(0,110,90,da,Math.PI-da,14),chalkW,9);
  line(chalk,[[-w,525],[w,525]],chalkW,11);line(chalk,arcPts(0,525,91.5,Math.PI,TAU,20),chalkW,13);line(chalk,arcPts(0,525,91.5,0,Math.PI,20),chalkW,14);
  line(chalk,arcPts(-w,0,12,0,Math.PI/2,5),chalkW*.8,15);line(chalk,arcPts(w,0,12,Math.PI/2,Math.PI,5),chalkW*.8,16);
  spots.arc(0,110,4.2,0,TAU);spots.moveTo(4,525);spots.arc(0,525,4,0,TAU);
 }else{
  // futsal penalty area: quarter circles r 120 from each post joined across
  const pa=[...arcPts(-goal,0,120,Math.PI,Math.PI/2,12),...arcPts(goal,0,120,Math.PI/2,0,12)];line(chalk,pa,chalkW,5);
  line(chalk,[[-w,300],[w,300]],chalkW,11);line(chalk,arcPts(0,300,45,0,TAU,24),chalkW,13);
  spots.arc(0,90,3.6,0,TAU);spots.moveTo(3.6,150);spots.arc(0,150,3.6,0,TAU);spots.moveTo(4,300);spots.arc(0,300,4,0,TAU);
  // substitution-zone ticks on the near touchlines
  for(const y of [150,210])for(const sx of [-1,1])line(chalk,[[sx*w,y],[sx*(w-10),y]],chalkW*.8,17+y);
 }
 const stripes=new Path2D(),sw=court?40:60;for(let y=0;y<len+1400;y+=sw*2)stripes.rect(-w,y,w*2,sw);
 let area:Path2D|undefined;if(court){area=new Path2D();area.moveTo(-goal-120,0);area.arc(-goal,0,120,Math.PI,Math.PI/2,true);area.lineTo(goal,120);area.arc(goal,0,120,Math.PI/2,0,true);area.closePath();}
 // goal: front frame on the line, back of the net `depth` behind (up the screen), height up the screen
 const bw=goal-7,backY=-depth,backTop=backY-bar*.85,net=new Path2D();
 net.moveTo(-goal,0);net.lineTo(-goal,-bar);net.lineTo(-bw,backTop);net.lineTo(bw,backTop);net.lineTo(goal,-bar);net.lineTo(goal,0);net.lineTo(bw,backY);net.lineTo(-bw,backY);net.closePath();
 const netGrid=new Path2D(),cell=court?7:8;
 for(let x=-goal;x<=goal+.1;x+=cell){netGrid.moveTo(x,0);netGrid.lineTo(x*bw/goal,backTop);}
 for(let y=0;y>=backTop-.1;y-=cell){netGrid.moveTo(-goal-1,y);netGrid.lineTo(goal+1,y);}
 const posts=new Path2D(),postsIn=new Path2D(),pr=court?3.6:4.2;
 capsule(posts,-goal,2,-goal,-bar,pr);capsule(posts,goal,2,goal,-bar,pr);capsule(posts,-goal,-bar,goal,-bar,pr);
 capsule(posts,-goal,-bar,-bw,backTop,pr*.55);capsule(posts,goal,-bar,bw,backTop,pr*.55);capsule(posts,-bw,backTop,bw,backTop,pr*.55);
 capsule(posts,-goal,0,-bw,backY,pr*.45);capsule(posts,goal,0,bw,backY,pr*.45);
 capsule(postsIn,-goal,.5,-goal,-bar,pr*.5);capsule(postsIn,goal,.5,goal,-bar,pr*.5);capsule(postsIn,-goal,-bar,goal,-bar,pr*.5);
 // the stand behind the goal: a hand-cut band with a crowd of heads
 const stand=new Path2D();stand.rect(-w-900,-2400,w*2+1800,2400+(backTop-26));
 const g:FieldGeo={w,len,goal,bar,depth,zoom:court?2.5:1.9,pitch,chalk,spots,stripes,area,net,netGrid,posts,postsIn,stand};
 geoCache[field]=g;return g;
}
const crowdCache:Partial<Record<Field,Path2D>>={};
function crowd(field:Field,g:FieldGeo){let p=crowdCache[field];if(p)return p;p=new Path2D();const top=-g.depth-g.bar*.85-26;
 for(let row=0;row<9;row++)for(let x=-g.w-880;x<g.w+880;x+=17){const jx=(hash(row*977+Math.round(x),5)-.5)*8,y=top-12-row*19+(hash(row*131+Math.round(x),9)-.5)*5,r=5.2+hash(Math.round(x)+row,3)*1.6;p.moveTo(x+jx+r,y);p.arc(x+jx,y,r,0,TAU);}
 crowdCache[field]=p;return p;}

// ---------------------------------------------------------------- figures
type PoseP={lift:number;rot:number;drop:number;sy:number;up:number;fwd:number;kick:number;split:number;run:number};
const RUN:PoseP={lift:0,rot:0,drop:0,sy:1,up:0,fwd:0,kick:0,split:0,run:1};
const POSES:Record<Pose,PoseP>={
 run:RUN,
 jump:{lift:22,rot:0,drop:0,sy:1.12,up:.9,fwd:0,kick:0,split:.15,run:0},
 head:{lift:20,rot:.32,drop:0,sy:1.1,up:.55,fwd:0,kick:0,split:.2,run:0},
 slide:{lift:0,rot:-1.12,drop:13,sy:1,up:.35,fwd:0,kick:0,split:1,run:0},
 'dive-left':{lift:15,rot:1.42,drop:11,sy:1.05,up:1,fwd:0,kick:0,split:.2,run:0},
 'dive-right':{lift:15,rot:1.42,drop:11,sy:1.05,up:1,fwd:0,kick:0,split:.2,run:0},
 kick:{lift:0,rot:-.14,drop:0,sy:1,up:.4,fwd:0,kick:1,split:0,run:0},
 overhead:{lift:26,rot:Math.PI,drop:-4,sy:1,up:.5,fwd:0,kick:1,split:0,run:0},
 fall:{lift:0,rot:1.42,drop:15,sy:1,up:.6,fwd:0,kick:0,split:.3,run:0},
 celebrate:{lift:0,rot:0,drop:0,sy:1.04,up:1,fwd:0,kick:0,split:.25,run:0},
};
/** The pose at t with a short blend in/out: [pose, weight, start]. */
function poseAt(a:Actor,t:number):[Pose,number,number]{
 const P=a.poses;if(!P||!P.length)return['run',0,0];let best:Pose='run',bw=0,bs=0;
 for(let i=0;i<P.length;i++){const p=P[i],next=P[i+1]?.t??Infinity,end=p.hold!=null?Math.min(p.t+p.hold,next):next;
  const w=clamp((t-(p.t-.12))/.18)*(1-clamp((t-(end-.04))/.18));if(w>bw){bw=w;best=p.pose;bs=p.t;}}
 return[best,easeIO(bw),bs];
}
type Fig={x:number;y:number;role:Actor['role'];S:number;f:number;p:PoseP;phase:number;pose:Pose;w:number;start:number;head:Pt;foot:Pt;speed:number};
const tmpA:Pt=[0,0],tmpB:Pt=[0,0];
function figureOf(a:Actor,t:number,zoomComp:number,ballX:number):Fig{
 const [x,y]=sampleTrack(a.track,t,[0,0]);sampleTrack(a.track,t-.12,tmpA);sampleTrack(a.track,t+.12,tmpB);
 const vx=(tmpB[0]-tmpA[0])/.24,vy=(tmpB[1]-tmpA[1])/.24,speed=Math.hypot(vx,vy);
 const [pose,w,start]=poseAt(a,t),target=POSES[pose];
 let f=Math.abs(vx)>25?Math.sign(vx):(ballX>=x?1:-1);if(pose==='dive-left')f=w>.05?-1:f;if(pose==='dive-right')f=w>.05?1:f;
 const p:PoseP={lift:lerp(0,target.lift,w),rot:lerp(0,target.rot,w),drop:lerp(0,target.drop,w),sy:lerp(1,target.sy,w),up:lerp(0,target.up,w),fwd:lerp(0,target.fwd,w),kick:lerp(0,target.kick,w),split:lerp(0,target.split,w),run:lerp(clamp(speed/110),0,w)};
 if(pose==='celebrate')p.lift+=w*6*Math.abs(Math.sin(t*8));
 p.rot+=(1-w)*clamp(Math.abs(vx)/900,0,.22);// lean into the run
 const S=(a.role==='star'?1.32:a.role==='keeper'?1.1:1)*zoomComp;
 const fig:Fig={x,y,role:a.role,S,f,p,phase:t*13+hash(a.id.length*31+a.id.charCodeAt(0),4)*6,pose,w,start,head:[0,0],foot:[0,0],speed};
 const hp=local(fig,1.5,-45),fp=local(fig,14,-12);fig.head[0]=hp[0];fig.head[1]=hp[1];fig.foot[0]=fp[0];fig.foot[1]=fp[1];
 return fig;
}
/** local figure point (facing +x, feet at 0, up −y) → world. */
function local(F:Fig,lx:number,ly:number):Pt{
 const p=F.p,r=p.rot*F.f,c=Math.cos(r),s=Math.sin(r),px=lx*F.f,py=-18+(ly+18)*p.sy;// stretch about the hip
 const dx=px,dy=py+18,rx=dx*c-dy*s,ry=dx*s+dy*c;
 return[F.x+rx*F.S,F.y+(ry-18+p.drop-p.lift)*F.S];
}
/** Body path: legs, arms (capsules), torso ellipse, head disc. grow = extra radius for halos/outlines. */
function bodyPath(F:Fig,grow:number):Path2D{
 const p=F.p,path=new Path2D(),S=F.S,g=grow/S,ph=F.phase,sn=Math.sin(ph),cs=Math.cos(ph),run=p.run;
 const hip=local(F,0,-19);
 // legs
 let ax=sn*8*run,ay=-Math.max(0,cs)*5*run,bx=-sn*8*run,by=-Math.max(0,-cs)*5*run;
 if(run<.05){ax=3;ay=0;bx=-3;by=0;}
 ax=lerp(ax,14,p.kick);ay=lerp(ay,-14,p.kick);bx=lerp(bx,-3,p.kick);
 ax=lerp(ax,20,p.split);ay=lerp(ay,-3,p.split);bx=lerp(bx,-8,p.split);by=lerp(by,-1,p.split);
 const fa=local(F,ax,ay),fb=local(F,bx,by);
 capsule(path,hip[0],hip[1],fb[0],fb[1],(3.1+g)*S);capsule(path,hip[0],hip[1],fa[0],fa[1],(3.3+g)*S);
 // arms
 const sh=local(F,0,-34);let hx=-sn*7*run+2,hy=-20,ix=sn*7*run-1,iy=-21;
 hx=lerp(hx,8,p.up);hy=lerp(hy,-52,p.up);ix=lerp(ix,-6,p.up);iy=lerp(iy,-51,p.up);
 const ha=local(F,hx,hy),hb=local(F,ix,iy);capsule(path,sh[0],sh[1],ha[0],ha[1],(2.4+g)*S);capsule(path,sh[0],sh[1],hb[0],hb[1],(2.4+g)*S);
 // torso + head
 const tc=local(F,0,-27),rot=p.rot*F.f;path.moveTo(tc[0]+(8.6+g)*S,tc[1]);path.ellipse(tc[0],tc[1],(8.6+g)*S,(11.8+g)*S*p.sy,rot,0,TAU);
 const hd=F.head;path.moveTo(hd[0]+(7.6+g)*S,hd[1]);path.arc(hd[0],hd[1],(7.6+g)*S,0,TAU);
 return path;
}

// ---------------------------------------------------------------- GOAL! letters (shapes, not text)
const LETTERS:Pt[][][]=[
 [[[.62,.2],[.47,.04],[.2,.04],[.05,.25],[.05,.75],[.2,.96],[.47,.96],[.62,.8],[.62,.56],[.36,.56]]],
 [[[.34,.04],[.1,.14],[.04,.5],[.1,.86],[.34,.96],[.58,.86],[.64,.5],[.58,.14],[.34,.04]]],
 [[[.02,.98],[.33,.02],[.64,.98]],[[.16,.64],[.5,.64]]],
 [[[.08,.02],[.08,.97],[.58,.97]]],
 [[[.18,.03],[.18,.64]]],
];
function goalWord(s:Sheet,cx:number,cy:number,size:number,inks:Inks,u:number){
 const out=new Path2D(),inner=new Path2D(),adv=[.8,.8,.78,.7,.3],total=adv.reduce((a,b)=>a+b,0)*size,x0=cx-total/2,y0=cy-size/2,r=size*.1;
 let x=x0;LETTERS.forEach((strokes,i)=>{const wob=Math.sin(u*9+i*1.7)*size*.03;for(const st of strokes)for(let k=0;k+1<st.length;k++){const a=st[k],b=st[k+1];capsule(out,x+a[0]*size,y0+a[1]*size+wob,x+b[0]*size,y0+b[1]*size+wob,r*1.55);capsule(inner,x+a[0]*size,y0+a[1]*size+wob,x+b[0]*size,y0+b[1]*size+wob,r);}
  if(i===4){out.moveTo(x+.18*size+r*1.9,y0+.9*size+wob);out.arc(x+.18*size,y0+.9*size+wob,r*1.9,0,TAU);inner.moveTo(x+.18*size+r*1.25,y0+.9*size+wob);inner.arc(x+.18*size,y0+.9*size+wob,r*1.25,0,TAU);}
  x+=adv[i]*size;});
 s.save();s.translate(size*.07,size*.07);s.fill('navy',out);s.restore();// drop shadow
 s.knockout(out);s.fill(inks.star,inner);s.fill('navy',inner,.32);
}
function starBurst(n:number,cx:number,cy:number,r0:number,r1:number,seed:number,ry=1):Path2D{const p=new Path2D();for(let i=0;i<n*2;i++){const a=i/(n*2)*TAU-Math.PI/2,r=(i%2?r0:r1)*(i%2?1:.85+hash(i,seed)*.3),x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*ry;i?p.lineTo(x,y):p.moveTo(x,y);}p.closePath();return p;}

// ---------------------------------------------------------------- camera
type Cam={x:number;y:number;zoom:number;scale:number;hw:number;hh:number};
const camTmp:[number,number,number]=[0,0,0];
function cameraAt(s:Sheet,play:Play,g:FieldGeo,t:number):Cam{
 const aspect=s.W/s.H;let x:number,y:number,zoom:number;
 if(play.camera&&play.camera.length){
  if(play.camera.length===1){[,x,y,zoom]=play.camera[0];}
  else{const v=keyPath(t,play.camera as unknown as Key[],linear);x=v[0];y=v[1];zoom=v[2]||1;}
 }else{
  // follow the ball (a weighted window around t, so the camera leads a little and never jerks at a kick)
  let sx=0,sy=0,sw=0;const W=[1,2,3,3,2];const offs=[-.36,-.18,0,.18,.36];
  for(let i=0;i<5;i++){const b=sampleBall(play.ball,clamp(t+offs[i],0,play.duration),camTmp);sx+=b[0]*W[i];sy+=(b[1]-b[2]*.4)*W[i];sw+=W[i];}
  x=sx/sw;y=sy/sw-g.len*.045;
  zoom=g.zoom*(1+.08*easeIO(clamp((t-play.duration*.68)/(play.duration*.3))));
  const hh=450/zoom,near=clamp(((g.len*.5)-y)/(g.len*.3)),goalTop=-g.depth-g.bar;
  y=lerp(y,Math.min(y,hh*.8+goalTop),easeIO(near));// keep the goal in view as the ball gets close
  x*=.85;
 }
 zoom=Math.max(.3,zoom);const hh=450/zoom,hw=hh*aspect;
 if(!play.camera?.length){x=clamp(x,-Math.max(0,g.w+50-hw),Math.max(0,g.w+50-hw));y=clamp(y,hh-150,Math.max(hh-150,g.len+60-hh));}
 return{x,y,zoom,scale:s.H/900*zoom,hw,hh};
}

// ---------------------------------------------------------------- frame
let lastError:unknown=null;
/** The last error swallowed by renderPlayFrame (the frame still prints). For tests and dev tools. */
export const playRenderError=()=>lastError;
const nearestActor=(play:Play,x:number,y:number,t:number):Actor|null=>{let best:Actor|null=null,bd=Infinity;const p:Pt=[0,0];for(const a of play.actors){sampleTrack(a.track,t,p);const d=Math.hypot(p[0]-x,p[1]-y)-(a.role==='star'?30:0);if(d<bd){bd=d;best=a;}}return bd<140?best:null;};

/** Draw one complete frame of `play` at time t (seconds) into ctx; width/height in css px, dpr = device pixel ratio. */
export function renderPlayFrame(ctx:CanvasRenderingContext2D,width:number,height:number,dpr:number,play:Play,t:number,look:PlayLook):void{
 const inks=inksFor(look||{starInk:'#e98acb'});
 const s=acquireSheet(ctx,Math.max(1,width),Math.max(1,height),dpr||1,inks.spec);
 // the card window is all art: aim the camera at the canvas centre, no story safe-region fit
 s.cx=s.W/2;s.cy=s.H/2;s.fit=1;s.arrival=1;
 const dur=Math.max(.1,play?.duration||6),T=clamp(Number.isFinite(t)?t:0,0,dur);
 try{drawFrame(s,play,T,dur,inks);lastError=null;}
 catch(error){lastError=error;if(typeof process!=='undefined'&&process.env?.NODE_ENV!=='production')console.warn('iconic play frame failed',error);}
 // registration drift: plates slide slowly between two seeded offsets (a pure function of t)
 const k=T/2.6,i=Math.floor(k);s._passage.blend={p:k-i};
 s.press(17+i);s._passage.blend=undefined;
}

function drawFrame(s:Sheet,play:Play,t:number,dur:number,inks:Inks){
 const g=geometry(play.field==='court'?'court':'pitch'),court=play.field==='court';
 const cam=cameraAt(s,play,g,t);s.camera(cam.x,cam.y,cam.scale);
 const vx0=cam.x-cam.hw-60,vx1=cam.x+cam.hw+60,vy0=cam.y-cam.hh-80,vy1=cam.y+cam.hh+80,inView=(x:number,y:number,m=0)=>x>vx0-m&&x<vx1+m&&y>vy0-m&&y<vy1+m;
 const zoomComp=clamp(Math.pow(g.zoom/cam.zoom,.5),.8,1.45);

 // ---- ground: stand + crowd behind the goal, surround, pitch/court field, stripes, chalk
 s.field('blue',.2,.6);
 const netTop=-g.depth-g.bar*.85;
 if(vy0<netTop-20){s.tone('navy',g.stand,.32);s.tone('opp',g.stand,.2);s.fill('navy',crowd(court?'court':'pitch',g),.6);}
 s.save();s.clip(g.pitch);
 if(court){s.field('yellow',.88,.7);s.field('opp',.2,.5);if(g.area)s.tone('blue',g.area,.45);s.tone('opp',g.stripes,.1);}
 else{s.field('yellow',.88,.6);s.field('blue',.45,.6);s.tone('blue',g.stripes,.2);}
 s.restore();
 s.knockout(g.chalk,.94);s.knockout(g.spots);

 // ---- ball state
 const b=sampleBall(play.ball,t,[0,0,0]),bp=sampleBall(play.ball,Math.max(0,t-.05),[0,0,0]),bn=sampleBall(play.ball,Math.min(dur,t+.05),[0,0,0]);
 const bvx=(bn[0]-bp[0])/.1,bvy=(bn[1]-bp[1])/.1,bvh=(bn[2]-bp[2])/.1,bSpeed=Math.hypot(bvx,bvy,bvh);
 const R=(court?7.5:8.5)*zoomComp,ballX=b[0],ballY=b[1]-b[2];

 // ---- the goal: net, bulge on a goal, frame
 const netEv=play.events.find(e=>e.kind==='net'&&t>=e.t);
 s.tone('navy',g.net,.2);
 s.save();s.clip(g.net);s.stroke('navy',g.netGrid,1.1,.75);s.restore();
 if(netEv){const u=t-netEv.t,bx=clamp(netEv.x,-g.goal+14,g.goal-14),grow=easeOutBack(clamp(u/.3)),wob=Math.exp(-u*3)*Math.sin(u*22);
  const r=(g.goal*.34)*grow*(1+.12*wob),cy=netTop-r*.35+wob*3;
  const bulge=new Path2D();bulge.ellipse(bx,cy,r*1.25,r*.9,0,0,TAU);
  s.knockout(bulge,.45);s.tone('navy',bulge,.45);
  s.save();s.clip(bulge);s.translate(bx,cy);s.scale(1.25,1.25);s.translate(-bx,-cy);s.stroke('navy',g.netGrid,1.1);s.restore();
  if(u<1.3)ripple(s,'navy',bx,cy,r*.9,3,{width:2.6,progress:clamp(u/.9),seed:3,cov:1-clamp((u-.8)/.5)});
 }
 s.fill('navy',g.posts);s.knockout(g.postsIn);

 // ---- the killer-pass lane (a dashed ink lane the ball follows)
 if(play.lane&&t>=play.lane.from-.7&&t<=play.lane.to+1){
  const L=play.lane,pts:Pt[]=[],N=14,tmp:[number,number,number]=[0,0,0];for(let i=0;i<=N;i++){const bb=sampleBall(play.ball,L.from+(L.to-L.from)*i/N,tmp);pts.push([bb[0],bb[1]]);}
  const reveal=easeOut(clamp((t-(L.from-.7))/.6)),fade=1-clamp((t-L.to-.4)/.6);
  if(reveal>0&&fade>0){const q=reveal>=1?pts:pts.slice(0,Math.max(2,Math.ceil(pts.length*reveal)));
   const gaps:[number,number][]=[];for(let k=0;k<9;k++)gaps.push([(k+.62)/9.2,(k+1)/9.2]);
   s.fill('navy',ribbon(q,5.5,{seed:21,pressure:.3,taper:.2,wobble:1,gaps}),fade>.6?1:.6);
   if(reveal>=1){const e=pts[N],d=pts[N-2],a=Math.atan2(e[1]-d[1],e[0]-d[0]),h=18,tip=new Path2D();tip.moveTo(e[0]+Math.cos(a)*6,e[1]+Math.sin(a)*6);tip.lineTo(e[0]-Math.cos(a)*h+Math.cos(a+Math.PI/2)*h*.6,e[1]-Math.sin(a)*h+Math.sin(a+Math.PI/2)*h*.6);tip.lineTo(e[0]-Math.cos(a)*h+Math.cos(a-Math.PI/2)*h*.6,e[1]-Math.sin(a)*h+Math.sin(a-Math.PI/2)*h*.6);tip.closePath();s.fill('navy',tip,fade>.6?1:.6);}
  }
 }

 // ---- figures (shadows first, then bodies back-to-front)
 const figs:Fig[]=[];
 for(const a of play.actors){if(!a.track?.length)continue;const F=figureOf(a,t,zoomComp,ballX);if(!inView(F.x,F.y,60))continue;figs.push(F);}
 figs.sort((p,q)=>p.y-q.y);
 const shadows=new Path2D();
 for(const F of figs){const lie=Math.abs(Math.sin(F.p.rot)),k=1-clamp(F.p.lift/70)*.45,rx=(12+lie*16)*F.S*k,ry=4.6*F.S*k,cx=F.x+Math.sin(F.p.rot*F.f)*lie*10*F.S;shadows.moveTo(cx+rx,F.y+1);shadows.ellipse(cx,F.y+1,rx,ry,0,0,TAU);}
 {const k=1-clamp(b[2]/90)*.55,rx=R*1.05*k,ry=R*.42*k;shadows.moveTo(b[0]+rx,b[1]+1);shadows.ellipse(b[0],b[1]+1,rx,ry,0,0,TAU);}
 s.tone('navy',shadows,.6);
 for(const F of figs){
  if(F.role==='star'){const ring=new Path2D(),rx=22*F.S,ry=8*F.S;ring.ellipse(F.x,F.y+1,rx,ry,0,0,TAU);s.knockout(ring);const inner=new Path2D();inner.ellipse(F.x,F.y+1,rx-3.2*F.S,ry-2.6*F.S,0,0,TAU);s.fill(inks.star,inner,.6);}
  const ink=F.role==='star'?inks.star:F.role==='mate'?inks.mate:F.role==='opp'?inks.opp:'yellow';
  s.knockout(bodyPath(F,F.role==='star'?4.2:2.2));
  if(F.role==='keeper'){s.fill('navy',bodyPath(F,1.6));const body=bodyPath(F,0);s.knockout(body);s.fill('yellow',body);}
  else s.fill(ink,bodyPath(F,0));
  if(F.role==='star'){const sh=new Path2D();sh.arc(F.head[0]+2*F.S*F.f,F.head[1]-2*F.S,2.4*F.S,0,TAU);s.knockout(sh,.7);}// a glint so the star's head reads round
  // pose accents
  if(F.pose==='head'&&F.w>.4&&t-F.start<.5)sparkBurst(s,'navy',F.head[0],F.head[1],20*F.S,{n:8,g:easeOut(clamp((t-F.start+.05)/.3)),seed:5,width:3});
  if(F.pose==='slide'&&F.w>.3)dust(s,null,F.x-F.f*14*F.S,F.y-2,16*F.S,14,{seed:7+Math.floor(t*12),size:3.2});
  if(F.pose==='kick'&&F.w>.5&&t-F.start<.35){const p=new Path2D(),fx=F.foot[0],fy=F.foot[1];p.addPath(ribbon([[fx-F.f*16*F.S,fy+10*F.S],[fx-F.f*4*F.S,fy+2*F.S],[fx+F.f*2*F.S,fy-6*F.S]],3,{seed:9,taper:.9,wobble:.4}));s.fill('navy',p);}
 }

 // ---- ball: fading trail after a fast strike, speed lines, the ball itself
 if(bSpeed>420&&inView(b[0],b[1],80)){
  const pts:Pt[]=[],tmp:[number,number,number]=[0,0,0];for(let i=6;i>=0;i--){const q=sampleBall(play.ball,Math.max(0,t-i*.045),tmp);pts.push([q[0],q[1]-q[2]]);}
  if(Math.hypot(pts[6][0]-pts[0][0],pts[6][1]-pts[0][1])>R*2){s.knockout(ribbon(pts,R*1.2,{seed:13,taper:1,pressure:.2,wobble:.5}),.75);
   speedLines(s,'navy',ballX,ballY,Math.atan2(bvy-bvh,bvx),{n:5,len:40,spread:R*1.4,width:2.4,seed:3+Math.floor(t*12)%4});}
 }
 if(inView(b[0],ballY,40))footballPanels(s,ballX,ballY,R,{rot:(b[0]*.05+b[1]*.06)%TAU,key:'navy',shadow:'blue',seed:4});

 // ---- events
 for(const e of play.events)drawEvent(s,play,e,t,inks,zoomComp,inView);

 // ---- GOAL! splash + confetti in screen space
 if(netEv){const u=t-netEv.t-.1;if(u>0){
  s.camera(s.W/2,s.H/2,1);
  const fall=u*170,bw=s.W,top=-40;
  for(let k=0;k<2;k++)confetti(s,[inks.star,'yellow','opp','paper'],[0,top+((fall*(1+k*.4))%(s.H*1.1))-s.H*.5,bw,s.H*.9],22,31+k,{size:22});
  const pop=easeOutBack(clamp(u/.35)),cx=s.W/2,cy=s.H*.3,size=150*pop;
  if(size>4){s.fill('yellow',starBurst(14,cx,cy,size*1.25,size*1.95,7,.62));s.save();s.translate(size*.06,size*.06);s.fill('opp',starBurst(14,cx,cy,size*1.25,size*1.95,7,.62),.45);s.restore();goalWord(s,cx,cy,size,inks,u);}
 }}
}

function drawEvent(s:Sheet,play:Play,e:PlayEvent,t:number,inks:Inks,zc:number,inView:(x:number,y:number,m?:number)=>boolean){
 const u=t-e.t;if(u<0)return;
 const life=e.kind==='net'?0:e.kind==='whistle'?.4:e.kind==='burst'?.5:e.kind==='speed'?.7:e.kind==='trick'?.8:.9;if(u>life)return;
 // effects that belong to a runner follow them
 let x=e.x,y=e.y;if(e.kind==='speed'||e.kind==='trick'){const a=nearestActor(play,e.x,e.y,e.t);if(a){const p=sampleTrack(a.track,t,[0,0]);x=p[0];y=p[1];}}
 if(!inView(x,y,80))return;
 const k=u/life;
 if(e.kind==='burst'){const d=new Path2D(),r=34*zc;d.arc(x,y-12,r*.42*easeOut(clamp(k*3))*(1-k*.5),0,TAU);s.knockout(d,.9);sparkBurst(s,'navy',x,y-12,r,{n:10,g:easeOut(clamp(k*2.2)),seed:11,width:4,cov:k>.7?.6:1});}
 else if(e.kind==='whistle')sparkBurst(s,'navy',x,y-20,18*zc,{n:7,g:easeOut(clamp(k*2)),seed:19,width:2.6});
 else if(e.kind==='shockwave')ripple(s,'navy',x,y,26*zc,3,{width:3.2,progress:clamp(k*1.3),seed:23,cov:k>.75?.6:1});
 else if(e.kind==='speed'){let dir=e.dir;if(dir==null){const a=nearestActor(play,e.x,e.y,e.t);if(a){const p=sampleTrack(a.track,e.t-.1,[0,0]),q=sampleTrack(a.track,e.t+.1,[0,0]);dir=Math.atan2(q[1]-p[1],q[0]-p[0]);}else dir=-Math.PI/2;}
  speedLines(s,'navy',x,y-24*zc,dir,{n:6,len:48*zc,spread:22*zc,width:3,seed:29+Math.floor(t*12)%3,cov:k>.7?.6:1});}
 else if(e.kind==='trick'){// a curved arrow flourish that draws itself around the player
  const r=34*zc,a0=e.dir??-Math.PI*.9,sweep=Math.PI*1.45*easeOut(clamp(k*1.6)),pts:Pt[]=[],n=14,cy=y-24*zc;
  for(let i=0;i<=n;i++){const a=a0+sweep*i/n,rr=r*(1-.12*i/n);pts.push([x+Math.cos(a)*rr,cy+Math.sin(a)*rr*.7]);}
  if(pts.length>2&&sweep>.2){s.knockout(ribbon(pts,7,{seed:31,taper:.4,wobble:.6}));s.fill(inks.star,ribbon(pts,4,{seed:31,taper:.4,wobble:.6}));
   const e1=pts[n],e0=pts[n-1],a=Math.atan2(e1[1]-e0[1],e1[0]-e0[0]),h=11*zc,tip=new Path2D();tip.moveTo(e1[0]+Math.cos(a)*h*.7,e1[1]+Math.sin(a)*h*.7);tip.lineTo(e1[0]+Math.cos(a+2.4)*h,e1[1]+Math.sin(a+2.4)*h);tip.lineTo(e1[0]+Math.cos(a-2.4)*h,e1[1]+Math.sin(a-2.4)*h);tip.closePath();s.fill('navy',tip);}
 }
}
