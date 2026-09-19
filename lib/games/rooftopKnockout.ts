import {HIT_RECOVERY,SHIELD_DURATION} from './knockoutAnimation';
export const KNOCKOUT_ROOF={x:66,z:151.75,w:28,d:50.5,height:10.23};
export const ARENA={w:26,d:48.5};
export const ARENA_QUEUES=[{x:-10,z:-19,w:3,d:4},{x:10,z:19,w:3,d:4}];
export const ARENA_BLOCKS=[{x:-5,z:-8,w:3,d:4},{x:5,z:8,w:3,d:4},{x:5,z:-7,w:4,d:2},{x:-5,z:7,w:4,d:2},{x:0,z:0,w:3,d:3}];
export function createKnockout(){
 const players=Array.from({length:7},(_,i)=>({id:i,x:Math.sin(i*Math.PI*2/7)*9,z:Math.cos(i*Math.PI*2/7)*17,yaw:Math.PI,alive:true,hits:0,shield:0,hitFlash:0,cooldown:i?1+i*.2:0,outAge:0,queue:-1,queueSlot:0,kick:0}));
 const balls:Array<{x:number;z:number;vx:number;vz:number;owner:number;life:number;heldBy:number;shotAge:number}>=[];
 for(const [x,z] of [[-8,0],[8,0],[0,-12],[0,12],[-8,12],[8,-12]])balls.push({x,z,vx:0,vz:0,owner:-1,life:0,heldBy:-1,shotAge:0});
 const state={time:0,phase:'ready' as 'ready'|'playing'|'won'|'lost',knockouts:0,players,balls,remaining:7};
 const solids=[...ARENA_BLOCKS,...ARENA_QUEUES];
 const blocked=(x:number,z:number,r=.48)=>Math.abs(x)>ARENA.w/2-r||Math.abs(z)>ARENA.d/2-r||solids.some(b=>Math.abs(x-b.x)<b.w/2+r&&Math.abs(z-b.z)<b.d/2+r);
 const lane=(a:{x:number;z:number},b:{x:number;z:number})=>{const length=Math.hypot(b.x-a.x,b.z-a.z);for(let d=.4;d<length;d+=.4)if(blocked(a.x+(b.x-a.x)*d/length,a.z+(b.z-a.z)*d/length,.24))return false;return true;};
 const held=(id:number)=>balls.find(b=>b.heldBy===id);
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
 function kick(id:number){const p=players[id];if(state.phase!=='playing'||!p.alive||p.hitFlash>0||p.cooldown>0)return false;
  collect(id);const ball=held(id);if(!ball)return false;attach(ball,p);ball.heldBy=-1;
  ball.vx=Math.sin(p.yaw)*19;ball.vz=Math.cos(p.yaw)*19;ball.owner=id;ball.life=10;ball.shotAge=0;p.cooldown=1.1;p.kick=.28;return true;}
 function start(){state.phase='playing';state.time=0;}
 function update(dt:number,input:{x:number;z:number}){if(state.phase!=='playing'){for(const p of players)if(!p.alive)p.outAge+=Math.min(.05,Math.max(0,dt));return;}dt=Math.min(.05,Math.max(0,dt));state.time+=dt;
  for(const p of players){p.shield=Math.max(0,p.shield-dt);p.hitFlash=Math.max(0,p.hitFlash-dt);p.kick=Math.max(0,p.kick-dt);p.cooldown=Math.max(0,p.cooldown-dt);if(!p.alive){p.outAge+=dt;continue;}if(p.hitFlash>0)continue;collect(p.id);let dx=input.x,dz=input.z;
   if(p.id){let target=players[0],best=Infinity;for(const other of players){if(!other.alive||other===p)continue;const distance=Math.hypot(other.x-p.x,other.z-p.z);if(distance<best){best=distance;target=other;}}
    dx=target.x-p.x;dz=target.z-p.z;const distance=Math.max(.01,Math.hypot(dx,dz)),orbit=Math.sin(state.time*.6+p.id)>0?1:-1;
    p.yaw=Math.atan2(dx,dz);if(target.shield<=0&&lane(p,target))kick(p.id);
    const approach=best<6?-.6:best>12?.8:.1,ox=dx/distance,oz=dz/distance;dx=ox*approach+oz*.65*orbit;dz=oz*approach-ox*.65*orbit;
    let loose:typeof balls[number]|undefined,nearest=Infinity;for(const b of balls)if(b.heldBy<0&&b.life<=0){const d=Math.hypot(b.x-p.x,b.z-p.z)+(lane(b,target)?0:50);if(d<nearest){nearest=d;loose=b;}}
    if(!held(p.id)&&loose){const reach=Math.hypot(loose.x-p.x,loose.z-p.z);if(reach>1.35){dx=(loose.x-p.x)/reach;dz=(loose.z-p.z)/reach;}}
    for(const ball of balls)if(ball.life>0&&ball.owner!==p.id&&Math.hypot(ball.x-p.x,ball.z-p.z)<4){dx+=(p.x-ball.x)*.7;dz+=(p.z-ball.z)*.7;}
   }
   const amount=Math.min(1,Math.hypot(dx,dz)),length=Math.max(1,Math.hypot(dx,dz)),speed=p.id?4.3:6;dx=dx/length*speed*dt;dz=dz/length*speed*dt;
   if(!p.id&&amount>.1)p.yaw=Math.atan2(dx,dz);
   if(!blocked(p.x+dx,p.z))p.x+=dx;else if(p.id&&!blocked(p.x,p.z+.8*dt))p.z+=.8*dt;
   if(!blocked(p.x,p.z+dz))p.z+=dz;else if(p.id&&!blocked(p.x+.8*dt,p.z))p.x+=.8*dt;
  }
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
     if(p.shield<=0){p.hits++;p.hitFlash=HIT_RECOVERY;
      if(p.hits>=3){p.alive=false;p.shield=0;p.outAge=0;const dropped=held(p.id);if(dropped)dropped.heldBy=-1;p.queue=ARENA_QUEUES.map((_,i)=>players.filter(q=>!q.alive&&q!==p&&q.queue===i).length).reduce((best,n,i,counts)=>n<counts[best]?i:best,0);p.queueSlot=players.filter(q=>!q.alive&&q!==p&&q.queue===p.queue).length;state.remaining--;if(b.owner===0)state.knockouts++;}
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
  // A bounded round ends in sudden-death pressure: bots already keep seeking targets.
 }
 return {state,start,update,kick,blocked};
}
