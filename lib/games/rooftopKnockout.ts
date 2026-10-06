import {HIT_RECOVERY,SHIELD_DURATION} from './knockoutAnimation';
export const KNOCKOUT_ROOF={x:66,z:151.75,w:28,d:50.5,height:10.23};
export const ARENA={w:26,d:48.5};
export const ARENA_QUEUES=[{x:-10,z:-19,w:3,d:4},{x:10,z:19,w:3,d:4}];
export const ARENA_BLOCKS=[{x:-5,z:-8,w:3,d:4},{x:5,z:8,w:3,d:4},{x:5,z:-7,w:4,d:2},{x:-5,z:7,w:4,d:2},{x:0,z:0,w:3,d:3}];
/** Oct 4 2026 polish (A6): readable, beatable bots. Each shot is telegraphed by a planted wind-up whose aim locks
 *  at AIM_LOCK of the way through, so a child who sees the arrow can sidestep. Difficulty 0..1 (level ramp across
 *  rounds, plus a little sudden-death pressure in long rounds) shortens the tell and sharpens the aim. */
export const MAX_LEVEL=4;
export const START_GRACE=1.5;
export const AIM_LOCK=.6;
export const PLAYER_SHOT_SPEED=19;
export const PLAYER_KICK_COOLDOWN=.7;
export const KNOCKBACK_SPEED=5.5;
export const BODY_RADIUS=.45;
export const HIT_LOG=8;
export function botTuning(difficulty:number){
 const d=Math.max(0,Math.min(1,difficulty));
 return {windup:.85-.35*d,shotSpeed:14+3.5*d,runSpeed:3.2+.7*d,aimError:.12-.06*d,lead:.1+.6*d,cooldown:1.8-.6*d,range:12+4*d};
}
type Options={level?:number;seed?:number};
export function createKnockout(options:Options={}){
 const level=Math.max(0,Math.min(MAX_LEVEL,Math.round(options.level??0)));
 let seed=Math.max(1,Math.floor(options.seed??12345))%2147483647;
 const rand=()=>(seed=seed*16807%2147483647)/2147483647;
 const players=Array.from({length:7},(_,i)=>({id:i,x:Math.sin(i*Math.PI*2/7)*9,z:Math.cos(i*Math.PI*2/7)*17,yaw:Math.PI,alive:true,hits:0,shield:0,hitFlash:0,cooldown:i?1+i*.2:0,outAge:0,queue:-1,queueSlot:0,kick:0,
  /** Smoothed bot velocity (m/s); for the user it is written by the live layer from position deltas. */
  vx:0,vz:0,
  /** Knock-back velocity, decaying, applied while recovering. */
  kx:0,kz:0,
  /** Seconds of wind-up left, its total, the aim it shows and the id it is aimed at (-1 none). */
  windup:0,windupTotal:0,aimYaw:0,target:-1}));
 const balls:Array<{x:number;z:number;vx:number;vz:number;owner:number;life:number;heldBy:number;shotAge:number}>=[];
 for(const [x,z] of [[-8,0],[8,0],[0,-12],[0,12],[-8,12],[8,-12]])balls.push({x,z,vx:0,vz:0,owner:-1,life:0,heldBy:-1,shotAge:0});
 /** Event counters only ever increase (no per-frame allocation); hitLog is a fixed ring of recent impacts. */
 const events={kicks:0,botKicks:0,hits:0,kos:0,meHit:0,meOut:0,myHits:0,myKos:0};
 const hitLog=Array.from({length:HIT_LOG},()=>({x:0,z:0,time:-99,ko:false,victim:-1,owner:-1}));let hitIndex=0;
 const state={time:0,phase:'ready' as 'ready'|'playing'|'won'|'lost',knockouts:0,players,balls,remaining:7,level,events,hitLog};
 const solids=[...ARENA_BLOCKS,...ARENA_QUEUES];
 const blocked=(x:number,z:number,r=.48)=>Math.abs(x)>ARENA.w/2-r||Math.abs(z)>ARENA.d/2-r||solids.some(b=>Math.abs(x-b.x)<b.w/2+r&&Math.abs(z-b.z)<b.d/2+r);
 const lane=(a:{x:number;z:number},b:{x:number;z:number})=>{const length=Math.hypot(b.x-a.x,b.z-a.z);for(let d=.4;d<length;d+=.4)if(blocked(a.x+(b.x-a.x)*d/length,a.z+(b.z-a.z)*d/length,.24))return false;return true;};
 const held=(id:number)=>balls.find(b=>b.heldBy===id);
 const difficulty=()=>level/MAX_LEVEL+Math.min(.25,Math.max(0,state.time-45)/240);
 const angleDelta=(a:number,b:number)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
 function attach(ball:typeof balls[number],p:typeof players[number]){
  const x=p.x+Math.sin(p.yaw)*.75,z=p.z+Math.cos(p.yaw)*.75;
  if(!blocked(x,z,.23)){ball.x=x;ball.z=z;}else{ball.x=p.x;ball.z=p.z;}
 }
 function catchable(b:typeof balls[number],p:typeof players[number]){
  if(b.heldBy>=0)return false;if(b.life<=0)return true;
  // Do not immediately recapture your own shot as it leaves your feet.
  if(b.owner===p.id&&b.shotAge<.35)return false;
  if(p.shield>0)return true;
  const dx=p.x-b.x,dz=p.z-b.z,speed2=b.vx*b.vx+b.vz*b.vz;
  const time=speed2>0?(dx*b.vx+dz*b.vz)/speed2:0;
  // Incoming body hits stay dangerous; passing, receding and missed shots can be trapped.
  return !(time>0&&time<.3&&Math.hypot(dx-b.vx*time,dz-b.vz*time)<.68);
 }
 function collect(id:number){const p=players[id];if(!p.alive||p.hitFlash>0||held(id))return;
  let closest:typeof balls[number]|undefined,distance=1.45;
  for(const b of balls)if(catchable(b,p)){const d=Math.hypot(b.x-p.x,b.z-p.z);if(d<distance&&lane(p,b)){closest=b;distance=d;}}
  if(closest){closest.heldBy=id;closest.life=0;closest.owner=-1;closest.vx=closest.vz=0;attach(closest,p);}
 }
 function fire(p:typeof players[number],yaw:number,speed:number){
  const ball=held(p.id);if(!ball)return false;p.yaw=yaw;attach(ball,p);ball.heldBy=-1;
  ball.vx=Math.sin(yaw)*speed;ball.vz=Math.cos(yaw)*speed;ball.owner=p.id;ball.life=10;ball.shotAge=0;p.kick=.28;
  if(p.id)events.botKicks++;events.kicks++;return true;
 }
 /** Where to kick so the ball meets a moving target: the lead teaches "pass into space ahead of the runner". */
 function leadPoint(from:{x:number;z:number},target:typeof players[number],speed:number,lead:number){
  const distance=Math.hypot(target.x-from.x,target.z-from.z),t=distance/speed*lead;
  return {x:target.x+target.vx*t,z:target.z+target.vz*t};
 }
 /** Soft aim assist for the user: inside a ~26° cone, snap to the best open opponent, led for its movement. */
 function assistAim(id:number,yaw:number,cone=.45,range=16){
  const p=players[id];let best=-1,score=Infinity;
  for(const o of players){if(o===p||!o.alive||o.shield>0)continue;
   const dx=o.x-p.x,dz=o.z-p.z,d=Math.hypot(dx,dz);if(d>range||d<.3)continue;
   const off=Math.abs(angleDelta(Math.atan2(dx,dz),yaw));if(off>cone)continue;
   const s=off*6+d*.12;if(s<score&&lane(p,o)){score=s;best=o.id;}}
  if(best<0)return yaw;
  const aim=leadPoint(p,players[best],PLAYER_SHOT_SPEED,.85);return Math.atan2(aim.x-p.x,aim.z-p.z);
 }
 function kick(id:number,assist=false){const p=players[id];if(state.phase!=='playing'||!p.alive||p.hitFlash>0||p.cooldown>0)return false;
  collect(id);if(!held(id))return false;
  const yaw=assist?assistAim(id,p.yaw):p.yaw;
  if(!fire(p,yaw,id?botTuning(difficulty()).shotSpeed:PLAYER_SHOT_SPEED))return false;
  p.cooldown=id?botTuning(difficulty()).cooldown:PLAYER_KICK_COOLDOWN;return true;}
 function start(){state.phase='playing';state.time=0;}
 function push(p:typeof players[number],dx:number,dz:number){if(!blocked(p.x+dx,p.z))p.x+=dx;if(!blocked(p.x,p.z+dz))p.z+=dz;}
 function update(dt:number,input:{x:number;z:number}){if(state.phase!=='playing'){for(const p of players)if(!p.alive)p.outAge+=Math.min(.05,Math.max(0,dt));return;}dt=Math.min(.05,Math.max(0,dt));state.time+=dt;
  const tune=botTuning(difficulty());
  for(const p of players){p.shield=Math.max(0,p.shield-dt);p.hitFlash=Math.max(0,p.hitFlash-dt);p.kick=Math.max(0,p.kick-dt);p.cooldown=Math.max(0,p.cooldown-dt);
   // Knock-back slides the body along the shot, decaying fast; walls stop it rather than bounce it.
   if(p.kx||p.kz){if(!p.alive&&p.outAge>.6){p.kx=p.kz=0;}else{push(p,p.kx*dt,p.kz*dt);const decay=Math.exp(-7*dt);p.kx*=decay;p.kz*=decay;if(Math.hypot(p.kx,p.kz)<.15)p.kx=p.kz=0;}}
   if(!p.alive){p.outAge+=dt;p.windup=0;p.target=-1;continue;}if(p.hitFlash>0){p.windup=0;p.target=-1;p.vx=p.vz=0;continue;}collect(p.id);let dx=input.x,dz=input.z;
   if(p.id){
    // Choose a target: nearest, but one bot at a time on the user, and shielded players are poor targets.
    let target=players[0],best=Infinity;
    for(const other of players){if(!other.alive||other===p)continue;let distance=Math.hypot(other.x-p.x,other.z-p.z);
     if(other.shield>0)distance+=8;
     if(other.id===0&&players.some(b=>b!==p&&b.alive&&b.windup>0&&b.target===0))distance+=10;
     if(distance<best){best=distance;target=other;}}
    const realDistance=Math.hypot(target.x-p.x,target.z-p.z);
    if(p.windup>0){
     // Planted wind-up: track the target until the aim locks, then commit.
     if(p.windup>p.windupTotal*(1-AIM_LOCK))p.target=target.id;
     const aimed=players[p.target];
     if(!aimed||!aimed.alive||!held(p.id)){p.windup=0;p.target=-1;p.cooldown=.4;}
     else{
      if(p.windup>p.windupTotal*(1-AIM_LOCK)){const aim=leadPoint(p,aimed,tune.shotSpeed,tune.lead);p.aimYaw=Math.atan2(aim.x-p.x,aim.z-p.z);}
      p.yaw=p.aimYaw;p.windup-=dt;
      if(p.windup<=0){p.windup=0;fire(p,p.aimYaw+(rand()*2-1)*tune.aimError,tune.shotSpeed);p.cooldown=tune.cooldown;p.target=-1;}
     }
     dx=dz=0;
    }else{
     dx=target.x-p.x;dz=target.z-p.z;const distance=Math.max(.01,realDistance),orbit=Math.sin(state.time*.6+p.id)>0?1:-1;
     p.yaw=Math.atan2(dx,dz);
     if(held(p.id)&&p.cooldown<=0&&state.time>=START_GRACE&&target.shield<=0&&realDistance<tune.range&&lane(p,target)){p.windup=p.windupTotal=tune.windup;p.target=target.id;p.aimYaw=p.yaw;}
     const approach=best<6?-.6:best>12?.8:.1,ox=dx/distance,oz=dz/distance;dx=ox*approach+oz*.65*orbit;dz=oz*approach-ox*.65*orbit;
     let loose:typeof balls[number]|undefined,nearest=Infinity;for(const b of balls)if(b.heldBy<0&&b.life<=0){const d=Math.hypot(b.x-p.x,b.z-p.z)+(lane(b,target)?0:50);if(d<nearest){nearest=d;loose=b;}}
     if(!held(p.id)&&loose){const reach=Math.hypot(loose.x-p.x,loose.z-p.z);if(reach>1.35){dx=(loose.x-p.x)/reach;dz=(loose.z-p.z)/reach;}}
     for(const ball of balls)if(ball.life>0&&ball.owner!==p.id&&Math.hypot(ball.x-p.x,ball.z-p.z)<4){dx+=(p.x-ball.x)*.7;dz+=(p.z-ball.z)*.7;}
    }
    // Bots accelerate and brake rather than snapping to full speed: weight the user can read.
    const length=Math.max(1,Math.hypot(dx,dz)),blend=1-Math.exp(-dt*(dx||dz?8:12));
    p.vx+=(dx/length*tune.runSpeed-p.vx)*blend;p.vz+=(dz/length*tune.runSpeed-p.vz)*blend;
    const mx=p.vx*dt,mz=p.vz*dt;
    if(!blocked(p.x+mx,p.z))p.x+=mx;else{p.vx=0;if(!blocked(p.x,p.z+.8*dt))p.z+=.8*dt;}
    if(!blocked(p.x,p.z+mz))p.z+=mz;else{p.vz=0;if(!blocked(p.x+.8*dt,p.z))p.x+=.8*dt;}
    continue;
   }
   const amount=Math.min(1,Math.hypot(dx,dz)),length=Math.max(1,Math.hypot(dx,dz)),speed=6;dx=dx/length*speed*dt;dz=dz/length*speed*dt;
   if(amount>.1)p.yaw=Math.atan2(dx,dz);
   if(!blocked(p.x+dx,p.z))p.x+=dx;
   if(!blocked(p.x,p.z+dz))p.z+=dz;
  }
  // Bodies are solid: overlapping players are pushed apart (the user, moved by the island controls, only pushes).
  for(let i=0;i<players.length;i++){const a=players[i];if(!a.alive)continue;
   for(let j=i+1;j<players.length;j++){const b=players[j];if(!b.alive)continue;
    const dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz),overlap=BODY_RADIUS*2-d;if(overlap<=0)continue;
    const nx=d>1e-4?dx/d:1,nz=d>1e-4?dz/d:0;
    if(a.id===0)push(b,nx*overlap,nz*overlap);else{push(a,-nx*overlap/2,-nz*overlap/2);push(b,nx*overlap/2,nz*overlap/2);}
   }}
  for(const p of players)if(p.alive)collect(p.id);
  for(const b of balls){
   if(b.heldBy>=0){const carrier=players[b.heldBy];if(carrier.alive){attach(b,carrier);continue;}b.heldBy=-1;}
   if(b.life<=0)continue;b.shotAge+=dt;
   const steps=Math.max(1,Math.ceil(Math.hypot(b.vx,b.vz)*dt/.2));
   for(let j=0;j<steps&&b.life>0;j++){
    let nx=b.x+b.vx*dt/steps,nz=b.z+b.vz*dt/steps;
    const limitX=ARENA.w/2-.23,limitZ=ARENA.d/2-.23;
    // Reflect the overshoot, including both axes on a cage-corner impact.
    if(Math.abs(nx)>limitX){nx=Math.sign(nx)*(2*limitX-Math.abs(nx));b.vx=-b.vx*.92;}
    if(Math.abs(nz)>limitZ){nz=Math.sign(nz)*(2*limitZ-Math.abs(nz));b.vz=-b.vz*.92;}
    // Resolve against the expanded obstacle face instead of killing the shot.
    // Reflect penetration back outside, with a small gap to prevent repeat contacts.
    for(const wall of solids){
     const left=wall.x-wall.w/2-.23,right=wall.x+wall.w/2+.23,north=wall.z-wall.d/2-.23,south=wall.z+wall.d/2+.23;
     if(nx<=left||nx>=right||nz<=north||nz>=south)continue;
     const px=Math.min(nx-left,right-nx),pz=Math.min(nz-north,south-nz);
     if(px<pz){if(nx<wall.x){nx=left-px-.002;if(b.vx>0)b.vx=-b.vx*.86;}else{nx=right+px+.002;if(b.vx<0)b.vx=-b.vx*.86;}}
     else{if(nz<wall.z){nz=north-pz-.002;if(b.vz>0)b.vz=-b.vz*.86;}else{nz=south+pz+.002;if(b.vz<0)b.vz=-b.vz*.86;}}
    }
    b.x=nx;b.z=nz;
    for(const p of players)if(p.alive&&p.id!==b.owner&&Math.hypot(b.x-p.x,b.z-p.z)<.68){
     b.life=0;
     if(p.shield<=0){p.hits++;p.hitFlash=HIT_RECOVERY;p.windup=0;p.target=-1;
      const speed=Math.max(.01,Math.hypot(b.vx,b.vz));p.kx=b.vx/speed*KNOCKBACK_SPEED;p.kz=b.vz/speed*KNOCKBACK_SPEED;p.vx=p.vz=0;
      const ko=p.hits>=3,log=hitLog[hitIndex];hitIndex=(hitIndex+1)%HIT_LOG;log.x=p.x;log.z=p.z;log.time=state.time;log.ko=ko;log.victim=p.id;log.owner=b.owner;
      events.hits++;if(p.id===0)events.meHit++;if(b.owner===0)events.myHits++;
      if(ko){p.alive=false;p.shield=0;p.outAge=0;const dropped=held(p.id);if(dropped)dropped.heldBy=-1;p.queue=ARENA_QUEUES.map((_,i)=>players.filter(q=>!q.alive&&q!==p&&q.queue===i).length).reduce((best,n,i,counts)=>n<counts[best]?i:best,0);p.queueSlot=players.filter(q=>!q.alive&&q!==p&&q.queue===p.queue).length;state.remaining--;events.kos++;if(p.id===0)events.meOut++;if(b.owner===0){state.knockouts++;events.myKos++;}}
      else p.shield=SHIELD_DURATION;
     }
     break;
    }
   }
   // Gentle rolling resistance, rather than an abrupt shot lifetime cutoff.
   if(b.life>0){const drag=Math.exp(-.3*dt);b.vx*=drag;b.vz*=drag;if(Math.hypot(b.vx,b.vz)<1.2)b.life=0;}
   if(b.life<=0){b.vx=b.vz=0;b.owner=-1;}
  }
  if(state.remaining===1)state.phase=players[0].alive?'won':'lost';
 }
 /** Seconds until a live shot reaches player `id` (Infinity if none is on course): drives the danger ring. */
 function incoming(id:number,horizon=.7){const p=players[id];let soonest=Infinity;
  for(const b of balls){if(b.life<=0||b.owner===id)continue;const dx=p.x-b.x,dz=p.z-b.z,s2=b.vx*b.vx+b.vz*b.vz;if(s2<1)continue;
   const t=(dx*b.vx+dz*b.vz)/s2;if(t<0||t>horizon)continue;if(Math.hypot(dx-b.vx*t,dz-b.vz*t)<.9&&t<soonest)soonest=t;}
  return soonest;}
 return {state,start,update,kick,blocked,assistAim,incoming,difficulty};
}
