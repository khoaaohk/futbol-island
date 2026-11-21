/**
 * Flick It rules (Nov 21 2026, docs/arcade-aaa/flickit-direction.md): the football flick game. Pure and seeded: no DOM, no three.js,
 * fixed 1/120 s steps, so the same flicks give the same level on every device (tests/flickit-core.cjs).
 *  - flickToShot: a finger path -> power (speed), aim (the swipe's first direction, through the camera), curl (how far the swipe
 *    turns), lift (length) and dip / float (speeding up / slowing down).
 *  - the ball: gravity, drag, a Magnus side force from the curl, a dip force, bounces.
 *  - targets are objects with cheap colliders (boxes, spheres, capsules, rings, open bins): bodies that fly and knock each other over,
 *    balloons, hoops, a swinging tyre, bins, a bell, shutters, a sign, a trolley, a crossbar, a goal with a keeper bot.
 *  - one flick's 2nd, 3rd... hit pays more (FK.mult) and tricks (curl, round the wall, over, bank, long range) pay once a flick.
 * World: the ball is kicked from the origin toward -z; x is right, y is up; metres. The ball is drawn toy-size (FK.R).
 */
export const FK={step:1/120,R:.22,g:11.5,drag:.010,magnus:.4,topK:.2,spinDecay:.3,vMin:9.5,vMax:26,pitchMin:.11,pitchMax:.6,
 /** the flick: the last `window` ms of the path; shorter than lenMin (of the screen's short side) is a tap, not a kick */
 window:280,lenMin:.07,lenLift:.18,lenFull:.8,speedMin:.9,speedFull:6.1,bendDead:.07,bendFull:.62,
 maxFlight:6.5,teeDelay:.55,settleMax:2.6,spare:150,curlMin:1,curlSpin:.25,dipTop:.25,assistYaw:.1,assistDist:1.7,longMin:20,nearDist:1.5,closeDist:.8,
 trick:{curl:150,around:250,over:200,bank:200,long:100},mult:[1,1.5,2,2.5,3,3.5,4],stars:[.3,.6,1],coinPer:1500,scoreMax:60_000} as const;

export const K={can:1,crate:2,bottle:3,cone:4,barrel:5,balloon:6,hoop:7,tyre:8,bin:9,bell:10,shutter:11,sign:12,trolley:13,bar:14,goal:15,keeper:16,wall:20,fence:21,block:22,post:23} as const;
export const KIND_NAME:Record<number,string>={1:'can',2:'crate',3:'bottle',4:'cone',5:'barrel',6:'balloon',7:'hoop',8:'tyre',9:'bin',10:'bell',11:'shutter',12:'whistle sign',13:'trolley',14:'crossbar',15:'goal',16:'keeper',20:'mannequin',21:'fence',22:'wall',23:'post'};
/** Collider class per kind: 0 body (knockable box), 1 balloon, 2 ring, 3 bin, 4 solid sphere, 5 scoring plate, 6 static box, 7 capsule, 8 goal mouth. */
const CLS:Record<number,number>={1:0,2:0,3:0,4:0,5:0,6:1,7:2,8:2,9:3,10:4,11:5,12:5,13:5,14:7,15:8,16:6,20:6,21:6,22:6,23:7};
/** Defaults per kind: half extents (ring: hx = radius, hy = tube; sphere: hx = radius), points, mass (ball = 1), tough (ball speed a body needs to move). */
export const SPEC:Record<number,{hx:number;hy:number;hz:number;pts:number;mass:number;tough:number;need:boolean}>={
 1:{hx:.16,hy:.2,hz:.16,pts:50,mass:.25,tough:0,need:true},2:{hx:.34,hy:.34,hz:.34,pts:80,mass:1.1,tough:0,need:true},3:{hx:.11,hy:.28,hz:.11,pts:70,mass:.2,tough:0,need:true},
 4:{hx:.18,hy:.24,hz:.18,pts:30,mass:.3,tough:0,need:false},5:{hx:.42,hy:.6,hz:.42,pts:150,mass:2.6,tough:14,need:true},6:{hx:.44,hy:.44,hz:.44,pts:60,mass:0,tough:0,need:true},
 7:{hx:.95,hy:.08,hz:.08,pts:200,mass:0,tough:0,need:true},8:{hx:.72,hy:.2,hz:.2,pts:300,mass:0,tough:0,need:true},9:{hx:.55,hy:.55,hz:.55,pts:250,mass:0,tough:0,need:true},
 10:{hx:.4,hy:.4,hz:.4,pts:200,mass:0,tough:0,need:true},11:{hx:.45,hy:.5,hz:.06,pts:120,mass:0,tough:0,need:true},12:{hx:.5,hy:.5,hz:.06,pts:150,mass:0,tough:0,need:true},
 13:{hx:.9,hy:.55,hz:.5,pts:180,mass:0,tough:0,need:true},14:{hx:.08,hy:.08,hz:.08,pts:120,mass:0,tough:0,need:false},15:{hx:3,hy:1.2,hz:.1,pts:300,mass:0,tough:0,need:true},
 16:{hx:.45,hy:.85,hz:.25,pts:0,mass:0,tough:0,need:false},20:{hx:.3,hy:.9,hz:.16,pts:0,mass:0,tough:0,need:false},21:{hx:4,hy:.8,hz:.06,pts:0,mass:0,tough:0,need:false},
 22:{hx:1,hy:.5,hz:.3,pts:0,mass:0,tough:0,need:false},23:{hx:.08,hy:.08,hz:.08,pts:0,mass:0,tough:0,need:false}};

export type Ent={id:number;k:number;cls:number;x:number;y:number;z:number;bx:number;by:number;bz:number;hx:number;hy:number;hz:number;
 /** capsule: the other end, as an offset from x,y,z */ex:number;ey:number;ez:number;yaw:number;pts:number;need:boolean;done:boolean;mass:number;tough:number;
 /** motion: 0 none, 1 slide on x, 2 pendulum (amp in radians, len = rope), 3 bob on y */mo:number;amp:number;w:number;ph:number;len:number;
 /** bodies: 0 standing, 1 flying, 2 settled; others: 1 once hit */st:number;vx:number;vy:number;vz:number;rot:number;rotV:number;ax:number;az:number;air:number;
 /** bodies: the ids this one stands on (-1 = the ground or a static thing) */s1:number;s2:number;
 /** last hit: time and ball speed (the view's wobble, ring, spin) */hitT:number;hitV:number;/** rings: which side the ball was on */side:number;tone:number};
type Opt=Partial<Pick<Ent,'hx'|'hy'|'hz'|'ex'|'ey'|'ez'|'yaw'|'pts'|'need'|'mo'|'amp'|'w'|'ph'|'len'|'s1'|'s2'|'tone'>>;
function mk(list:Ent[],k:number,x:number,y:number,z:number,o:Opt={}):number{const s=SPEC[k],id=list.length;
 list.push({id,k,cls:CLS[k],x,y,z,bx:x,by:y,bz:z,hx:o.hx??s.hx,hy:o.hy??s.hy,hz:o.hz??s.hz,ex:o.ex??0,ey:o.ey??0,ez:o.ez??0,yaw:o.yaw??0,pts:o.pts??s.pts,need:o.need??s.need,done:false,mass:s.mass,tough:s.tough,
  mo:o.mo??0,amp:o.amp??0,w:o.w??0,ph:o.ph??0,len:o.len??0,st:0,vx:0,vy:0,vz:0,rot:0,rotV:0,ax:1,az:0,air:0,s1:o.s1??-1,s2:o.s2??-1,hitT:-9,hitV:0,side:0,tone:o.tone??id%4});return id;}

/* ---- layout pieces ---- */
/** A pyramid of cans standing on `y0` (rows wide at the bottom). Every can above stands on the two below it. */
function pyramid(L:Ent[],x:number,y0:number,z:number,rows=3){let below:number[]=[];for(let r=0;r<rows;r++){const n=rows-r,row:number[]=[];for(let i=0;i<n;i++)row.push(mk(L,K.can,x+(i-(n-1)/2)*.36,y0+.2+r*.4,z,r?{s1:below[i],s2:below[i+1]}:{}));below=row;}}
/** A low wall or table with `n` things standing on it. */
function shelf(L:Ent[],k:number,x:number,z:number,hx:number,hy:number,n:number,hz=.22){mk(L,K.block,x,hy,z,{hx,hy,hz});const s=SPEC[k];for(let i=0;i<n;i++)mk(L,k,x+(n>1?(i/(n-1)-.5)*(hx*2-.5):0),hy*2+s.hy,z);}
/** A stack of crates: two side by side and one on top. */
function crates(L:Ent[],x:number,z:number){const a=mk(L,K.crate,x-.36,.34,z),b=mk(L,K.crate,x+.36,.34,z);mk(L,K.crate,x,1.02,z,{s1:a,s2:b});}
/** A goal: two posts, a crossbar, the mouth and (optionally) a keeper bot sliding along the line. */
function goal(L:Ent[],x:number,z:number,w:number,h:number,keeper:number,barNeed=false){mk(L,K.post,x-w/2,0,z,{ey:h});mk(L,K.post,x+w/2,0,z,{ey:h});mk(L,K.bar,x-w/2,h,z,{ex:w,need:barNeed,pts:barNeed?120:60});
 mk(L,K.goal,x,h/2,z,{hx:w/2,hy:h/2});if(keeper>0)mk(L,K.keeper,x,.85,z+.6,{mo:1,amp:w/2-.9,w:keeper});}
/** A wall of training mannequins. */
function wall(L:Ent[],x:number,z:number,n:number){for(let i=0;i<n;i++)mk(L,K.wall,x+(i-(n-1)/2)*.64,.9,z);}

export type StageDef={id:string;name:string;place:string;flicks:number;/** camera position, look-at point, vertical field of view on a phone */cam:{p:readonly [number,number,number];l:readonly [number,number,number];fov:number};
 /** aim help for young players: how strongly a near-enough kick is pulled onto a target (0..1) */assist:number;lesson:string;build(L:Ent[]):void};
export const STAGES:readonly StageDef[]=[
 {id:'garden',name:'Back Garden',place:'garden',flicks:6,cam:{p:[0,1.6,4.2],l:[0,1.1,-8],fov:54},assist:.7,lesson:'Pick one target. Swipe straight up through the ball: that is your laces.',build(L){
  mk(L,K.block,0,.35,-6.5,{hx:.75,hy:.35,hz:.4});pyramid(L,0,.7,-6.5,3);shelf(L,K.bottle,2.9,-9.5,1.3,.55,3);mk(L,K.bin,-2.5,.55,-6);
  mk(L,K.balloon,-1.5,2.2,-8.5,{mo:3,amp:.18,w:1.6});mk(L,K.balloon,1.5,2.7,-10.5,{mo:3,amp:.2,w:1.3,ph:2});mk(L,K.cone,-1.2,.24,-3.8);mk(L,K.cone,1.4,.24,-4.6);}},
 {id:'plaza',name:'Town Square',place:'plaza',flicks:6,cam:{p:[1.1,.8,3.8],l:[-.4,2.6,-10],fov:68},assist:.6,lesson:'A longer swipe lifts the ball. Follow through at your target.',build(L){
  mk(L,K.post,0,0,-13,{ey:3.7,hx:.1});mk(L,K.bell,0,4.2,-13);mk(L,K.hoop,-3,2.1,-8);mk(L,K.hoop,3.2,3,-10.5);shelf(L,K.can,-4.6,-11.5,.9,.45,3,.4);
  mk(L,K.trolley,0,.55,-15.5,{mo:1,amp:4,w:.8});mk(L,K.balloon,1.6,3.7,-16,{mo:3,amp:.2,w:1.4});mk(L,K.balloon,-1.7,3.2,-15,{mo:3,amp:.2,w:1.1,ph:1});mk(L,K.balloon,5,2.2,-13,{mo:3,amp:.2,w:1.7,ph:3});}},
 {id:'pitch',name:'Training Pitch',place:'pitch',flicks:7,cam:{p:[1.9,2,5],l:[-1.2,1,-10],fov:56},assist:.45,lesson:'Bend your swipe and the ball bends too. Curl it round the wall.',build(L){
  wall(L,-.6,-7,4);goal(L,-.8,-16,6.4,2.6,1.1,true);mk(L,K.tyre,-3.2,1.95,-15.4,{hx:.62});mk(L,K.tyre,1.6,1.95,-15.4,{hx:.62});shelf(L,K.can,-5.4,-10,.9,.4,3,.4);
  mk(L,K.cone,2.6,.24,-5);mk(L,K.cone,3.3,.24,-6.4);mk(L,K.cone,4,.24,-7.8);}},
 {id:'beach',name:'Palm Beach',place:'beach',flicks:7,cam:{p:[-1.5,4.9,5.5],l:[.7,.2,-9],fov:54},assist:.4,lesson:'Weight of shot: barrels need a fast swipe, the bin a soft one.',build(L){
  mk(L,K.barrel,-2.6,.6,-9);mk(L,K.barrel,3.1,.6,-12.5);mk(L,K.balloon,-.6,1.5,-6,{mo:3,amp:.12,w:1.5});mk(L,K.balloon,.2,1.8,-8.6,{mo:3,amp:.12,w:1.2,ph:1});mk(L,K.balloon,1.5,2,-11,{mo:3,amp:.12,w:1.6,ph:2});mk(L,K.balloon,3.3,1.9,-13.4,{mo:3,amp:.12,w:1.3,ph:3});
  crates(L,-4.2,-13);mk(L,K.tyre,.4,1.5,-16.5,{mo:2,amp:.55,w:1.5,len:3.2});mk(L,K.bin,5,.55,-8);}},
 {id:'roof',name:'Rooftop Cage',place:'roof',flicks:7,cam:{p:[1,3.1,6.4],l:[-.2,1.3,-12],fov:46},assist:.35,lesson:'Up and over the fence. Speed up your swipe at the end and the ball dips.',build(L){
  mk(L,K.fence,0,.8,-5.5,{hx:4.2,hy:.8});mk(L,K.block,-4,1.3,-17,{hx:1.8,hy:1.3,hz:1.2});mk(L,K.shutter,-4.8,1.55,-15.72);mk(L,K.shutter,-3.2,1.55,-15.72);
  mk(L,K.post,3.6,0,-14,{ey:2.1,hx:.07});mk(L,K.sign,3.6,2.6,-14);shelf(L,K.bottle,.2,-20,2.2,.6,4);mk(L,K.hoop,1.3,2.7,-10);mk(L,K.post,5.2,0,-19,{ey:3,hx:.1});mk(L,K.bell,5.2,3.5,-19);}},
 {id:'stadium',name:'Island Stadium',place:'stadium',flicks:8,cam:{p:[-.7,1.25,4.7],l:[.2,1.7,-12],fov:64},assist:.3,lesson:'Everything you know: pick it, weight it, bend it.',build(L){
  wall(L,-.2,-8,5);goal(L,0,-20,7.3,2.7,1.5);mk(L,K.tyre,-2.9,2.05,-19.4,{hx:.62});mk(L,K.tyre,2.9,2.05,-19.4,{hx:.62});mk(L,K.trolley,0,.55,-13.5,{mo:1,amp:5,w:.9});
  mk(L,K.balloon,-1.5,4,-18,{mo:3,amp:.2,w:1.4});mk(L,K.balloon,0,4.5,-18.5,{mo:3,amp:.2,w:1.2,ph:1});mk(L,K.balloon,1.5,4,-18,{mo:3,amp:.2,w:1.6,ph:2});
  mk(L,K.barrel,-6,.6,-12);mk(L,K.barrel,6,.6,-15);mk(L,K.post,-5.4,0,-21,{ey:3.4,hx:.1});mk(L,K.bell,-5.4,3.9,-21);}},
];

/* ---- seeded numbers ---- */
export function hashSeed(s:string){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return 1+h%2_000_000_000;}
export const flickitDailySeed=(day:string)=>hashSeed('flickit:'+day);
const lcg=(seed:number)=>{let r=seed>>>0||1;return()=>{r=(Math.imul(r,1664525)+1013904223)>>>0;return r/4294967296;};};
/** The Daily Flick: one stage built from the day's seed. A place and its camera, five groups of targets in shuffled lanes, seven flicks. */
export function dailyStage(seed:number):StageDef{
 const rnd=lcg(seed),base=STAGES[Math.floor(rnd()*STAGES.length)],lanes=[-5,-2.5,0,2.5,5],kinds=[0,1,2,3,4,5,6,7,8,9];
 for(let i=lanes.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[lanes[i],lanes[j]]=[lanes[j],lanes[i]];}
 for(let i=kinds.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[kinds[i],kinds[j]]=[kinds[j],kinds[i]];}
 const picks=kinds.slice(0,5),zs=lanes.map(()=>-(7+rnd()*11)),hs=lanes.map(()=>rnd()),wallAt=rnd()<.5?Math.floor(rnd()*5):-1;
 return {id:'daily',name:'Daily Flick',place:base.place,flicks:7,cam:base.cam,assist:.4,lesson:'Same targets for everyone today. Seven flicks.',build(L){
  for(let i=0;i<5;i++){const x=lanes[i],z=zs[i],h=hs[i];switch(picks[i]){
   case 0:mk(L,K.block,x,.35,z,{hx:.75,hy:.35,hz:.4});pyramid(L,x,.7,z,3);break;
   case 1:shelf(L,K.bottle,x,z,1.2,.5+h*.3,3);break;
   case 2:mk(L,K.bin,x,.55,z);break;
   case 3:mk(L,K.hoop,x,1.8+h*1.4,z);break;
   case 4:mk(L,K.post,x,0,z,{ey:2.6+h,hx:.1});mk(L,K.bell,x,3.1+h,z);break;
   case 5:for(let j=0;j<3;j++)mk(L,K.balloon,x+(j-1)*.9,1.6+h*1.6+j*.35,z-j*1.4,{mo:3,amp:.15,w:1.2+j*.2,ph:j});break;
   case 6:mk(L,K.barrel,x,.6,z);break;
   case 7:mk(L,K.trolley,x,.55,z,{mo:1,amp:2.2,w:.9+h*.4});break;
   case 8:mk(L,K.tyre,x,1.4+h*.5,z,{mo:2,amp:.5,w:1.5,len:3});break;
   default:crates(L,x,z);}
   if(i===wallAt&&z<-9)wall(L,x*.6,-5.5,3);}}};
}

/* ---- the flick ---- */
export type Pt={x:number;y:number;t:number};
/** yaw: the camera's heading (0 = looking down -z). gain / off: how a screen angle becomes a ground angle for this camera (the view
 *  measures them: gain = (ball's screen y - horizon y) / focal length, off = (ball's screen x - centre) / focal length). */
export type FlickCam={yaw:number;gain:number;off:number};
export type Shot={power:number;yaw:number;pitch:number;spin:number;top:number};
const clamp=(v:number,a:number,b:number)=>v<a?a:v>b?b:v,c01=(v:number)=>v<0?0:v>1?1:v;
const wrap=(a:number)=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a;};
/** The short side a swipe is measured against (a phone's width; on a wide screen, part of its height). */
export const flickScale=(w:number,h:number)=>Math.min(w,h*.62);
export function flickToShot(path:readonly Pt[],vp:{w:number;h:number},cam:FlickCam):Shot|null{
 const n=path.length;if(n<2)return null;const end=path[n-1];let i0=0;for(let i=n-2;i>=0;i--)if(end.t-path[i].t>FK.window){i0=i+1;break;}
 if(i0>=n-1)i0=n-2;const p0=path[i0],S=flickScale(vp.w,vp.h),dx=end.x-p0.x,up=p0.y-end.y,len=Math.hypot(dx,up)/S;
 if(len<FK.lenMin||up<=Math.abs(dx)*.15)return null;// a tap, or a swipe that does not go up the screen
 const dt=Math.max(.03,(end.t-p0.t)/1000),power=Math.pow(c01((len/dt-FK.speedMin)/(FK.speedFull-FK.speedMin)),.85);
 // the first and the last part of the path (by distance): where it starts, where it ends up heading, how fast each was
 let total=0;for(let i=i0+1;i<n;i++)total+=Math.hypot(path[i].x-path[i-1].x,path[i].y-path[i-1].y);
 let acc=0,a=p0,b=end,ta=p0.t,tb=end.t;for(let i=i0+1;i<n;i++){const seg=Math.hypot(path[i].x-path[i-1].x,path[i].y-path[i-1].y),was=acc;acc+=seg;
  if(was<total*.4&&acc>=total*.4){a=path[i];ta=path[i].t;}if(was<total*.6&&acc>=total*.6){b=path[i-1];tb=path[i-1].t;}}
 let a0=Math.atan2(dx,up),a1=a0,top=0;
 if(n-i0>=4&&total>0){const d0=Math.hypot(a.x-p0.x,a.y-p0.y),d1=Math.hypot(end.x-b.x,end.y-b.y);
  if(d0>2&&d1>2){a0=Math.atan2(a.x-p0.x,p0.y-a.y);a1=Math.atan2(end.x-b.x,b.y-end.y);
   const v0=d0/Math.max(8,ta-p0.t),v1=d1/Math.max(8,end.t-tb),r=v1/v0;top=r>1.3?c01((r-1.3)/1.2):r<.75?-c01((.75-r)/.5):0;}}
 const bend=wrap(a1-a0),spin=Math.sign(bend)*c01((Math.abs(bend)-FK.bendDead)/(FK.bendFull-FK.bendDead));
 const yaw=cam.yaw+Math.atan(cam.off+cam.gain*Math.tan(clamp(a0,-1.25,1.25)));
 const pitch=FK.pitchMin+(FK.pitchMax-FK.pitchMin)*Math.pow(c01((len-FK.lenLift)/(FK.lenFull-FK.lenLift)),1.1);
 return {power,yaw,pitch,spin,top};
}
/** The reverse, for the ghost finger on the first shots: the straight swipe (screen px from the ball's place) that makes this shot. */
export function shotToSwipe(s:Shot,vp:{w:number;h:number},cam:FlickCam){const S=flickScale(vp.w,vp.h),th=Math.atan((Math.tan(clamp(s.yaw-cam.yaw,-1.2,1.2))-cam.off)/cam.gain);
 const len=(FK.lenLift+(FK.lenFull-FK.lenLift)*Math.pow(c01((s.pitch-FK.pitchMin)/(FK.pitchMax-FK.pitchMin)),1/1.1))*S,speed=FK.speedMin+(FK.speedFull-FK.speedMin)*Math.pow(c01(s.power),1/.85);
 return {dx:Math.sin(th)*len,dy:-Math.cos(th)*len,ms:Math.max(60,len/S/speed*1000)};}
/** Which part of the foot makes this kick (a right-footed player): the lesson's words. */
export const footFor=(s:Shot):'laces'|'inside'|'outside'=>Math.abs(s.spin)<.2?'laces':s.spin<0?'inside':'outside';
export const shotSpeed=(power:number)=>FK.vMin+(FK.vMax-FK.vMin)*c01(power);

/* ---- the ball in the air (shared by the game, the aim ghost and the solver) ---- */
export type Ball={x:number;y:number;z:number;vx:number;vy:number;vz:number;spin:number;top:number;t:number};
export function launch(b:Ball,s:Shot){const v=shotSpeed(s.power),c=Math.cos(s.pitch);b.x=0;b.y=FK.R;b.z=0;b.vx=Math.sin(s.yaw)*c*v;b.vy=Math.sin(s.pitch)*v;b.vz=-Math.cos(s.yaw)*c*v;b.spin=s.spin;b.top=s.top;b.t=0;}
/** One step of flight: gravity, drag, curl (toward the ball's right when spin > 0), dip (top > 0) or float. No collisions. */
export function flyStep(b:Ball,h:number){const sp=Math.hypot(b.vx,b.vy,b.vz),hv=Math.hypot(b.vx,b.vz)||1e-6,k=FK.drag*sp,m=FK.magnus*b.spin*sp;
 b.vx+=(-k*b.vx+m*(-b.vz/hv))*h;b.vz+=(-k*b.vz+m*(b.vx/hv))*h;b.vy+=(-FK.g-k*b.vy-(b.y>FK.R+.02?FK.topK*b.top*sp:0))*h;
 b.x+=b.vx*h;b.y+=b.vy*h;b.z+=b.vz*h;b.spin*=1-FK.spinDecay*h;b.t+=h;}
const PB:Ball={x:0,y:0,z:0,vx:0,vy:0,vz:0,spin:0,top:0,t:0};
/** The flight's first points for the aim ghost (no collisions; stops at the ground). Returns how many points were written (xyz each). */
export function predict(s:Shot,out:Float32Array,every=6){launch(PB,s);let n=0;const max=Math.floor(out.length/3);for(let i=0;n<max&&i<900;i++){if(i%every===0){out[n*3]=PB.x;out[n*3+1]=PB.y;out[n*3+2]=PB.z;n++;}flyStep(PB,FK.step);if(PB.y<FK.R&&PB.vy<0)break;}return n;}
/** Closest the ball's centre comes to a point (optionally only while falling: a bin wants the ball coming down). */
export function closest(s:Shot,x:number,y:number,z:number,falling=false,blocks?:readonly Ent[]){launch(PB,s);let best=1e9;for(let i=0;i<780;i++){flyStep(PB,FK.step);if(PB.y<FK.R&&PB.vy<0)break;
  if(blocks){let hit=false;for(const q of blocks)if(q.cls===6&&q.k!==K.keeper&&boxHit(PB.x,PB.y,PB.z,FK.R,q.x,q.y,q.z,q.hx,q.hy,q.hz)){hit=true;break;}if(hit)break;}if(falling&&(PB.vy>-2||Math.abs(PB.y-y)>.14))continue;const d=Math.hypot(PB.x-x,PB.y-y,PB.z-z);if(d<best)best=d;else if(d>best+3)break;}return best;}
/** A straight kick that reaches a target: the ghost on the first shots and the test bots. Null when no straight kick gets near. */
export function solveShot(e:Pick<Ent,'k'|'cls'|'x'|'y'|'z'|'hx'|'hy'|'ex'|'ey'|'tough'>,spin=0,blocks?:readonly Ent[]):Shot|null{
 const falling=e.cls===3,tx=e.x+e.ex/2,ty=falling?e.y+e.hy:e.k===K.goal?e.y*.8:e.y+e.ey/2,tz=e.z,w0=e.tough>0?7:0,y0=Math.atan2(tx,-tz);let best:Shot|null=null,bd=falling?.3:e.cls===2?e.hx*.45:Math.max(.2,Math.min(e.hx,e.hy)*.9);
 for(let pi=0;pi<15;pi++)for(let wi=w0;wi<13;wi++)for(let yi=-3;yi<=3;yi++){const s:Shot={power:.2+wi*.066,yaw:y0+yi*.02-spin*.16,pitch:FK.pitchMin+pi*.035,spin,top:0},d=closest(s,tx,ty,tz,falling,blocks);if(d<bd){bd=d;best=s;}}
 return best;}

/* ---- collisions (results in N: the push direction out of the thing, and how deep) ---- */
const N={x:0,y:0,z:0,d:0};
function boxHit(px:number,py:number,pz:number,r:number,cx:number,cy:number,cz:number,hx:number,hy:number,hz:number){const dx=px-cx,dy=py-cy,dz=pz-cz,nx=dx-clamp(dx,-hx,hx),ny=dy-clamp(dy,-hy,hy),nz=dz-clamp(dz,-hz,hz),d2=nx*nx+ny*ny+nz*nz;if(d2>r*r)return false;
 if(d2>1e-9){const d=Math.sqrt(d2);N.x=nx/d;N.y=ny/d;N.z=nz/d;N.d=r-d;return true;}
 const ox=hx-Math.abs(dx),oy=hy-Math.abs(dy),oz=hz-Math.abs(dz);N.x=N.y=N.z=0;if(ox<=oy&&ox<=oz){N.x=dx<0?-1:1;N.d=ox+r;}else if(oy<=oz){N.y=dy<0?-1:1;N.d=oy+r;}else{N.z=dz<0?-1:1;N.d=oz+r;}return true;}
function capHit(px:number,py:number,pz:number,r:number,e:Ent){const l2=e.ex*e.ex+e.ey*e.ey+e.ez*e.ez,t=l2>0?c01(((px-e.x)*e.ex+(py-e.y)*e.ey+(pz-e.z)*e.ez)/l2):0,nx=px-e.x-e.ex*t,ny=py-e.y-e.ey*t,nz=pz-e.z-e.ez*t,d2=nx*nx+ny*ny+nz*nz,R=r+e.hx;
 if(d2>R*R||d2<1e-9)return false;const d=Math.sqrt(d2);N.x=nx/d;N.y=ny/d;N.z=nz/d;N.d=R-d;return true;}

export type FlickEvent={type:'kick'|'hit'|'trick'|'bounce'|'ping'|'block'|'weak'|'saved'|'pop'|'near'|'close'|'miss'|'tee'|'level'|'stage'|'goal'|'net'|'fall';id:number;k:number;x:number;y:number;z:number;points:number;a:number;b:number;word:string};
export type FlickStats={flicks:number;scored:number;curls:number;arounds:number;overs:number;banks:number;longs:number;bestCombo:number;weak:number;blocked:number;saved:number;close:number;rims:number;power:number};
const noStats=():FlickStats=>({flicks:0,scored:0,curls:0,arounds:0,overs:0,banks:0,longs:0,bestCombo:0,weak:0,blocked:0,saved:0,close:0,rims:0,power:0});
export type FlickMode='tour'|'stage'|'daily';
export type FlickResult={stage:string;score:number;stars:number;cleared:boolean;spare:number;stats:FlickStats};
export type FlickOptions={mode:FlickMode;seed:number;/** 'stage': which one (0-5); 'tour': where it starts */stage?:number};
export type FlickState={mode:FlickMode;seed:number;ix:number;stage:StageDef;ents:Ent[];ball:Ball;phase:'tee'|'fly'|'wait'|'done';flicks:number;t:number;score:number;total:number;par:number;
 combo:number;shot:Shot;wait:number;stats:FlickStats;results:FlickResult[];over:boolean;/** this flick: touched something solid, went in the net, tricks paid */banked:boolean;netted:boolean;paid:number;scoredNow:boolean;nearId:number;minD:number;bounces:number;rolling:number;overs:number;netZ:number};
export type FlickIt=ReturnType<typeof createFlickIt>;
export const starsFor=(score:number,par:number)=>{let n=0;for(const f of FK.stars)if(score>=Math.round(par*f/10)*10)n++;return n;};
export const starScore=(par:number,star:number)=>Math.round(par*FK.stars[star-1]/10)*10;
export const flickCoins=(points:number)=>Math.floor(Math.max(0,points)/FK.coinPer);
const WORDS=['','DOUBLE!','TRIPLE!','FOUR!','FIVE!','SIX!','MEGA!'];

export function createFlickIt(o:FlickOptions){
 const rnd=lcg(o.seed),queue:FlickEvent[]=[];
 const s:FlickState={mode:o.mode,seed:o.seed,ix:o.mode==='daily'?0:clamp(Math.floor(o.stage??0),0,STAGES.length-1),stage:STAGES[0],ents:[],ball:{x:0,y:FK.R,z:0,vx:0,vy:0,vz:0,spin:0,top:0,t:0},phase:'tee',flicks:0,t:0,score:0,total:0,par:0,
  combo:0,shot:{power:0,yaw:0,pitch:0,spin:0,top:0},wait:0,stats:noStats(),results:[],over:false,banked:false,netted:false,paid:0,scoredNow:false,nearId:-1,minD:1e9,bounces:0,rolling:0,overs:0,netZ:0};
 const emit=(type:FlickEvent['type'],e:{id:number;k:number;x:number;y:number;z:number}|null,points=0,a=0,b=0,word='')=>{queue.push({type,id:e?e.id:-1,k:e?e.k:0,x:e?e.x:s.ball.x,y:e?e.y:s.ball.y,z:e?e.z:s.ball.z,points,a,b,word});};
 function load(){const def=s.mode==='daily'?dailyStage(s.seed):STAGES[s.ix];s.stage=def;s.ents=[];def.build(s.ents);s.flicks=def.flicks;s.score=0;s.t=0;s.phase='tee';s.stats=noStats();s.combo=0;
  s.par=0;for(const e of s.ents)if(e.need)s.par+=e.pts;const b=s.ball;b.x=0;b.y=FK.R;b.z=0;b.vx=b.vy=b.vz=0;move(0);emit('stage',null,0,s.ix,def.flicks,def.name);}
 function move(t:number){for(const e of s.ents){if(!e.mo||(e.cls===5&&e.done))continue;const a=e.amp*Math.sin(e.w*t+e.ph);if(e.mo===1)e.x=e.bx+a;else if(e.mo===3)e.y=e.by+a;else{e.x=e.bx+e.len*Math.sin(a);e.y=e.by+e.len*(1-Math.cos(a));}}}

 /* scoring: the nth hit of one flick pays FK.mult[n-1]; tricks pay once a flick */
 function pay(e:Ent,pts=e.pts){const first=!e.done;e.done=true;e.hitT=s.t;if(pts<=0||!first)return;s.combo++;const n=s.combo,p=Math.round(pts*FK.mult[Math.min(n,FK.mult.length)-1]/10)*10;s.score+=p;s.scoredNow=true;
  if(n>s.stats.bestCombo)s.stats.bestCombo=n;emit('hit',e,p,n,first?1:0,WORDS[Math.min(n,WORDS.length)-1]);tricks(e);}
 function trick(bit:number,key:keyof typeof FK.trick,word:string,e:Ent){if(s.paid&bit)return;s.paid|=bit;const p=FK.trick[key];s.score+=p;const st=s.stats;if(key==='curl')st.curls++;else if(key==='around')st.arounds++;else if(key==='over')st.overs++;else if(key==='bank')st.banks++;else st.longs++;emit('trick',e,p,bit,0,word);}
 function tricks(e:Ent){const b=s.ball,sh=s.shot,hx=e.cls===8?b.x:e.x,hz=e.z,dist=Math.hypot(hx,hz);
  // curl: how far the hit is from the straight line the ball set off on
  const off=Math.abs(hx*Math.cos(sh.yaw)+hz*Math.sin(sh.yaw));if(Math.abs(sh.spin)>=FK.curlSpin&&off>=FK.curlMin)trick(1,'curl','CURLED IT!',e);
  // a wall or fence on the straight line from the spot to the hit: the ball went over it or round it
  for(const w of s.ents){if(w.k!==K.wall&&w.k!==K.fence)continue;if(w.z<hz+.3||w.z>-.5)continue;const t=w.z/hz,xAt=hx*t;if(Math.abs(xAt-w.x)>w.hx+.05)continue;
   if(s.overs>0){if(sh.top>=FK.dipTop)trick(4,'over','UP AND OVER!',e);}else if(!s.banked&&Math.abs(sh.spin)>=FK.curlSpin)trick(2,'around','ROUND THE WALL!',e);break;}
  if(s.banked&&e.k!==K.bar)trick(8,'bank','BANK SHOT!',e);
  if(dist>=FK.longMin)trick(16,'long','LONG RANGE!',e);}

 /* bodies */
 function knock(e:Ent,vx:number,vy:number,vz:number){e.st=1;e.air=0;e.vx=vx;e.vy=vy;e.vz=vz;const hv=Math.hypot(vx,vz)||1;e.ax=-vz/hv;e.az=vx/hv;e.rotV=(3+Math.hypot(vx,vy,vz)*.9)*(rnd()<.5?-1:1);}
 function bodies(h:number){const L=s.ents;for(const e of L){if(e.cls!==0)continue;
  if(e.st===0){if(e.s1>=0&&(L[e.s1].st!==0||(e.s2>=0&&L[e.s2].st!==0))){knock(e,(rnd()-.5)*2.4,.4,(rnd()-.5)*1.6+.5);emit('fall',e);pay(e);}continue;}
  if(e.st!==1)continue;e.air+=h;e.vy-=FK.g*h;e.x+=e.vx*h;e.y+=e.vy*h;e.z+=e.vz*h;e.rot+=e.rotV*h;const r0=Math.min(e.hx,e.hy);
  if(e.y<r0){e.y=r0;if(e.vy<0)e.vy=-e.vy*.3;e.vx*=.72;e.vz*=.72;e.rotV*=.6;if(Math.hypot(e.vx,e.vy,e.vz)<.7||e.air>4){e.st=2;e.vx=e.vy=e.vz=0;e.rotV=0;e.rot=e.hy>e.hx*1.15?Math.round((e.rot-Math.PI/2)/Math.PI)*Math.PI+Math.PI/2:Math.round(e.rot/(Math.PI/2))*(Math.PI/2);continue;}}
  const sp=Math.hypot(e.vx,e.vy,e.vz);if(sp<1)continue;
  // a flying body knocks standing bodies and pops balloons (chain reactions count for the flick's combo)
  for(const q of L){if(q===e||q.done)continue;if(q.cls===0&&q.st===0){const R=Math.max(e.hx,e.hy)*.85+Math.max(q.hx,q.hy)*.85;if(Math.abs(q.x-e.x)>R||Math.abs(q.y-e.y)>R||Math.abs(q.z-e.z)>R)continue;
    if(q.tough>0&&(e.mass<1||sp<3)){continue;}const f=clamp(e.mass/q.mass,.3,1)*.7;knock(q,e.vx*f,Math.abs(e.vy)*.3+1.2,e.vz*f);e.vx*=.6;e.vz*=.6;pay(q);}
   else if(q.cls===1){if(Math.hypot(q.x-e.x,q.y-e.y,q.z-e.z)<q.hx+Math.max(e.hx,e.hy)*.7){emit('pop',q);pay(q);}}}}}

 function bounce(rest:number,keep=1){const b=s.ball,vn=b.vx*N.x+b.vy*N.y+b.vz*N.z;b.x+=N.x*N.d;b.y+=N.y*N.d;b.z+=N.z*N.d;if(vn<0){const j=(1+rest)*vn;b.vx=(b.vx-j*N.x)*keep;b.vy=(b.vy-j*N.y)*keep;b.vz=(b.vz-j*N.z)*keep;}return -vn;}
 function end(){const b=s.ball;s.phase='wait';s.wait=0;if(s.scoredNow)s.stats.scored++;else if(s.minD<FK.closeDist){s.stats.close++;emit('close',null,0,s.nearId);}else emit('miss',null);b.vx=b.vy=b.vz=0;}

 function ballStep(h:number){const b=s.ball,pz=b.z,py=b.y;flyStep(b,h);const sp=Math.hypot(b.vx,b.vy,b.vz);
  // the ground: a bounce keeps most of the pace; a slow ball rolls and stops
  if(b.y<FK.R){b.y=FK.R;if(b.vy<-1.4){b.vy=-b.vy*.5;b.vx*=.82;b.vz*=.82;b.spin*=.5;b.top=0;s.bounces++;emit('bounce',null,0,sp);}else{b.vy=0;const f=1-2.2*h;b.vx*=f;b.vz*=f;s.rolling+=h;}}
  if(s.netted&&b.z<s.netZ){b.z=s.netZ;b.vz=0;b.vx*=.5;}
  for(const e of s.ents){switch(e.cls){
   case 0:{if(e.st!==0||!boxHit(b.x,b.y,b.z,FK.R,e.x,e.y,e.z,e.hx,e.hy,e.hz))break;
    if(e.tough>0&&sp<e.tough){bounce(.45);e.hitT=s.t;e.hitV=sp;s.stats.weak++;s.banked=true;emit('weak',e,0,sp,e.tough);break;}
    const vn=-(b.vx*N.x+b.vy*N.y+b.vz*N.z);if(vn<=0)break;const j=1.3*vn/(1+1/e.mass),bv=Math.min(13,j/e.mass);
    b.vx+=j*N.x;b.vy+=j*N.y;b.vz+=j*N.z;e.hitV=sp;knock(e,-N.x*bv+b.vx*.25,Math.max(1.5,-N.y*bv*.5+sp*.16),-N.z*bv+b.vz*.25);pay(e);break;}
   case 1:{if(e.done)break;if(Math.hypot(b.x-e.x,b.y-e.y,b.z-e.z)<e.hx+FK.R*.8){e.hitV=sp;emit('pop',e);pay(e);}break;}
   case 2:{const nx=Math.sin(e.yaw),nz=Math.cos(e.yaw),rx=b.x-e.x,ry=b.y-e.y,rz=b.z-e.z,dn=rx*nx+rz*nz,qx=rx-dn*nx,qz=rz-dn*nz,ql=Math.hypot(qx,ry,qz),side=dn<0?-1:1;
    if(Math.abs(dn)<1.2&&ql<e.hx+1){// through the middle: the ball's centre crosses the ring's plane inside it
     if(e.side!==0&&side!==e.side&&ql<e.hx-e.hy*.4){e.hitV=sp;pay(e);e.side=side;break;}
     if(ql>1e-6){const k=e.hx/ql,cx=rx-qx*k,cy=ry-ry*k,cz=rz-qz*k,d=Math.hypot(cx,cy,cz),R=FK.R+e.hy;if(d<R&&d>1e-6){N.x=cx/d;N.y=cy/d;N.z=cz/d;N.d=R-d;bounce(.5,.9);e.hitT=s.t;e.hitV=sp;s.banked=true;s.stats.rims++;emit('ping',e,0,sp);}}}
    e.side=side;break;}
   case 3:{const top=e.y+e.hy,rr=Math.hypot(b.x-e.x,b.z-e.z);    if((py>=top&&b.y<top&&b.vy<0&&rr<e.hx+.04)||(b.y<top&&rr<=e.hx-.12)){e.hitV=sp;pay(e);b.x=e.x;b.z=e.z;b.y=e.y;emit('net',e,0,1);end();return;}
    if(b.y<top+.02&&rr<e.hx+FK.R&&rr>e.hx-.12){N.x=(b.x-e.x)/rr;N.y=0;N.z=(b.z-e.z)/rr;N.d=e.hx+FK.R-rr;bounce(.45,.9);e.hitT=s.t;e.hitV=sp;s.banked=true;s.stats.rims++;emit('ping',e,0,sp);}break;}
   case 4:{const dx=b.x-e.x,dy=b.y-e.y,dz=b.z-e.z,d=Math.hypot(dx,dy,dz),R=FK.R+e.hx;if(d>=R||d<1e-6)break;N.x=dx/d;N.y=dy/d;N.z=dz/d;N.d=R-d;bounce(.5,.85);e.hitV=sp;if(!e.done)pay(e);else{e.hitT=s.t;emit('ping',e,0,sp);}break;}
   case 5:{if(!boxHit(b.x,b.y,b.z,FK.R,e.x,e.y,e.z,e.hx,e.hy,e.hz))break;bounce(.4,.8);e.hitV=sp;if(!e.done)pay(e);else{e.hitT=s.t;s.banked=true;emit('block',e,0,sp);}break;}
   case 6:{if(!boxHit(b.x,b.y,b.z,FK.R,e.x,e.y,e.z,e.hx,e.hy,e.hz)){if((e.k===K.wall||e.k===K.fence)&&b.y>e.y+e.hy&&Math.abs(b.x-e.x)<e.hx+FK.R&&Math.abs(b.z-e.z)<e.hz+FK.R)s.overs++;break;}
    const v=bounce(e.k===K.keeper?.3:.45,.85);if(v<.5)break;e.hitT=s.t;e.hitV=sp;if(e.k===K.keeper){s.stats.saved++;emit('saved',e,0,sp);}else{if(e.k===K.wall)s.stats.blocked++;s.banked=true;emit('block',e,0,sp);}break;}
   case 7:{if(!capHit(b.x,b.y,b.z,FK.R,e))break;const v=bounce(.6,.92);if(v<.4)break;e.hitT=s.t;e.hitV=sp;emit('ping',e,0,sp);if(e.k===K.bar&&!e.done&&e.pts>0)pay(e);s.banked=true;break;}
   case 8:{if(s.netted||!(pz>e.z&&b.z<=e.z)||Math.abs(b.x-e.x)>e.hx-.05||b.y>e.y+e.hy)break;const corner=Math.abs(b.x-e.x)>e.hx-1.1&&b.y>e.y+e.hy-1.1;
    s.netted=true;s.netZ=e.z-1.5;e.hitV=sp;emit('goal',e,0,corner?1:0,0,corner?'TOP CORNER!':'GOAL!');pay(e,e.pts+(corner?200:0));b.vx*=.2;b.vy*=.2;b.vz*=.2;break;}}}
  // near: the ball is closing on something still standing (the shell slows time)
  if(s.nearId<0||s.minD>.01)for(const e of s.ents){if(!e.need||e.done)continue;const d=Math.hypot(b.x-e.x,b.y-e.y,b.z-e.z)-Math.max(e.hx,e.cls===2?0:e.hy);if(d<s.minD){s.minD=d;if(d<FK.nearDist&&s.nearId<0){s.nearId=e.id;emit('near',e,0,Math.abs(s.shot.spin),sp);}}}
  if(b.t>FK.maxFlight||Math.abs(b.x)>32||b.z<-46||b.z>9||(b.y<=FK.R+.001&&Math.hypot(b.vx,b.vz)<.5)||s.rolling>1.6||(s.netted&&b.t>.2&&Math.hypot(b.vx,b.vy,b.vz)<1.2&&b.y<=FK.R+.05))end();}

 function finish(){const need=s.ents.filter(e=>e.need),cleared=need.every(e=>e.done),spare=cleared?s.flicks:0;s.score+=spare*FK.spare;const stars=starsFor(s.score,s.par);
  s.total+=s.score;s.results.push({stage:s.stage.id,score:s.score,stars,cleared,spare,stats:{...s.stats}});s.phase='done';
  if(s.mode!=='tour'||stars<1||s.ix>=STAGES.length-1)s.over=true;emit('level',null,s.score,stars,spare,cleared?'CLEARED!':stars?'':'');}

 function step(){const h=FK.step;s.t+=h;move(s.t);bodies(h);
  if(s.phase==='fly')ballStep(h);
  else if(s.phase==='wait'){s.wait+=h;let flying=false;for(const e of s.ents)if(e.cls===0&&e.st===1){flying=true;break;}
   if((s.wait>=FK.teeDelay&&!flying)||s.wait>FK.settleMax){let all=true;for(const e of s.ents)if(e.need&&!e.done){all=false;break;}
    if(all||s.flicks<=0)finish();else{const b=s.ball;b.x=0;b.y=FK.R;b.z=0;s.phase='tee';emit('tee',null,0,s.flicks);}}}}

 let acc=0;load();
 return {state:s,
  /** Kick. False when the ball is not on its spot. Aim help: a kick that would pass close to a target is pulled onto it (young players). */
  flick(shot:Shot){if(s.phase!=='tee'||s.flicks<=0||s.over)return false;const sh={...shot};
   if(s.stage.assist>0&&Math.abs(sh.spin)<.2){let best:number=FK.assistDist,to=0;for(const e of s.ents){if(!e.need||e.done||e.z>-1)continue;const yawErr=wrap(Math.atan2(e.x+e.ex/2,-e.z)-sh.yaw);if(Math.abs(yawErr)>FK.assistYaw)continue;
    const d=closest(sh,e.x+e.ex/2,e.y+e.ey/2,e.z);if(d<best){best=d;to=yawErr;}}sh.yaw+=to*s.stage.assist;}
   s.shot=sh;launch(s.ball,sh);s.flicks--;s.combo=0;s.banked=false;s.netted=false;s.paid=0;s.scoredNow=false;s.nearId=-1;s.minD=1e9;s.bounces=0;s.rolling=0;s.overs=0;s.wait=0;for(const e of s.ents)e.side=0;
   s.stats.flicks++;s.stats.power+=sh.power;s.phase='fly';emit('kick',null,0,sh.power,sh.spin);return true;},
  /** Advance by real seconds, in fixed steps (the shell passes a scaled dt for slow motion). */
  advance(dt:number){acc+=Math.min(.25,Math.max(0,dt));let n=0;while(acc>=FK.step&&n<60){acc-=FK.step;step();n++;}},
  step,
  drain(fn:(e:FlickEvent)=>void){for(let i=0;i<queue.length;i++)fn(queue[i]);queue.length=0;},
  /** Tour: on to the next stage after a level with a star. False when the run is over. */
  next(){if(s.phase!=='done'||s.over)return false;s.ix++;load();return true;},
 };
}

/* ---- the results card's football tip: chosen from what just happened (AGENTS.md: every feature teaches) ---- */
export type FlickTip={title:string;line:string};
export function tipFor(st:FlickStats,cleared:boolean):FlickTip{
 if(st.arounds>0)return {title:'Round the wall!',line:'Strike across the ball with the inside of your foot. The spin bends it round the defenders.'};
 if(st.overs>0)return {title:'Up and over!',line:'Laces through the top half of the ball make it dip. Free-kick takers use it to get over a wall and down again.'};
 if(st.curls>0)return {title:'Curled it!',line:'Right foot: the inside of the foot bends the ball left, the outside bends it right. A bent swipe did the same.'};
 if(st.banks>0)return {title:'In off the woodwork',line:'Aim for the corners. A shot just inside the post is the hardest to stop, and a near miss can still bounce in.'};
 if(st.weak>0)return {title:'Weight of shot',line:'The barrel needed more. Lock your ankle and let your leg swing through the ball toward the target.'};
 if(st.bestCombo>=2)return {title:'Two with one ball!',line:'A firm, low strike with the laces keeps its speed. Point your toe down and hit the middle of the ball.'};
 if(st.rims>1)return {title:'Soft touch',line:'Not every kick is a blast. A chip or a pass needs a gentle strike with the inside of the foot.'};
 if(st.flicks>0&&st.scored/st.flicks<.5)return {title:'Pick one target',line:'Choose where the ball will go before you kick. Head still, eyes on the ball as you strike it.'};
 if(st.close>0)return {title:'So close',line:'Plant your standing foot next to the ball, pointing at the target. The ball follows where that foot points.'};
 return cleared?{title:'Clean striking',line:'Laces for power, inside of the foot for accuracy. You chose the right one each time.'}:{title:'Follow through',line:'Keep your kicking leg swinging at the target after the ball has gone. It keeps the shot straight.'};
}
