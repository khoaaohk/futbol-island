/** Compact arcade football: fixed-step ball contact and acceleration, no island simulation. */
export const STRIKER_HALF_X=25,STRIKER_HALF_Z=14,STRIKER_SECONDS=180;
export const STRIKER_ROUNDS=['Find Space','Beat the Press','Break the Block','Neon Final'] as const;
export type StrikerInput={x:number;z:number;pass:boolean;shoot:boolean;power:number;switchPlayer:boolean;sprint:boolean;charge:boolean;through:boolean};
export const strikerInput=():StrikerInput=>({x:0,z:0,pass:false,shoot:false,power:0,switchPlayer:false,sprint:false,charge:false,through:false});
export type StrikerPlayer={id:number;team:0|1;keeper:boolean;x:number;z:number;vx:number;vz:number;yaw:number;stamina:number;receive:number;receiveX:number;receiveZ:number;kick:number;stun:number;tackle:number;cooldown:number;think:number;run:number;windup:number;keeperAim:number;tackleX:number;tackleZ:number;jockey:number;strikeYaw:number;strikeKind:'pass'|'shot'|'save';strikePower:number;saveSide:-1|1;saveHeight:number;saveWide:boolean};
export function createStrikerMatch(){
 const players:StrikerPlayer[]=Array.from({length:8},(_,id)=>({id,team:(id<4?0:1) as 0|1,keeper:id%4===3,x:0,z:0,vx:0,vz:0,yaw:id<4?Math.PI/2:-Math.PI/2,stamina:1,receive:0,receiveX:0,receiveZ:0,kick:0,stun:0,tackle:0,cooldown:0,think:.6+id*.13,run:0,windup:0,keeperAim:0,tackleX:0,tackleZ:0,jockey:0,strikeYaw:0,strikeKind:'pass',strikePower:.35,saveSide:1,saveHeight:0,saveWide:false}));
 const state={level:1,players,ball:{x:-7,z:0,y:.25,vx:0,vz:0,vy:0,owner:0,lastTeam:0,lock:0,spin:0},selected:0,score:[0,0],time:0,goalPause:0,charge:0,finished:false,message:'Attack right. Pass into space, then finish!',event:0,eventKind:'kickoff',eventX:0,eventZ:0,queuedPass:0,queuedThrough:false,queuedX:0,queuedZ:0,passTarget:-1,aim:0,timeScale:1,shotMoment:0,passes:[0,0],shots:[0,0],passChain:0,lastPasser:-1};
 const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
 const emit=(kind:string,x:number,z:number,message:string)=>{state.event++;state.eventKind=kind;state.eventX=x;state.eventZ=z;state.message=message;};
 function kickoff(team=0){for(const p of players){const side=p.team===0?-1:1,i=p.id%4;p.x=side*(p.keeper?22:i===0?7:12);p.z=i===1?-8:i===2?8:0;p.receive=p.receiveX=p.receiveZ=0;p.vx=p.vz=p.stun=p.tackle=p.kick=p.cooldown=p.run=p.windup=p.keeperAim=p.tackleX=p.tackleZ=p.jockey=0;p.yaw=-side*Math.PI/2;p.strikeYaw=p.yaw;p.strikeKind='pass';p.strikePower=.35;p.saveSide=1;p.saveHeight=0;p.saveWide=false;p.stamina=1;p.think=.8+p.id*.1;}const owner=team===0?0:4;Object.assign(state.ball,{owner,x:players[owner].x,z:0,y:.25,vx:0,vz:0,vy:0,lock:.2,lastTeam:team});state.selected=0;state.charge=0;state.queuedPass=0;state.timeScale=1;state.shotMoment=0;state.passTarget=-1;state.lastPasser=-1;state.passChain=0;}
 function reset(advance=false){if(advance&&state.finished&&state.score[0]>state.score[1])state.level=Math.min(4,state.level+1);state.score[0]=state.score[1]=0;state.time=0;state.finished=false;state.goalPause=0;state.message='Pass, move, receive. Pull the defence apart.';state.passes[0]=state.passes[1]=state.shots[0]=state.shots[1]=0;state.aim=0;kickoff();}
 function release(p:StrikerPlayer,dx:number,dz:number,speed:number,lift:number,kind:string){const b=state.ball,n=Math.hypot(dx,dz)||1;if(kind==='save')state.lastPasser=-1;p.yaw=Math.atan2(dx,dz);p.strikeYaw=p.yaw;p.strikeKind=kind==='save'?'save':kind==='shot'?'shot':'pass';p.strikePower=clamp((speed-19)/23,.15,1);p.kick=1;p.receive=0;b.owner=-1;b.x=p.x+dx/n*.9;b.z=p.z+dz/n*.9;b.y=.3;b.vx=dx/n*speed;b.vz=dz/n*speed;b.vy=lift;b.lock=.18;b.lastTeam=p.team;emit(kind,b.x,b.z,kind==='shot'?'Follow your shot for the rebound!':'Move after the pass. Make another angle.');}
 function shoot(p:StrikerPlayer,power:number,aim:number){if(p.team===0&&power>=.75)state.shotMoment=.18;state.shots[p.team]++;state.lastPasser=-1;const side=p.team===0?1:-1,targetZ=clamp(aim*4.5,-4.5,4.5);release(p,side*27-p.x,targetZ-p.z,24+power*18,2+power*3.2,'shot');}
 // Score passing lanes, not just the nearest teammate. The same choice drives
 // the receiver marker and actual pass, so the preview tells the truth.
 function receiver(p:StrikerPlayer,ix:number,iz:number){let target:StrikerPlayer|undefined,best=-Infinity;const n=Math.hypot(ix,iz),forward=p.team===0?1:-1;
  for(const q of players){if(q.team!==p.team||q===p||q.keeper||q.stun>0)continue;const dx=q.x-p.x,dz=q.z-p.z,d=Math.hypot(dx,dz)||1,alignment=n>.1?(dx*ix+dz*iz)/(d*n):dx*forward/d;let cover=0;
   for(const enemy of players){if(enemy.team===p.team)continue;const t=clamp(((enemy.x-p.x)*dx+(enemy.z-p.z)*dz)/(d*d),0,1);if(t>.08&&t<.94){const gap=Math.hypot(enemy.x-p.x-dx*t,enemy.z-p.z-dz*t);cover+=Math.max(0,2.1-gap)*3;}}
   const rank=alignment*(n>.1?10:3)-d*.08-cover*1.8;if(rank>best){best=rank;target=q;}}
  return target;
 }
 function pass(p:StrikerPlayer,ix:number,iz:number,through=false,returnTo=-1,sprint=false){
  const target=returnTo>=0?players[returnTo]:receiver(p,ix,iz);if(!target)return;
  state.lastPasser=p.id;p.run=1.5;
  const distance=Math.hypot(target.x-p.x,target.z-p.z),manual=p.team===0&&p.id===state.selected,n=Math.max(1,Math.hypot(ix,iz)),runSpeed=sprint&&target.stamina>.04?12:8;
  // Control transfers to the receiver. Lead the movement the player is already
  // holding, including acceleration, rather than their previous AI velocity.
  // Solve a short intercept against friction; the released ball never homes.
  const vx=manual?ix/n*runSpeed:target.vx,vz=manual?iz/n*runSpeed:target.vz;
  const departing=Math.max(0,(vx*(target.x-p.x)+vz*(target.z-p.z))/Math.max(1,distance));
  const speed=clamp((through?25:clamp(12+distance*.9,16,36))+departing,16,42);
  let tx=target.x,tz=target.z,arrival=distance/speed;
  for(let iteration=0;iteration<4;iteration++){
   const response=manual?18:12,inertia=(1-Math.exp(-response*arrival))/response;
   tx=clamp(target.x+vx*arrival+(target.vx-vx)*inertia+(through?(p.team===0?2:-2):0),-23.5,23.5);
   tz=clamp(target.z+vz*arrival+(target.vz-vz)*inertia,-12.5,12.5);
   const travel=Math.max(0,Math.hypot(tx-p.x,tz-p.z)-.9),drag=through?.3:.7;
   arrival=clamp(-Math.log(Math.max(.15,1-travel*drag/speed))/drag,0,1.8);
  }
  release(p,tx-p.x,tz-p.z,speed,through?1.5:.5,'pass');if(p.team===0)state.selected=target.id;
 }
 function tackle(p:StrikerPlayer){if(p.cooldown>0||p.stun>0)return;p.tackle=.28;p.cooldown=1.15;const b=state.ball,dx=p.id===state.selected?b.x-p.x:p.tackleX-p.x,dz=p.id===state.selected?b.z-p.z:p.tackleZ-p.z,n=Math.hypot(dx,dz)||1;p.vx=dx/n*16;p.vz=dz/n*16;p.yaw=Math.atan2(dx,dz);emit('tackle',p.x,p.z,'Win the ball, then find a teammate.');}
 function step(dt:number,input:StrikerInput){if(dt<=0||state.finished)return;dt=Math.min(dt,.05);state.time=Math.min(STRIKER_SECONDS,state.time+dt);if(state.time>=STRIKER_SECONDS){state.finished=true;state.charge=0;return;}if(state.goalPause>0){state.goalPause-=dt;if(state.goalPause<=0)kickoff(state.ball.lastTeam===0?1:0);return;}
  state.queuedPass=Math.max(0,state.queuedPass-dt);
  const b=state.ball;if(input.switchPlayer){state.queuedPass=0;let best=Infinity,next=state.selected;const previous=state.selected;for(const p of players)if(p.team===0&&!p.keeper&&p.id!==previous){const d=Math.hypot(p.x-b.x,p.z-b.z);if(d<best){best=d;next=p.id;}}state.selected=next;}
  const user=players[state.selected];state.aim=input.z;state.passTarget=b.owner===user.id?(receiver(user,input.x,input.z)?.id??-1):-1;state.charge=input.charge&&b.owner===user.id?Math.min(1,state.charge+dt*.95):0;
  if(input.shoot&&b.owner===user.id)shoot(user,clamp(input.power,0,1),input.z);
  if(input.pass||input.through){if(b.owner===user.id)pass(user,input.x,input.z,input.through,-1,input.sprint);else if(b.owner<0&&state.lastPasser>=0&&players[state.lastPasser].team===0){state.queuedPass=.65;state.queuedThrough=input.through;state.queuedX=input.x;state.queuedZ=input.z;state.message='ONE-TOUCH READY · meet it and move it.';}else tackle(user);}
  // Charge fills in real time, while the players and ball slow together.
  // Tackles can still interrupt a wind-up; there is no invulnerability.
  state.shotMoment=Math.max(0,state.shotMoment-dt);
  const focus=clamp((state.charge-.18)/.65,0,1);
  state.timeScale=state.shotMoment>0?.35:1-focus*.65;
  dt*=state.timeScale;
  const count=Math.ceil(dt/(1/120)),h=dt/count;
  for(let tick=0;tick<count;tick++){
   b.lock=Math.max(0,b.lock-h);
   const owner=b.owner>=0?players[b.owner]:null;
   const closest=[0,4];for(const team of [0,1]){let distance=Infinity;for(const p of players)if(p.team===team&&!p.keeper&&!(team===0&&p.id===state.selected)){const d=Math.hypot(p.x-b.x,p.z-b.z);if(d<distance){distance=d;closest[team]=p.id;}}}
   // A second defender presses the receiving lane only while a pass travels.
   // Keep the nearest defender on the ball and preserve a covering teammate.
   let receiverPress=-1;
   if((state.level===2||state.level===4)&&!owner&&state.lastPasser>=0&&players[state.lastPasser].team===0){let best=Infinity;const target=players[state.selected];for(const p of players)if(p.team===1&&!p.keeper&&p.id!==closest[1]){const gap=Math.hypot(p.x-target.x,p.z-target.z);if(gap<best){best=gap;receiverPress=p.id;}}}
   for(const p of players){p.receive=Math.max(0,p.receive-h);p.kick=Math.max(0,p.kick-h*2.6);p.cooldown=Math.max(0,p.cooldown-h);p.stun=Math.max(0,p.stun-h);p.tackle=Math.max(0,p.tackle-h);p.think-=h;if(p.windup>0){if(b.owner<0||players[b.owner].team===p.team)p.windup=0;else{p.windup-=h;if(p.windup<=0)tackle(p);}}p.run=Math.max(0,p.run-h);p.jockey=0;let dx=0,dz=0,speed=8;
    if(p.id===state.selected){const n=Math.max(1,Math.hypot(input.x,input.z));dx=input.x/n;dz=input.z/n;
     // Receive assistance only with a neutral stick; manual movement always wins.
     if(Math.hypot(input.x,input.z)<.12&&b.owner<0&&state.lastPasser>=0&&players[state.lastPasser].team===p.team){const t=clamp(((p.x-b.x)*b.vx+(p.z-b.z)*b.vz)/(b.vx*b.vx+b.vz*b.vz||1),0,.65),ax=b.x+b.vx*t-p.x,az=b.z+b.vz*t-p.z,length=Math.hypot(ax,az);if(length>.3){dx=ax/Math.max(1,length);dz=az/Math.max(1,length);}}
     const boost=input.sprint&&p.stamina>.04&&Math.hypot(dx,dz)>.1;speed=boost?12:8;p.stamina=clamp(p.stamina+h*(boost?-.35:.22),0,1);if(input.charge&&owner===p)speed*=.65;}
    else{speed=p.team===1?6.5+(state.level-1)*.3:7.2;const forward=p.team===0?1:-1;let tx=p.x,tz=p.z;
     if(p.keeper){tx=-forward*22.5;const approaching=b.owner<0&&b.vx*forward<0,t=approaching?clamp((tx-b.x)/b.vx,0,.65):0;if(p.think<=0){p.keeperAim=clamp((b.z+b.vz*t)*.8,-3.8,3.8);p.think=.24;}tz=p.keeperAim;speed=approaching?6.3:4.5;}
     else if(owner===p){tx=forward*22;tz=p.z*.65;for(const q of players){if(q.team===p.team||q.keeper)continue;const ahead=(q.x-p.x)*forward,gap=q.z-p.z;if(ahead>0&&ahead<5&&Math.abs(gap)<2.5)tz=clamp(p.z+(gap>=0?-3:3),-10,10);}if(p.think<=0){p.think=p.team===1?.95-(state.level-1)*.12:.8;if(Math.abs(forward*25-p.x)<19)shoot(p,.45+Math.abs(Math.sin(state.time))*.4,Math.sin(state.time*1.7)*.85);else if(players.some(q=>q.team!==p.team&&Math.hypot(q.x-p.x,q.z-p.z)<3))pass(p,forward,0);}}
     else if((!owner||owner.team!==p.team)&&p.id===closest[p.team]){const lead=owner?0:Math.min(.4,Math.hypot(p.x-b.x,p.z-b.z)/24);tx=clamp(b.x+b.vx*lead,-23,23);tz=clamp(b.z+b.vz*lead,-12,12);if(owner&&owner.team!==p.team){const gap=Math.hypot(p.x-b.x,p.z-b.z);if(gap<5){p.jockey=1;tx=b.x-forward*1.9;tz=b.z;speed*=.8;}if(gap<3.1&&p.think<=0&&p.windup<=0){p.windup=.36-(state.level-1)*.025;p.think=1.65-(state.level-1)*.12;p.tackleX=b.x+owner.vx*.12;p.tackleZ=b.z+owner.vz*.12;}}}
     else if(p.id===receiverPress){const target=players[state.selected];tx=clamp(target.x+1.4,-21,21);tz=clamp(target.z,-11,11);p.jockey=1;}
     else if(owner?.team===p.team){
      // A triangle around the ball: width plus a forward run after releasing it.
      tx=clamp(b.x+forward*(p.run>0?9:p.id%4===0?-5:5),-20,20);tz=p.id%4===1?-8:p.id%4===2?8:(b.z>0?-3:3);
      // Shift the receiving angle out of a defender's cover shadow.
      for(const q of players){if(q.team===p.team||q.keeper)continue;const ax=tx-b.x,az=tz-b.z,length=ax*ax+az*az||1,t=clamp(((q.x-b.x)*ax+(q.z-b.z)*az)/length,0,1);if(t>.15&&t<.9&&Math.hypot(q.x-b.x-ax*t,q.z-b.z-az*t)<1.7)tz=clamp(tz+(tz>=b.z?2:-2),-11,11);}
     }else if(!owner){tx=clamp(b.x-forward*6,-19,19);tz=(p.id%4===1?-8:p.id%4===2?8:0)*.8+b.z*.2;}else{const mark=players[(p.id%4)+(p.team===0?4:0)];tx=clamp(mark.x-forward*2,-21,21);tz=clamp(mark.z*.75+b.z*.25,-11,11);if(p.team===1&&state.level>=3){tx=clamp(Math.max(tx,b.x+4),-21,21);tz=clamp(mark.z*.45+b.z*.15,-8,8);}p.jockey=Math.hypot(p.x-b.x,p.z-b.z)<8?1:0;}
     const n=Math.hypot(tx-p.x,tz-p.z);dx=(tx-p.x)/Math.max(1,n);dz=(tz-p.z)/Math.max(1,n);speed*=Math.min(1,n/1.8);
    }
    if(p.cooldown>.35&&p.tackle<=0)speed*=.68;
    if(p.stun>0){p.vx*=Math.exp(-h*4);p.vz*=Math.exp(-h*4);}else if(p.tackle<=0){const tx=dx*speed,tz=dz*speed,braking=tx*p.vx+tz*p.vz<=0||Math.hypot(tx,tz)<Math.hypot(p.vx,p.vz),rate=p.id===state.selected?(braking?26:18):12,response=1-Math.exp(-h*rate);p.vx+=(tx-p.vx)*response;p.vz+=(tz-p.vz)*response;if(Math.hypot(tx,tz)<.001&&Math.hypot(p.vx,p.vz)<.025)p.vx=p.vz=0;}
    const nextX=p.x+p.vx*h,nextZ=p.z+p.vz*h;p.x=clamp(nextX,-24,24);p.z=clamp(nextZ,-13,13);if(p.x!==nextX)p.vx=0;if(p.z!==nextZ)p.vz=0;
    if(p.id===state.selected&&!input.sprint&&owner&&owner.team!==p.team&&Math.hypot(p.x-b.x,p.z-b.z)<5)p.jockey=1;
    if(p.jockey>0&&p.tackle<=0)p.yaw+=Math.atan2(Math.sin(Math.atan2(b.x-p.x,b.z-p.z)-p.yaw),Math.cos(Math.atan2(b.x-p.x,b.z-p.z)-p.yaw))*(1-Math.exp(-h*14));
    else if(Math.hypot(p.vx,p.vz)>.3)p.yaw+=Math.atan2(Math.sin(Math.atan2(p.vx,p.vz)-p.yaw),Math.cos(Math.atan2(p.vx,p.vz)-p.yaw))*(1-Math.exp(-h*14));
    if(p.tackle>0&&b.owner>=0&&b.lock<=0){const victim=players[b.owner];if(victim.team!==p.team&&Math.hypot(victim.x-p.x,victim.z-p.z)<1.65){victim.stun=.6;victim.vx=p.vx*.7;victim.vz=p.vz*.7;b.owner=-1;b.vx=p.vx*.6;b.vz=p.vz*.6;b.vy=2;b.lock=.2;p.tackle=0;emit('hit',victim.x,victim.z,'Clean challenge! Chase the loose ball.');}}
   }
   // Separate bodies gently; tackles supply their own impulse.
   for(let i=0;i<players.length;i++)for(let j=i+1;j<players.length;j++){const a=players[i],c=players[j],dx=c.x-a.x,dz=c.z-a.z,n=Math.hypot(dx,dz);if(n>.001&&n<1.05){const push=(1.05-n)*.2;a.x-=dx/n*push;a.z-=dz/n*push;c.x+=dx/n*push;c.z+=dz/n*push;}}
   if(b.owner>=0){const p=players[b.owner];b.x=p.x+Math.sin(p.yaw)*.82;b.z=p.z+Math.cos(p.yaw)*.82;b.y=.25;b.vx=p.vx;b.vz=p.vz;b.vy=0;}
   else{const oldX=b.x,oldZ=b.z,oldY=b.y;b.x+=b.vx*h;b.z+=b.vz*h;b.vy-=12*h;b.y+=b.vy*h;if(b.y<.25){b.y=.25;b.vy=Math.abs(b.vy)>.9?-b.vy*.4:0;}b.vx*=Math.exp(-h*(b.y<=.26?.85:.28));b.vz*=Math.exp(-h*(b.y<=.26?.85:.28));
    if(Math.abs(b.z)>13.7){b.z=Math.sign(b.z)*13.7;b.vz*=-.8;emit('board',b.x,b.z,'Use the rebound to keep the attack moving.');}
    if(Math.abs(b.x)>25){const t=(Math.sign(b.x)*25-oldX)/(b.x-oldX||1),crossZ=oldZ+(b.z-oldZ)*t,crossY=oldY+(b.y-oldY)*t;if(Math.abs(crossZ)<4.6&&crossY<2.8){const team=b.x>0?0:1;state.score[team]++;b.lastTeam=team;state.goalPause=1.65;b.vx=b.vz=b.vy=0;emit('goal',b.x,b.z,team===0?'GOAL! Great finish.':'Blue scores. Win it back!');break;}b.x=Math.sign(b.x)*24.9;b.vx*=-.78;emit('post',b.x,b.z,'Off the frame! Stay ready for the rebound.');}
    if(b.lock<=0)for(const p of players){if(p.stun>0||p.tackle>0)continue;const d=Math.hypot(p.x-b.x,p.z-b.z);if(d<(p.keeper?1.3:1)&&b.y<(p.keeper?2.1:.8)){if(p.keeper){
       // Latch contact before the clearance moves the ball. Wide stops get a
       // side dive, central stops stay upright; neither rolls the root mesh.
       const side=p.team===0?1:-1;p.saveSide=(b.z-p.z)*side<0?-1:1;p.saveHeight=b.y;p.saveWide=Math.abs(b.z-p.z)>.48;
       release(p,side,-p.z*.12,21,4,'save');break;}const completed=state.lastPasser>=0&&state.lastPasser!==p.id&&players[state.lastPasser].team===p.team;if(completed){state.passes[p.team]++;state.passChain++;}else state.passChain=0;const passer=state.lastPasser;state.lastPasser=-1;p.receive=.22;p.receiveX=b.x-p.x;p.receiveZ=b.z-p.z;b.owner=p.id;b.lastTeam=p.team;b.lock=.32;if(p.team===0)state.selected=p.id;emit('touch',p.x,p.z,completed?'Pass received! Look for the next open angle.':'Find space. Keep your next pass moving.');if(completed&&p.team===0&&state.queuedPass>0){state.queuedPass=0;const returnTo=Math.hypot(state.queuedX,state.queuedZ)<.12?passer:-1;pass(p,state.queuedX,state.queuedZ,state.queuedThrough,returnTo,input.sprint);state.message=returnTo>=0?'ONE-TWO! Follow your pass into space.':'FIRST-TIME PASS! Keep the move flowing.';}break;}}
   }b.spin+=Math.hypot(b.vx,b.vz)*h/.25;
  }
 }
 reset();return{state,step,reset};
}
export type StrikerMatch=ReturnType<typeof createStrikerMatch>;
