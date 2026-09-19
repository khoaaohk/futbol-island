/** Controlled touches progress up the body, then return to the feet. */
export type JuggleTouch='foot'|'knee'|'shoulder'|'head'|'around-world';
export const JUGGLE_ROUTINE:readonly JuggleTouch[]=['foot','foot','knee','knee','shoulder','head','head','shoulder','knee','foot','around-world','foot'];
const COSTUME_JUGGLE_ROUTINE:readonly JuggleTouch[]=['foot','foot','foot','foot','around-world','foot'];
export function juggleContact(kind:JuggleTouch,side:number,head?:JuggleHead){
 if(head&&kind==='head')return {x:0,y:head.top+.3,z:.03};
 return kind==='head'?{x:0,y:2.04,z:.03}:kind==='shoulder'?{x:side*.28,y:1.63,z:.06}:kind==='knee'?{x:side*.108,y:1.02,z:.4}:{x:side*.108,y:.48,z:.45};
}

import type {CharacterCustomization} from './customization';
export const SHOT_WINDUP=.46,SHOT_SPEED=38,WALL_JUGGLE_DISTANCE=8;
const JUGGLE_CONTACT=.48,WALL_GRAVITY=26,WALL_KICK_TIME=.22,WALL_RECEIVE_TIME=.14;
const WALL_HEIGHT_RATIOS=[.45,.72,.9,.6,.95];
export type WallJuggleTarget={x:number;z:number;top?:number};
type Player={x:number;z:number;y:number;yaw:number};
export type JuggleHead={bottom:number;top:number;front:number;width:number};
type Environment={juggleHead?:JuggleHead;moving?:boolean;ballStyle?:CharacterCustomization['ball'];floor:(x:number,z:number)=>number;blocked:(x:number,z:number,y:number)=>boolean;impact:(x:number,y:number,z:number)=>void;strike:()=>void;receive?:()=>void;hit?:(x:number,y:number,z:number,vx:number,vz:number)=>boolean};
export function createWalkBall(){
 const state={x:0,y:.2,z:0,vx:0,vy:0,vz:0,charge:0,mode:'attached' as 'attached'|'charging'|'windup'|'shot'|'return'|'juggle'|'wall-juggle',age:0,kick:0,yaw:0,jugglePhase:0,juggleTouch:'foot' as JuggleTouch,juggleSide:1 as -1|1,bounce:0,wallTarget:null as WallJuggleTarget|null,wallPhase:'kick' as 'kick'|'outbound'|'returning'|'receive',wallAge:0};
 let shotAge=0,impactCooldown=0,wallDirection={x:0,z:1},wallLegTime=.4,contactHeight=.85,returnAge=0,receiveHeight=.85,normalTouchCycle=-1,blendAge=1,wallKickCount=0;
 let movingJuggle=false;
 let nextWall:WallJuggleTarget|undefined,blendStart={x:0,y:0,z:0};
 const attach=(p:Player,floor?:Environment['floor'])=>{
  const sx=Math.sin(p.yaw),sz=Math.cos(p.yaw);let support=p.y;
  state.x=p.x+sx*.65;state.z=p.z+sz*.65;
  if(floor){
   // The ball sits ahead of the feet, often over the next stair tread.
   // Sample its footprint, and shorten the touch beside a taller wall.
   for(let reach=.65;reach>=.049;reach-=.15){
    state.x=p.x+sx*reach;state.z=p.z+sz*reach;
    support=Math.max(p.y,floor(state.x,state.z),floor(state.x+.2,state.z),floor(state.x-.2,state.z),floor(state.x,state.z+.2),floor(state.x,state.z-.2));
    if(support<=p.y+1.1)break;
   }
   if(support>p.y+1.1)support=p.y;
  }
  state.y=support+.2;state.vx=state.vy=state.vz=0;
 };
 const reset=(p:Player)=>{state.mode='attached';state.charge=0;state.wallTarget=null;nextWall=undefined;state.wallAge=state.age=state.kick=state.jugglePhase=0;blendAge=1;normalTouchCycle=-1;wallKickCount=0;attach(p);};
 const shoot=(p:Player,yaw:number,charge=0)=>{if((state.mode==='windup'||state.mode==='shot')&&charge<=0)return;state.mode='windup';state.charge=Math.max(0,Math.min(1,charge));state.wallTarget=null;nextWall=undefined;state.age=0;state.kick=0;state.yaw=yaw;attach({...p,yaw});};
 const beginCharge=(p:Player,yaw:number)=>{if(state.mode==='shot'||state.mode==='windup')return;reset(p);state.mode='charging';state.yaw=yaw;};
 const validWall=(p:Player,target?:WallJuggleTarget)=>{if(!target)return false;const distance=Math.hypot(target.x-p.x,target.z-p.z),facing=distance?((target.x-p.x)*Math.sin(p.yaw)+(target.z-p.z)*Math.cos(p.yaw))/distance:0;return Number.isFinite(distance)&&distance>=.8&&distance<=WALL_JUGGLE_DISTANCE&&facing>=-.1&&(target.top===undefined||Number.isFinite(target.top)&&target.top>p.y+.75);};
 const regularJuggle=()=>{blendStart={x:state.x,y:state.y,z:state.z};blendAge=0;state.mode='juggle';state.wallTarget=null;state.wallAge=state.age=state.kick=0;state.vx=state.vy=state.vz=0;normalTouchCycle=-1;};
 const updateWallTarget=(p:Player,target?:WallJuggleTarget)=>{
  if(state.mode!=='juggle'&&state.mode!=='wall-juggle')return;
  nextWall=validWall(p,target)?{...target!}:undefined;
  if(!nextWall){if(state.mode==='wall-juggle')regularJuggle();return;}
  if(state.mode==='juggle'&&blendAge>=.35&&(state.jugglePhase<.12||state.jugglePhase>.9)){state.mode='wall-juggle';state.wallTarget={...nextWall};state.wallPhase='kick';state.wallAge=0;state.juggleSide=1;}
 };
 const juggle=(p:Player,target?:WallJuggleTarget)=>{if(state.mode==='juggle'||state.mode==='wall-juggle'){reset(p);return;}reset(p);state.mode='juggle';state.y=p.y+JUGGLE_CONTACT;updateWallTarget(p,target);};
 const recall=()=>{if(state.mode==='shot'){state.mode='return';state.age=0;}};
 function update(dt:number,p:Player,env:Environment){
  state.age+=dt;state.bounce=Math.max(0,state.bounce-dt);impactCooldown=Math.max(0,impactCooldown-dt);
  const impact=()=>{state.bounce=.16;if(impactCooldown<=0){impactCooldown=.09;env.impact(state.x,state.y,state.z);}};
  if(state.mode==='wall-juggle'){
   if(!validWall(p,nextWall)){regularJuggle();return;}
   state.wallAge+=dt;
   if(state.wallPhase==='kick'){state.wallTarget={...nextWall!};const distance=Math.hypot(nextWall!.x-p.x,nextWall!.z-p.z);wallDirection={x:(nextWall!.x-p.x)/distance,z:(nextWall!.z-p.z)/distance};state.yaw=Math.atan2(wallDirection.x,wallDirection.z);}
   const target=state.wallTarget!,foot={x:p.x+wallDirection.x*.45+wallDirection.z*.108*state.juggleSide,z:p.z+wallDirection.z*.45-wallDirection.x*.108*state.juggleSide};
   if(state.wallPhase==='kick'){
    const top=target.top??p.y+2.4;contactHeight=JUGGLE_CONTACT;const progress=Math.min(1,state.wallAge/WALL_KICK_TIME);state.x=foot.x;state.z=foot.z;state.y=p.y+JUGGLE_CONTACT+(contactHeight-JUGGLE_CONTACT)*Math.sin(progress*Math.PI/2);state.kick=progress*.36;state.jugglePhase=(1-progress)*.25;
    if(progress>=1){const distance=Math.max(.1,Math.hypot(target.x-foot.x,target.z-foot.z)-.2),apex=Math.min(top-.25,p.y+Math.min(30,Math.max(contactHeight+.06,(top-p.y)*WALL_HEIGHT_RATIOS[wallKickCount%WALL_HEIGHT_RATIOS.length])));wallLegTime=Math.sqrt(2*Math.max(.04,apex-p.y-contactHeight)/WALL_GRAVITY);state.vx=wallDirection.x*distance/wallLegTime;state.vz=wallDirection.z*distance/wallLegTime;state.vy=WALL_GRAVITY*wallLegTime;wallKickCount++;state.wallPhase='outbound';state.wallAge=0;env.strike();}return;
   }
   if(state.wallPhase==='receive'){
    const progress=Math.min(1,state.wallAge/WALL_RECEIVE_TIME);state.x=foot.x;state.z=foot.z;state.y=p.y+receiveHeight-(receiveHeight-JUGGLE_CONTACT)*progress;state.vx=state.vy=state.vz=0;state.kick=0;state.jugglePhase=.75+progress*.25;
    if(progress>=1){state.wallPhase='kick';state.wallAge=0;state.juggleSide=state.juggleSide===1?-1:1;}return;
   }
   state.kick=state.wallPhase==='outbound'&&state.wallAge<.28?.36+state.wallAge/.28*.64:0;state.jugglePhase=state.wallPhase==='outbound'?.25+.25*Math.min(1,state.wallAge/wallLegTime):.5+.25*Math.min(1,state.wallAge/wallLegTime);
   const steps=Math.max(1,Math.ceil(Math.hypot(state.vx,state.vz)*dt/.08)),step=dt/steps;
   for(let i=0;i<steps;i++){
    if(state.wallPhase==='returning'){const remaining=Math.max(.015,wallLegTime-returnAge);state.vx=(foot.x-state.x)/remaining;state.vz=(foot.z-state.z)/remaining;state.vy=(p.y+contactHeight-state.y+WALL_GRAVITY/2*remaining*remaining)/remaining;returnAge+=step;}
    const x=state.x+state.vx*step,z=state.z+state.vz*step,y=state.y+state.vy*step-WALL_GRAVITY/2*step*step;state.vy-=WALL_GRAVITY*step;
    const reachedWall=(target.x-x)*wallDirection.x+(target.z-z)*wallDirection.z<=.2;
    if(state.wallPhase==='outbound'&&(env.blocked(x,z,y)||reachedWall)){state.vx=-state.vx;state.vz=-state.vz;state.wallPhase='returning';state.wallAge=0;returnAge=0;state.y=y;impact();}
    else{if(env.blocked(x,z,y)){impact();regularJuggle();return;}state.x=x;state.z=z;state.y=y;}
    if(env.hit?.(state.x,state.y,state.z,state.vx,state.vz)){impact();regularJuggle();return;}
    const received=(state.x-foot.x)*wallDirection.x+(state.z-foot.z)*wallDirection.z<=.06;
    if(state.wallPhase==='returning'&&(received||returnAge>=wallLegTime)){receiveHeight=state.y-p.y;state.wallPhase='receive';state.wallAge=0;state.vx=state.vy=state.vz=0;env.receive?.();return;}
    if(state.y<env.floor(state.x,state.z)+.2){state.y=env.floor(state.x,state.z)+.2;impact();regularJuggle();return;}
   }
   if(state.wallAge>2)regularJuggle();return;
  }
  if(state.mode==='charging'){attach(p,env.floor);state.yaw=p.yaw;state.charge=Math.max(0,Math.min(1,(state.age-.18)/1.8));state.kick=0;return;}
  if(state.mode==='attached'){attach(p,env.floor);state.kick=0;return;}
  if(state.mode==='juggle'){
   if(movingJuggle!==!!env.moving){movingJuggle=!!env.moving;regularJuggle();}
   attach(p);const style=env.ballStyle,cycle=state.age/(style==='frost'?.8:style==='solar'?1.2:1.05),phase=cycle%1,touch=Math.floor(cycle),side=touch%2?1:-1;
   const routine=env.juggleHead?COSTUME_JUGGLE_ROUTINE:JUGGLE_ROUTINE;
   state.jugglePhase=phase;state.juggleSide=side;state.juggleTouch=movingJuggle?'foot':routine[touch%routine.length];
   const from=juggleContact(state.juggleTouch,side,env.juggleHead),to=juggleContact(movingJuggle?'foot':routine[(touch+1)%routine.length],-side,env.juggleHead),blend=phase*phase*(3-2*phase);
   const x=from.x+(to.x-from.x)*blend,z=from.z+(to.z-from.z)*blend;
   state.x=p.x+Math.cos(p.yaw)*x+Math.sin(p.yaw)*z;state.z=p.z-Math.sin(p.yaw)*x+Math.cos(p.yaw)*z;
   state.y=p.y+from.y+(to.y-from.y)*phase+4*phase*(1-phase)*(state.juggleTouch==='around-world'?.5:style==='solar'?1:style==='frost'?.5:.7);
   blendAge+=dt;if(blendAge<.35){const t=blendAge/.35,blend=t*t*(3-2*t);state.x=blendStart.x+(state.x-blendStart.x)*blend;state.y=blendStart.y+(state.y-blendStart.y)*blend;state.z=blendStart.z+(state.z-blendStart.z)*blend;}
   // Keep foot-juggle arcs clear of the plush face.
   if(env.juggleHead){const h=env.juggleHead,cy=(h.top+h.bottom)/2,ry=(h.top-h.bottom)/2+.32,rx=h.width+.32,rz=h.front+.32,dx=state.x-p.x,dz=state.z-p.z;
    const localX=dx*Math.cos(p.yaw)-dz*Math.sin(p.yaw),localZ=dx*Math.sin(p.yaw)+dz*Math.cos(p.yaw),height=(state.y-p.y-cy)/ry;
    const remaining=1-height*height-(localX/rx)**2;
    if(remaining>0){const safeZ=Math.sqrt(remaining)*rz;if(localZ<safeZ){state.x+=Math.sin(p.yaw)*(safeZ-localZ);state.z+=Math.cos(p.yaw)*(safeZ-localZ);}}
   }
   state.y=Math.max(p.y+JUGGLE_CONTACT,state.y);if(touch!==normalTouchCycle&&blendAge>=.35){normalTouchCycle=touch;env.receive?.();}return;
  }
  if(state.mode==='windup'){attach({...p,yaw:state.yaw},env.floor);state.kick=Math.min(.36,state.age/SHOT_WINDUP*.36);if(state.age<SHOT_WINDUP)return;state.mode='shot';shotAge=0;state.age=0;state.vx=Math.sin(state.yaw)*(SHOT_SPEED+22*state.charge);state.vz=Math.cos(state.yaw)*(SHOT_SPEED+22*state.charge);state.vy=3.2+52*state.charge;env.strike();}
  if(state.mode==='return'){const blend=1-Math.exp(-dt*12);state.x+=(p.x+Math.sin(p.yaw)*.65-state.x)*blend;state.z+=(p.z+Math.cos(p.yaw)*.65-state.z)*blend;state.y+=(p.y+.2-state.y)*blend;state.kick=0;if(state.age>.55)reset(p);return;}
  shotAge+=dt;state.kick=shotAge<.6?.36+shotAge/.6*.64:0;
  const steps=Math.max(1,Math.ceil(Math.hypot(state.vx,state.vz)*dt/.12)),step=dt/steps;
  for(let i=0;i<steps;i++){
   const x=state.x+state.vx*step;if(env.blocked(x,state.z,state.y)){state.vx*=-.78;impact();}else state.x=x;
   const z=state.z+state.vz*step;if(env.blocked(state.x,z,state.y)){state.vz*=-.78;impact();}else state.z=z;
   if(env.hit?.(state.x,state.y,state.z,state.vx,state.vz)){state.vx*=-.42;state.vz*=-.42;state.vy=2;impact();}
   state.vy-=13*step;state.y+=state.vy*step;const floor=env.floor(state.x,state.z)+.2;
   if(state.y<floor){state.y=floor;if(state.vy<-.8){state.vy=-state.vy*.53;impact();}else state.vy=0;}
  }
  const drag=Math.exp(-(state.charge>0&&state.y>env.floor(state.x,state.z)+.3?.1:.33)*dt);state.vx*=drag;state.vz*=drag;
  if(shotAge>(state.charge>0?9:2)||Math.hypot(state.x-p.x,state.z-p.z)>(state.charge>0?360:65)||Math.hypot(state.vx,state.vz)<2&&state.y<=env.floor(state.x,state.z)+.3)recall();
 }
 return {state,reset,beginCharge,shoot,juggle,updateWallTarget,recall,update};
}
