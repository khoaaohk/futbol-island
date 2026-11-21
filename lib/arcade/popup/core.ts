/**
 * Pop-up target game rules (working id `popup`, Nov 21 2026, docs/arcade-aaa/popup-direction.md). A fast football shooting gallery:
 * targets pop out of the arena's hiding places and hide again; you flick ball after ball at them for 50 seconds.
 * Pure and deterministic: a seeded RNG (mulberry32) and fixed 1/120 s steps, so the same seed and the same flicks give the same run on
 * every device (the Daily Arena). No three.js, no DOM: the camera maths the flick needs (project / unproject) is done here with plain
 * numbers so tests and bots can flick exactly as a finger does (tests/popup-core.cjs).
 * Teaches (AGENTS.md): "Look up. Pick the target. Strike." Scan, decide quickly, closest open target first, and do not hit a friend.
 * No per-frame allocation: targets, balls and events are pools.
 */
import {ARENAS,type PopArena,type PopCam,type PopView} from './arenas';

export const PU={step:1/120,secs:50,dailySecs:60,
 /** balls in the rack; seconds to get one back; with Quick rack; least time between two flicks */rack:5,refill:.5,quickRefill:.07,minGap:.11,
 g:14,vMin:15,vMax:32,ballR:.13,curlA:16,ballLife:2.6,/** a soft flick still gets there in this many seconds (a harder one is quicker) */maxFlight:.85,
 /** fairness: never more than this many targets out; how long the first / the last targets stay; seconds between pop-ups */maxOut:5,stay0:3.2,stay1:1.5,gap0:1.25,gap1:.42,
 rise:.22,hide:.2,knockT:.8,
 /** nothing but dummies and balloons before this second (no peekers, no coach or referee) */calm:10,
 comboWin:2.4,comboStep:.25,comboMax:3,snapT:.7,snapPts:50,fireAt:8,fireMult:1.5,multiWin:.35,multiPts:150,armourPts:30,
 tripleN:5,quickSecs:7,accBonus:600,fairBonus:400,
 /** aim help: a target locks when the swipe line passes within this many screen heights of it (or its drawn size, if bigger) */lock:.062,
 medals:[4000,12000,24000] as readonly number[]} as const;
export const MEDAL_NAMES=['Bronze','Silver','Gold'] as const;
export const medalFor=(score:number)=>{let m=0;for(const v of PU.medals)if(score>=v)m++;return m;};
export const K={dummy:1,peeker:2,armour:3,balloon:4,runner:5,gold:6,bag:7,friend:8} as const;
/** points, hits to knock down, stay (x the clock's stay), hit radius and height in metres at scale 1 */
export const KIND:Record<number,{name:string;pts:number;hp:number;stay:number;r:number;h:number}>={
 1:{name:'Dummy',pts:100,hp:1,stay:1,r:.5,h:1.5},2:{name:'Cut-out',pts:150,hp:1,stay:.62,r:.46,h:1.5},3:{name:'Armoured dummy',pts:250,hp:2,stay:1.4,r:.52,h:1.5},
 4:{name:'Balloon',pts:120,hp:1,stay:1.3,r:.55,h:1.5},5:{name:'Runner',pts:200,hp:1,stay:1,r:.5,h:1.3},6:{name:'Gold mascot',pts:400,hp:1,stay:.7,r:.5,h:1.5},
 7:{name:'Ball bag',pts:50,hp:1,stay:1,r:.5,h:1.2},8:{name:'Coach',pts:0,hp:1,stay:1.15,r:.5,h:1.6}};
export const DEPTH_MULT=[1,1.2,1.5] as const;
export const bandOf=(dist:number)=>dist<10?0:dist<17?1:2;
export const comboMult=(combo:number)=>Math.min(PU.comboMax,1+PU.comboStep*Math.max(0,combo-1));
const clamp=(v:number,a:number,b:number)=>v<a?a:v>b?b:v;

/* ---- the clock's ramp (fairness: tests pin these) ---- */
export const rampAt=(t:number,dur:number)=>clamp(t/(dur*.8),0,1);
export const maxOutAt=(t:number,dur:number)=>{const f=t/dur;return f<.12?2:f<.32?3:f<.6?4:PU.maxOut;};
export const stayAt=(t:number,dur:number)=>PU.stay0+(PU.stay1-PU.stay0)*rampAt(t,dur);
export const gapAt=(t:number,dur:number)=>PU.gap0+(PU.gap1-PU.gap0)*rampAt(t,dur);

/* ---- camera maths (the view builds its three.js camera from the same numbers) ---- */
export type CamBasis={px:number;py:number;pz:number;fx:number;fy:number;fz:number;rx:number;ry:number;rz:number;ux:number;uy:number;uz:number};
export const viewFor=(cam:PopCam,aspect:number):PopView=>aspect<1?cam.tall:cam.wide;
export function camBasis(c:PopView):CamBasis{
 let fx=c.l[0]-c.p[0],fy=c.l[1]-c.p[1],fz=c.l[2]-c.p[2];const fl=Math.hypot(fx,fy,fz)||1;fx/=fl;fy/=fl;fz/=fl;
 // right = f x up(0,1,0), up = right x f
 let rx=-fz,rz=fx;const rl=Math.hypot(rx,rz)||1;rx/=rl;rz/=rl;
 return {px:c.p[0],py:c.p[1],pz:c.p[2],fx,fy,fz,rx,ry:0,rz,ux:-rz*fy,uy:rz*fx-rx*fz,uz:rx*fy};
}
/** World point -> screen, in screen HEIGHTS (x: 0 at the left edge .. aspect, y: 0 at the top .. 1); z = metres in front of the camera. */
export function projectTo(out:{x:number;y:number;z:number},b:CamBasis,tanHalf:number,aspect:number,x:number,y:number,z:number){
 const dx=x-b.px,dy=y-b.py,dz=z-b.pz,cz=dx*b.fx+dy*b.fy+dz*b.fz,cx=dx*b.rx+dz*b.rz,cy=dx*b.ux+dy*b.uy+dz*b.uz,k=1/(Math.max(1e-6,cz)*tanHalf);
 out.x=(cx*k+aspect)/2;out.y=(1-cy*k)/2;out.z=cz;return out;
}

/* ---- the flick: a swipe -> angle, power, reach ---- */
export type Flick={/** radians from straight up the screen, + = right */ang:number;/** 0..1 */power:number;/** how far up the screen the ball is sent, in screen heights */reach:number;/** swipe speed, heights a second */speed:number};
/** A swipe of (dx,dy) px (dy < 0 = up the screen) that took `ms`, on a stage `h` px tall. null = not a flick (too short, or downward). */
export function flickFromSwipe(dx:number,dy:number,ms:number,h:number):Flick|null{
 if(!(h>0))return null;const len=Math.hypot(dx,dy)/h;if(len<.035||-dy<len*h*.2)return null;
 const ang=clamp(Math.atan2(dx,-dy),-1.3,1.3),speed=len/Math.max(.03,ms/1000),power=clamp((speed-.45)/2.15,0,1);
 return {ang,power,reach:reachFor(power),speed};
}
export const reachFor=(power:number)=>.2+.68*power;
export const powerForReach=(reach:number)=>clamp((reach-.2)/.68,0,1);
/** The swipe's bend -> curl (-1..1). bend = how far the path's middle sits to the RIGHT of the straight line, over the line's length. */
export const curlFromBend=(bend:number)=>Math.abs(bend)<.07?0:clamp(bend/.22,-1,1);

export type PopTarget={on:boolean;id:number;kind:number;/** 1 popping out, 2 out, 3 hiding, 4 knocked down */st:number;/** 0..1 how far out */e:number;t:number;stay:number;hp:number;
 /** the base now; the place it stands when out */x:number;y:number;z:number;bx:number;by:number;bz:number;dir:number;s:number;band:number;spot:number;rail:number;vx:number;vy:number;
 /** seconds it has been fully out; knock direction and force */up:number;kx:number;kz:number;kv:number;flash:number};
export type PopBall={on:boolean;f:number;x:number;y:number;z:number;vx:number;vy:number;vz:number;ax:number;az:number;T:number;t:number;last:number;hits:number;grounds:number;thudT:number;spin:number;/** the id of the target the aim help chose (0 = none) */lock:number};
export type PopEvent={type:'pop'|'flick'|'hit'|'knock'|'friend'|'multi'|'miss'|'thud'|'bounce'|'empty'|'power'|'powerEnd'|'fire'|'fireOff'|'tick'|'hide'|'over';
 kind:number;a:number;b:number;points:number;x:number;y:number;z:number};
export type PopStats={flicks:number;hits:number;wasted:number;knocks:number;friends:number;friendSeen:number;snaps:number;multis:number;bestMulti:number;bestCombo:number;bestStreak:number;far:number;escaped:number;powers:number;accBonus:number;fairBonus:number};
const DIR={u:0,d:1,l:2,r:3} as const;

export function popupDailySeed(day:string){let h=0x811c9dc5;const s='popup:'+day;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return 1+h%2_000_000_000;}
/** The Daily Arena: the day picks the arena and the seed, the same on every device. */
export function popupDaily(day:string){const seed=popupDailySeed(day);return {seed,arena:seed%ARENAS.length};}
export const popupCoins=(score:number)=>Math.floor(Math.max(0,score)/1500);
function mulberry(seed:number){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}

const NT=12,NB=24,NE=64,NF=64;const LOFT=[1,1.35,1.8,2.4] as const;
export type Popup=ReturnType<typeof createPopup>;
export function createPopup(opts:{seed:number;arena:number;daily?:boolean;secs?:number}){
 const rnd=mulberry(opts.seed||1),arena:PopArena=ARENAS[((opts.arena%ARENAS.length)+ARENAS.length)%ARENAS.length],dur=opts.secs??(opts.daily?PU.dailySecs:PU.secs);
 const bases=[camBasis(arena.cam.wide),camBasis(arena.cam.tall)],tans=[Math.tan(arena.cam.wide.fov*Math.PI/360),Math.tan(arena.cam.tall.fov*Math.PI/360)],ball0=arena.ball;
 const targets:PopTarget[]=Array.from({length:NT},()=>({on:false,id:0,kind:0,st:0,e:0,t:0,stay:0,hp:0,x:0,y:0,z:0,bx:0,by:0,bz:0,dir:0,s:1,band:0,spot:-1,rail:-1,vx:0,vy:0,up:0,kx:0,kz:0,kv:0,flash:0}));
 const balls:PopBall[]=Array.from({length:NB},()=>({on:false,f:0,x:0,y:0,z:0,vx:0,vy:0,vz:0,ax:0,az:0,T:0,t:0,last:-1,hits:0,grounds:0,thudT:0,spin:0,lock:0}));
 const events:PopEvent[]=Array.from({length:NE},()=>({type:'pop',kind:0,a:0,b:0,points:0,x:0,y:0,z:0}));let evN=0;
 const spotFree=new Float64Array(arena.spots.length),railFree=new Float64Array(arena.rails.length),flickLive=new Int16Array(NF),flickHit=new Uint8Array(NF);
 const stats:PopStats={flicks:0,hits:0,wasted:0,knocks:0,friends:0,friendSeen:0,snaps:0,multis:0,bestMulti:0,bestCombo:0,bestStreak:0,far:0,escaped:0,powers:0,accBonus:0,fairBonus:0};
 const s={t:0,left:dur,dur,score:0,combo:0,comboT:-9,streak:0,fire:false,rack:PU.rack as number,refillT:0,lastFlick:-9,triple:0,quickT:0,over:false,out:0,spawned:0,arena:arena.id,daily:!!opts.daily,stats,targets,balls};
 let acc=0,spawnT=.7,nextId=1,flickN=0,multiN=0,multiT=-9,multiX=0,multiY=0,multiZ=0,lastSpot=-1,golds=0,bags=0,lastTick=6;
 const P={x:0,y:0,z:0},A={x:0,y:0,z:0},downIds=new Int32Array(8);let downN=0;

 function emit(type:PopEvent['type'],kind=0,a=0,b=0,points=0,x=0,y=0,z=0){if(evN>=NE)return;const e=events[evN++];e.type=type;e.kind=kind;e.a=a;e.b=b;e.points=points;e.x=x;e.y=y;e.z=z;}
 const cy=(t:PopTarget)=>t.y+KIND[t.kind].h*t.s*.55;
 const hittable=(t:PopTarget)=>t.on&&(t.st===2||((t.st===1||t.st===3)&&t.e>.5));
 const countOut=()=>{let n=0;for(const t of targets)if(t.on&&t.st!==4)n++;return n;};
 const hasKind=(k:number)=>{for(const t of targets)if(t.on&&t.kind===k&&t.st!==4)return true;return false;};

 /* ---- the pop-up scheduler ---- */
 function pickKind(){
  const t=s.t;if(s.spawned===0||t<PU.calm*.6)return K.dummy;
  const calm=t<PU.calm,w=[0,5,calm?0:2.6,t<14?0:1.7,1.5,t<8||!arena.rails.length?0:1.7,t<18||golds>=2||s.triple>0||hasKind(K.gold)?0:.55,t<12||bags>=2||s.quickT>0||hasKind(K.bag)?0:.5,calm||hasKind(K.friend)?0:1.5];
  let sum=0;for(let i=1;i<w.length;i++)sum+=w[i];let r=rnd()*sum;for(let i=1;i<w.length;i++){r-=w[i];if(r<=0)return i;}return K.dummy;
 }
 function spawn(){
  let kind=pickKind(),slot=-1;for(let i=0;i<NT;i++)if(!targets[i].on){slot=i;break;}if(slot<0)return false;const t=targets[slot];
  let rail=-1,spot=-1;
  if(kind===K.runner){const free:number[]=[];for(let i=0;i<arena.rails.length;i++)if(railFree[i]<=s.t)free.push(i);if(free.length)rail=free[Math.floor(rnd()*free.length)];else kind=K.dummy;}
  if(rail<0){let n=0,pick=-1;const first=s.spawned===0;
   for(let pass=0;pass<2&&pick<0;pass++){n=0;for(let i=0;i<arena.spots.length;i++){if(spotFree[i]>s.t||i===lastSpot)continue;const sp=arena.spots[i];
     if(pass===0&&first&&bandOf(Math.hypot(sp[0]-ball0[0],sp[2]-ball0[2]))!==0)continue;
     if(kind===K.balloon&&sp[3]!=='u')continue;n++;if(rnd()*n<1)pick=i;}}
   if(pick<0)return false;spot=pick;}
  t.on=true;t.id=nextId++;t.kind=kind;t.st=1;t.e=0;t.t=0;t.hp=KIND[kind].hp;t.up=0;t.flash=0;t.kv=0;t.vx=0;t.vy=0;t.spot=spot;t.rail=rail;
  const base=stayAt(s.t,dur);t.stay=Math.max(kind===K.peeker||kind===K.gold?.95:1.2,base*KIND[kind].stay);
  if(rail>=0){const r=arena.rails[rail],flip=rnd()<.5,x0=flip?r[1]:r[0],x1=flip?r[0]:r[1];t.bx=x0;t.by=r[2];t.bz=r[3];t.s=r[4];t.dir=DIR.u;
   const v=(2.6+1.8*rampAt(s.t,dur))*r[4];t.vx=Math.sign(x1-x0)*v;t.stay=Math.abs(x1-x0)/v;railFree[rail]=1e9;}
  else{const sp=arena.spots[spot];t.bx=sp[0];t.by=sp[1];t.bz=sp[2];t.dir=DIR[sp[3]];t.s=sp[4];spotFree[spot]=1e9;lastSpot=spot;if(kind===K.balloon)t.vy=.9*t.s;}
  t.x=t.bx;t.y=t.by;t.z=t.bz;t.band=bandOf(Math.hypot(t.bx-ball0[0],t.bz-ball0[2]));place(t);
  if(kind===K.gold)golds++;if(kind===K.bag)bags++;if(kind===K.friend)stats.friendSeen++;
  s.spawned++;emit('pop',kind,t.band,t.id,0,t.bx,cy(t),t.bz);return true;
 }
 /** where the base is while popping out / hiding: it slides along its direction by its own size */
 function place(t:PopTarget){if(t.rail>=0)return;const k=KIND[t.kind],off=(1-t.e)*k.h*t.s*.9;
  if(t.dir===DIR.u)t.y=t.by-off+(t.kind===K.balloon&&t.st>=2?t.vy*(t.st===2?t.t:t.stay+t.t):0);else if(t.dir===DIR.d)t.y=t.by+off;else if(t.dir===DIR.l)t.x=t.bx+off;else t.x=t.bx-off;}
 function retire(t:PopTarget){t.on=false;if(t.spot>=0)spotFree[t.spot]=s.t+.5;if(t.rail>=0)railFree[t.rail]=s.t+1.2;}

 /* ---- hits ---- */
 function flushMulti(){if(multiN>=2){const pts=PU.multiPts*multiN*(multiN-1);s.score+=pts;stats.multis++;stats.bestMulti=Math.max(stats.bestMulti,multiN);emit('multi',0,multiN,0,pts,multiX,multiY,multiZ);}multiN=0;}
 function fireOff(){if(s.fire){s.fire=false;emit('fireOff');}}
 function hit(t:PopTarget,b:PopBall){
  if(!flickHit[b.f]){flickHit[b.f]=1;stats.hits++;}
  const X=t.x,Y=cy(t),Z=t.z;
  if(t.kind===K.friend){stats.friends++;s.streak=0;s.combo=0;fireOff();t.st=3;t.t=0;t.flash=1;emit('friend',t.kind,0,t.id,0,X,Y,Z);return;}
  t.hp--;t.flash=1;if(t.hp>0){s.score+=PU.armourPts;emit('hit',t.kind,t.hp,t.id,PU.armourPts,X,Y,Z);return;}
  const h=Math.hypot(b.vx,b.vz)||1;t.kx=b.vx/h;t.kz=b.vz/h;t.kv=Math.min(1,Math.hypot(b.vx,b.vy,b.vz)/PU.vMax);
  const snap=t.st!==3&&t.up<=PU.snapT;t.st=4;t.t=0;downIds[downN++&7]=t.id;
  s.combo=s.t-s.comboT<=PU.comboWin?s.combo+1:1;s.comboT=s.t;s.streak++;stats.bestCombo=Math.max(stats.bestCombo,s.combo);stats.bestStreak=Math.max(stats.bestStreak,s.streak);
  if(!s.fire&&s.streak>=PU.fireAt){s.fire=true;emit('fire',0,s.streak);}
  const pts=Math.round(KIND[t.kind].pts*DEPTH_MULT[t.band]*comboMult(s.combo)*(s.fire?PU.fireMult:1)/10)*10+(snap?PU.snapPts:0);
  s.score+=pts;stats.knocks++;if(snap)stats.snaps++;if(t.band===2)stats.far++;
  if(multiN>0&&s.t-multiT>PU.multiWin)flushMulti();if(multiN===0){multiT=s.t;}multiN++;multiX=X;multiY=Y;multiZ=Z;
  emit('knock',t.kind,s.combo,(snap?1:0)|(s.fire?2:0)|(t.band===2?4:0)|(b.hits>0?8:0),pts,X,Y,Z);
  if(t.kind===K.gold){s.triple=PU.tripleN;stats.powers++;emit('power',t.kind,1,0,0,X,Y,Z);}
  if(t.kind===K.bag){s.quickT=PU.quickSecs;s.rack=PU.rack;stats.powers++;emit('power',t.kind,2,0,0,X,Y,Z);}
 }
 /** A ball that hit nothing is a wasted flick, unless its target was knocked down by an earlier ball while it flew (a quick double flick is not punished). */
 function ballDone(b:PopBall){b.on=false;if(b.lock&&!flickHit[b.f])for(let i=0;i<8;i++)if(downIds[i]===b.lock){flickHit[b.f]=1;break;}
  if(--flickLive[b.f]<=0&&!flickHit[b.f]){stats.wasted++;if(s.streak>0){s.streak=0;fireOff();}emit('miss',0,0,0,0,b.x,b.y,b.z);}}

 /* ---- one fixed step ---- */
 function step(){
  if(s.over)return;const h=PU.step;s.t+=h;s.left=Math.max(0,dur-s.t);
  if(s.rack<PU.rack){s.refillT-=h;if(s.refillT<=0){s.rack++;s.refillT=s.quickT>0?PU.quickRefill:PU.refill;}}
  if(s.quickT>0){s.quickT-=h;if(s.quickT<=0){s.quickT=0;emit('powerEnd',0,2);}}
  spawnT-=h;if(spawnT<=0){if(s.left>1.2&&countOut()<maxOutAt(s.t,dur)&&spawn())spawnT=gapAt(s.t,dur)*(.75+rnd()*.5);else spawnT=.12;}
  for(const t of targets){if(!t.on)continue;t.t+=h;if(t.flash>0)t.flash=Math.max(0,t.flash-h*5);const rise=t.kind===K.peeker?PU.rise*.7:PU.rise;
   if(t.st===1){t.e=Math.min(1,t.t/rise);if(t.rail>=0)t.x+=t.vx*h;if(t.e>=1){t.st=2;t.t=0;t.up=0;}}
   else if(t.st===2){t.up+=h;if(t.rail>=0)t.x+=t.vx*h;if(t.t>=t.stay){t.st=3;t.t=0;if(t.kind!==K.friend){stats.escaped++;emit('hide',t.kind,0,t.id,0,t.x,cy(t),t.z);}}}
   else if(t.st===3){t.e=Math.max(0,1-t.t/PU.hide);if(t.rail>=0)t.x+=t.vx*h;if(t.e<=0){retire(t);continue;}}
   else if(t.t>=PU.knockT){retire(t);continue;}
   if(t.st!==4)place(t);}
  for(let i=0;i<NB;i++){const b=balls[i];if(!b.on)continue;b.t+=h;if(b.t<b.T){b.vx+=b.ax*h;b.vz+=b.az*h;}b.vy-=PU.g*h;b.x+=b.vx*h;b.y+=b.vy*h;b.z+=b.vz*h;
   // targets
   for(let j=0;j<NT;j++){const t=targets[j];if(b.last===t.id||!hittable(t))continue;const k=KIND[t.kind],rr=k.r*t.s+PU.ballR,dx=b.x-t.x,dy=b.y-cy(t),dz=b.z-t.z;
    if(dx*dx+dy*dy*.6+dz*dz<rr*rr){b.last=t.id;hit(t,b);b.hits++;b.ax=0;b.az=0;b.vx=b.vx*.3+(rnd()-.5)*5;b.vy=3+rnd()*2.5;b.vz*=.25;break;}}
   // solid things
   for(const q of arena.boxes){const hw=q[3]/2+PU.ballR,hd=q[5]/2+PU.ballR,dx=b.x-q[0],dz=b.z-q[2],y0=q[1]-PU.ballR,y1=q[1]+q[4]+PU.ballR;
    if(dx>-hw&&dx<hw&&dz>-hd&&dz<hd&&b.y>y0&&b.y<y1){const px=hw-Math.abs(dx),pz=hd-Math.abs(dz),pyU=y1-b.y,pyD=b.y-y0,m=Math.min(px,pz,pyU,pyD);
     if(m===pyU){b.y=y1;b.vy=Math.abs(b.vy)*.45;}else if(m===pz){b.z=q[2]+Math.sign(dz||1)*hd;b.vz=-b.vz*.45;}else if(m===px){b.x=q[0]+Math.sign(dx||1)*hw;b.vx=-b.vx*.45;}else{b.y=y0;b.vy=-Math.abs(b.vy)*.45;}
     b.vx*=.85;b.vz*=.85;b.ax=0;b.az=0;if(b.t-b.thudT>.12){b.thudT=b.t;emit('thud',0,Math.min(1,Math.hypot(b.vx,b.vy,b.vz)/12),0,0,b.x,b.y,b.z);}break;}}
   if(b.y<PU.ballR){b.y=PU.ballR;if(b.vy<0)b.vy=-b.vy*.5;b.vx*=.8;b.vz*=.8;b.ax=0;b.az=0;if(b.grounds++===0)emit('bounce',0,0,0,0,b.x,b.y,b.z);}
   if(b.t>PU.ballLife||b.grounds>3||b.z<-48||b.z>8||Math.abs(b.x)>34||(b.hits>0&&b.t>b.T+.7))ballDone(b);}
  if(multiN>0&&s.t-multiT>PU.multiWin)flushMulti();
  if(s.combo>0&&s.t-s.comboT>PU.comboWin)s.combo=0;
  if(s.left<=5&&s.left>0){const n=Math.ceil(s.left);if(n<lastTick){lastTick=n;emit('tick',0,n);}}
  if(s.left<=0){flushMulti();s.over=true;const onT=stats.flicks>=10?stats.hits/stats.flicks:0;stats.accBonus=Math.round(PU.accBonus*onT/10)*10;stats.fairBonus=stats.friendSeen>0&&stats.friends===0&&stats.knocks>=5?PU.fairBonus:0;
   s.score+=stats.accBonus+stats.fairBonus;fireOff();emit('over',0,stats.accBonus,stats.fairBonus,s.score);}
 }

 /* ---- aiming ---- */
 const ballScreen=(aspect:number,out:{x:number;y:number;z:number})=>projectTo(out,bases[aspect<1?1:0],tans[aspect<1?1:0],aspect,ball0[0],ball0[1],ball0[2]);
 /** The open target the swipe line passes closest to (the aim help), or -1. `skip` = ids already taken by this flick's other balls. */
 function pick(ang:number,reach:number,aspect:number,loose:number,skipA:number,skipB:number){
  const tan=tans[aspect<1?1:0],basis=bases[aspect<1?1:0];ballScreen(aspect,A);const bx=A.x,by=A.y,sn=Math.sin(ang),cs=Math.cos(ang);let best=-1,bestC=1e9;
  for(let i=0;i<NT;i++){const t=targets[i];if(!t.on||t.st===4||t.st===3||t.e<.3||t.id===skipA||t.id===skipB||(loose>1.2&&t.kind===K.friend))continue;const k=KIND[t.kind];
   projectTo(P,basis,tan,aspect,t.x,cy(t),t.z);if(P.z<=.5)continue;const vx=P.x-bx,vy=by-P.y,along=vx*sn+vy*cs,perp=Math.abs(vx*cs-vy*sn);if(along<.03)continue;
   const R=Math.max(PU.lock,k.r*t.s/(P.z*tan)*.5*.9)*(t.kind===K.friend?.6:1)*loose;if(perp>R)continue;
   const c=perp/R+Math.abs(along-reach)*.6;if(c<bestC){bestC=c;best=i;}}
  return best;
 }
 function launch(tx:number,ty:number,tz:number,power:number,curl:number,f:number,lead:PopTarget|null){
  let slot=-1;for(let i=0;i<NB;i++)if(!balls[i].on){slot=i;break;}if(slot<0)return false;const b=balls[slot];
  const v=PU.vMin+(PU.vMax-PU.vMin)*power,bx=tx-ball0[0],by=ty-ball0[1],bz=tz-ball0[2],T0=clamp(Math.hypot(bx,by,bz)/v,.2,PU.maxFlight),lx=lead?lead.vx:0,ly=lead&&lead.st>=2?lead.vy:0;
  // a moving target is led; a flat shot that would clip a wall or a crate on the way is lifted instead (the ball drops onto the target)
  let dx=bx+lx*T0,dy=by+ly*T0,dz=bz,T=T0;
  for(let k=0;k<4;k++){const Tk=T0*LOFT[k],x=bx+lx*Tk,y=by+ly*Tk;if(clearPath(x,y,bz,Tk)){T=Tk;dx=x;dy=y;break;}}
  const hl=Math.hypot(dx,dz)||1,nx=-dz/hl,nz=dx/hl,a=curl*PU.curlA;
  b.on=true;b.f=f;b.x=ball0[0];b.y=ball0[1];b.z=ball0[2];b.vx=dx/T+nx*.5*a*T;b.vy=dy/T+.5*PU.g*T;b.vz=dz/T+nz*.5*a*T;b.ax=-a*nx;b.az=-a*nz;b.T=T;b.t=0;b.last=-1;b.hits=0;b.grounds=0;b.thudT=-1;b.spin=curl;b.lock=lead?lead.id:0;
  flickLive[f]++;return true;
 }
 function clearPath(dx:number,dy:number,dz:number,T:number){const lift=.5*PU.g*T*T,r=PU.ballR+.04;
  for(let i=1;i<=44;i++){const f=i/45,x=ball0[0]+dx*f,y=ball0[1]+dy*f+lift*f*(1-f),z=ball0[2]+dz*f;
   for(const q of arena.boxes)if(Math.abs(x-q[0])<q[3]/2+r&&Math.abs(z-q[2])<q[5]/2+r&&y>q[1]-r&&y<q[1]+q[4]+r)return false;}
  return true;}
 /** Where a flick with no target under it lands: the swipe's screen point, on the ground or far away. */
 function openAim(ang:number,reach:number,aspect:number){
  const tan=tans[aspect<1?1:0],basis=bases[aspect<1?1:0];ballScreen(aspect,A);const sx=A.x+Math.sin(ang)*reach,sy=A.y-Math.cos(ang)*reach,nx=(sx*2-aspect)*tan,ny=(1-sy*2)*tan;
  const dx=basis.fx+basis.rx*nx+basis.ux*ny,dy=basis.fy+basis.uy*ny,dz=basis.fz+basis.rz*nx+basis.uz*ny;
  let tt=dz<-1e-3?(-26-basis.pz)/dz:40;if(dy<-1e-3)tt=Math.min(tt,(.5-basis.py)/dy);tt=clamp(tt,5,60);
  P.x=basis.px+dx*tt;P.y=Math.max(.3,basis.py+dy*tt);P.z=Math.min(ball0[2]-3,basis.pz+dz*tt);return P;
 }
 /** One flick. Sends one ball (three with Triple) and returns how many flew (0 = the rack is empty or it is too soon). */
 function flick(ang:number,power:number,curl:number,aspect:number){
  if(s.over||s.t-s.lastFlick<PU.minGap)return 0;if(s.rack<=0){emit('empty');return 0;}
  const reach=reachFor(power),f=flickN=(flickN+1)%NF;flickLive[f]=0;flickHit[f]=0;s.rack--;if(s.rack===PU.rack-1)s.refillT=s.quickT>0?PU.quickRefill:PU.refill;s.lastFlick=s.t;stats.flicks++;
  const n=s.triple>0?3:1;if(s.triple>0&&--s.triple===0)emit('powerEnd',0,1);let sent=0,id0=-1,id1=-1;
  for(let i=0;i<n;i++){const a=ang+(i===1?-.16:i===2?.16:0);let ti=pick(i?ang:a,reach,aspect,i?2.6:1,id0,id1);if(i&&ti<0)ti=pick(a,reach,aspect,1.4,id0,id1);
   if(ti>=0){const t=targets[ti];if(i===0)id0=t.id;else id1=t.id;if(launch(t.x,cy(t),t.z,Math.max(power,.25),curl,f,t))sent++;}
   else{const o=openAim(a,reach,aspect);if(launch(o.x,o.y,o.z,power,curl,f,null))sent++;}}
  emit('flick',0,power,sent,0,ball0[0],ball0[1],ball0[2]);if(!sent){stats.wasted++;}return sent;
 }
 /** The flick that sends the ball at a target (bots, the first-run hint): the angle and the power whose reach meets it. */
 function aimOf(t:PopTarget,aspect:number):{ang:number;power:number;reach:number}{
  const tan=tans[aspect<1?1:0],basis=bases[aspect<1?1:0];ballScreen(aspect,A);projectTo(P,basis,tan,aspect,t.x,cy(t),t.z);const vx=P.x-A.x,vy=A.y-P.y,reach=Math.hypot(vx,vy);
  return {ang:Math.atan2(vx,vy),reach,power:powerForReach(reach)};
 }
 return {state:s,arena,dur,
  flick,aimOf,pick:(ang:number,reach:number,aspect:number)=>pick(ang,reach,aspect,1,-1,-1),
  center:cy,hittable,
  advance(dt:number){if(!(dt>0))return;acc+=dt;while(acc>=PU.step-1e-9){acc-=PU.step;step();}},
  drain(fn:(e:PopEvent)=>void){for(let i=0;i<evN;i++)fn(events[i]);evN=0;},
 };
}
