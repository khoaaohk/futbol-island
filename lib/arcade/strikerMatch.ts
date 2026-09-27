/** Compact arcade football: fixed-step ball contact and acceleration, no island simulation. */
export const STRIKER_HALF_X=25,STRIKER_HALF_Z=14,STRIKER_SECONDS=180;
export type StrikerInput={x:number;z:number;pass:boolean;shoot:boolean;power:number;switchPlayer:boolean;sprint:boolean;charge:boolean;through:boolean};
export const strikerInput=():StrikerInput=>({x:0,z:0,pass:false,shoot:false,power:0,switchPlayer:false,sprint:false,charge:false,through:false});
export type StrikerPlayer={id:number;team:0|1;keeper:boolean;x:number;z:number;vx:number;vz:number;yaw:number;stamina:number;kick:number;stun:number;tackle:number;cooldown:number;think:number;run:number;windup:number;keeperAim:number;strikeYaw:number;strikeKind:'pass'|'shot'|'save';strikePower:number};
export function createStrikerMatch(){
 const players:StrikerPlayer[]=Array.from({length:8},(_,id)=>({id,team:(id<4?0:1) as 0|1,keeper:id%4===3,x:0,z:0,vx:0,vz:0,yaw:id<4?Math.PI/2:-Math.PI/2,stamina:1,kick:0,stun:0,tackle:0,cooldown:0,think:.6+id*.13,run:0,windup:0,keeperAim:0,strikeYaw:0,strikeKind:'pass',strikePower:.35}));
 const state={players,ball:{x:-7,z:0,y:.25,vx:0,vz:0,vy:0,owner:0,lastTeam:0,lock:0,spin:0},selected:0,score:[0,0],time:0,goalPause:0,charge:0,finished:false,message:'Attack right. Pass into space, then finish!',event:0,eventKind:'kickoff',eventX:0,eventZ:0,passTarget:-1,aim:0,passes:[0,0],shots:[0,0],passChain:0,lastPasser:-1};
 const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
 const emit=(kind:string,x:number,z:number,message:string)=>{state.event++;state.eventKind=kind;state.eventX=x;state.eventZ=z;state.message=message;};
 function kickoff(team=0){for(const p of players){const side=p.team===0?-1:1,i=p.id%4;p.x=side*(p.keeper?22:i===0?7:12);p.z=i===1?-8:i===2?8:0;p.vx=p.vz=p.stun=p.tackle=p.kick=p.cooldown=p.run=p.windup=p.keeperAim=0;p.yaw=-side*Math.PI/2;p.strikeYaw=p.yaw;p.strikeKind='pass';p.strikePower=.35;p.stamina=1;p.think=.8+p.id*.1;}const owner=team===0?0:4;Object.assign(state.ball,{owner,x:players[owner].x,z:0,y:.25,vx:0,vz:0,vy:0,lock:.2,lastTeam:team});state.selected=0;state.charge=0;state.passTarget=-1;state.lastPasser=-1;state.passChain=0;}
 function reset(){state.score[0]=state.score[1]=0;state.time=0;state.finished=false;state.goalPause=0;state.message='Pass, move, receive. Pull the defence apart.';state.passes[0]=state.passes[1]=state.shots[0]=state.shots[1]=0;state.aim=0;kickoff();}
 function release(p:StrikerPlayer,dx:number,dz:number,speed:number,lift:number,kind:string){const b=state.ball,n=Math.hypot(dx,dz)||1;if(kind==='save')state.lastPasser=-1;p.yaw=Math.atan2(dx,dz);p.strikeYaw=p.yaw;p.strikeKind=kind==='save'?'save':kind==='shot'?'shot':'pass';p.strikePower=clamp((speed-19)/23,.15,1);p.kick=1;b.owner=-1;b.x=p.x+dx/n*.9;b.z=p.z+dz/n*.9;b.y=.3;b.vx=dx/n*speed;b.vz=dz/n*speed;b.vy=lift;b.lock=.18;b.lastTeam=p.team;emit(kind,b.x,b.z,kind==='shot'?'Follow your shot for the rebound!':'Move after the pass. Make another angle.');}
 function shoot(p:StrikerPlayer,power:number,aim:number){state.shots[p.team]++;state.lastPasser=-1;const side=p.team===0?1:-1,targetZ=clamp(aim*4.5,-4.5,4.5);release(p,side*27-p.x,targetZ-p.z,24+power*18,2+power*3.2,'shot');}
 // Score passing lanes, not just the nearest teammate. The same choice drives
 // the receiver marker and actual pass, so the preview tells the truth.
 function receiver(p:StrikerPlayer,ix:number,iz:number){let target:StrikerPlayer|undefined,best=-Infinity;const n=Math.hypot(ix,iz),forward=p.team===0?1:-1;
  for(const q of players){if(q.team!==p.team||q===p||q.keeper)continue;const dx=q.x-p.x,dz=q.z-p.z,d=Math.hypot(dx,dz)||1,alignment=n>.1?(dx*ix+dz*iz)/(d*n):dx*forward/d;let cover=0;
   for(const enemy of players){if(enemy.team===p.team)continue;const t=clamp(((enemy.x-p.x)*dx+(enemy.z-p.z)*dz)/(d*d),0,1);if(t>.08&&t<.94){const gap=Math.hypot(enemy.x-p.x-dx*t,enemy.z-p.z-dz*t);cover+=Math.max(0,2.1-gap)*3;}}
   const rank=alignment*10-d*.08-cover;if(rank>best){best=rank;target=q;}}
  return target;
 }
 function pass(p:StrikerPlayer,ix:number,iz:number,through=false){const target=receiver(p,ix,iz);if(target){state.lastPasser=p.id;p.run=1.5;release(p,target.x+target.vx*(through?.65:.18)+(through?(p.team===0?2:-2):0)-p.x,target.z+target.vz*(through?.65:.18)-p.z,through?25:19,through?1.5:.5,'pass');if(p.team===0)state.selected=target.id;}}
 function tackle(p:StrikerPlayer){if(p.cooldown>0||p.stun>0)return;p.tackle=.28;p.cooldown=1;const b=state.ball,dx=b.x-p.x,dz=b.z-p.z,n=Math.hypot(dx,dz)||1;p.vx=dx/n*16;p.vz=dz/n*16;p.yaw=Math.atan2(dx,dz);emit('tackle',p.x,p.z,'Win the ball, then find a teammate.');}
 function step(dt:number,input:StrikerInput){if(dt<=0||state.finished)return;dt=Math.min(dt,.05);state.time=Math.min(STRIKER_SECONDS,state.time+dt);if(state.time>=STRIKER_SECONDS){state.finished=true;state.charge=0;return;}if(state.goalPause>0){state.goalPause-=dt;if(state.goalPause<=0)kickoff(state.ball.lastTeam===0?1:0);return;}
  const b=state.ball;if(input.switchPlayer){let best=Infinity,next=state.selected;const previous=state.selected;for(const p of players)if(p.team===0&&!p.keeper&&p.id!==previous){const d=Math.hypot(p.x-b.x,p.z-b.z);if(d<best){best=d;next=p.id;}}state.selected=next;}
  const user=players[state.selected];state.aim=input.z;state.passTarget=b.owner===user.id?(receiver(user,input.x,input.z)?.id??-1):-1;state.charge=input.charge&&b.owner===user.id?Math.min(1,state.charge+dt*.95):0;
  if(input.shoot&&b.owner===user.id)shoot(user,clamp(input.power,0,1),input.z);
  if(input.pass||input.through){if(b.owner===user.id)pass(user,input.x,input.z,input.through);else tackle(user);}
  const count=Math.ceil(dt/(1/120)),h=dt/count;
  for(let tick=0;tick<count;tick++){
   b.lock=Math.max(0,b.lock-h);
   const owner=b.owner>=0?players[b.owner]:null;
   const closest=[0,4];for(const team of [0,1]){let distance=Infinity;for(const p of players)if(p.team===team&&!p.keeper&&!(team===0&&p.id===state.selected)){const d=Math.hypot(p.x-b.x,p.z-b.z);if(d<distance){distance=d;closest[team]=p.id;}}}
   for(const p of players){p.kick=Math.max(0,p.kick-h*2.6);p.cooldown=Math.max(0,p.cooldown-h);p.stun=Math.max(0,p.stun-h);p.tackle=Math.max(0,p.tackle-h);p.think-=h;if(p.windup>0){if(b.owner<0||players[b.owner].team===p.team)p.windup=0;else{p.windup-=h;if(p.windup<=0)tackle(p);}}p.run=Math.max(0,p.run-h);let dx=0,dz=0,speed=8;
    if(p.id===state.selected){const n=Math.max(1,Math.hypot(input.x,input.z));dx=input.x/n;dz=input.z/n;const boost=input.sprint&&p.stamina>.04&&Math.hypot(dx,dz)>.1;speed=boost?12:8;p.stamina=clamp(p.stamina+h*(boost?-.35:.22),0,1);if(input.charge&&owner===p)speed*=.65;}
    else{speed=7.2;const forward=p.team===0?1:-1;let tx=p.x,tz=p.z;
     if(p.keeper){tx=-forward*22.5;const approaching=b.owner<0&&b.vx*forward<0,t=approaching?clamp((tx-b.x)/b.vx,0,.65):0;if(p.think<=0){p.keeperAim=clamp((b.z+b.vz*t)*.8,-3.8,3.8);p.think=.24;}tz=p.keeperAim;speed=approaching?6.3:4.5;}
     else if(owner===p){tx=forward*22;tz=p.z*.65;if(p.think<=0){p.think=.8;if(Math.abs(forward*25-p.x)<19)shoot(p,.45+Math.abs(Math.sin(state.time))*.4,Math.sin(state.time*1.7)*.85);else if(players.some(q=>q.team!==p.team&&Math.hypot(q.x-p.x,q.z-p.z)<3))pass(p,forward,0);}}
     else if((!owner||owner.team!==p.team)&&p.id===closest[p.team]){const lead=owner?0:Math.min(.4,Math.hypot(p.x-b.x,p.z-b.z)/24);tx=clamp(b.x+b.vx*lead,-23,23);tz=clamp(b.z+b.vz*lead,-12,12);if(owner&&owner.team!==p.team&&Math.hypot(p.x-b.x,p.z-b.z)<3.1&&p.think<=0&&p.windup<=0){p.windup=.26;p.think=1.4;}}
     else if(owner?.team===p.team){
      // A triangle around the ball: width plus a forward run after releasing it.
      tx=clamp(b.x+forward*(p.run>0?9:p.id%4===0?-5:5),-20,20);tz=p.id%4===1?-8:p.id%4===2?8:(b.z>0?-3:3);
     }else if(!owner){tx=clamp(b.x-forward*6,-19,19);tz=(p.id%4===1?-8:p.id%4===2?8:0)*.8+b.z*.2;}else{const mark=players[(p.id%4)+(p.team===0?4:0)];tx=clamp((mark.x+b.x)*.5-forward*3,-20,20);tz=clamp(mark.z*.7+b.z*.3,-10,10);}
     const n=Math.hypot(tx-p.x,tz-p.z);dx=(tx-p.x)/Math.max(1,n);dz=(tz-p.z)/Math.max(1,n);speed*=Math.min(1,n/1.8);
    }
    if(p.stun>0){p.vx*=Math.exp(-h*4);p.vz*=Math.exp(-h*4);}else if(p.tackle<=0){const response=1-Math.exp(-h*12);p.vx+=(dx*speed-p.vx)*response;p.vz+=(dz*speed-p.vz)*response;}
    p.x=clamp(p.x+p.vx*h,-24,24);p.z=clamp(p.z+p.vz*h,-13,13);
    if(Math.hypot(p.vx,p.vz)>.3)p.yaw+=Math.atan2(Math.sin(Math.atan2(p.vx,p.vz)-p.yaw),Math.cos(Math.atan2(p.vx,p.vz)-p.yaw))*(1-Math.exp(-h*14));
    if(p.tackle>0&&b.owner>=0&&b.lock<=0){const victim=players[b.owner];if(victim.team!==p.team&&Math.hypot(victim.x-p.x,victim.z-p.z)<1.65){victim.stun=.6;victim.vx=p.vx*.7;victim.vz=p.vz*.7;b.owner=-1;b.vx=p.vx*.6;b.vz=p.vz*.6;b.vy=2;b.lock=.2;p.tackle=0;emit('hit',victim.x,victim.z,'Clean challenge! Chase the loose ball.');}}
   }
   // Separate bodies gently; tackles supply their own impulse.
   for(let i=0;i<players.length;i++)for(let j=i+1;j<players.length;j++){const a=players[i],c=players[j],dx=c.x-a.x,dz=c.z-a.z,n=Math.hypot(dx,dz);if(n>.001&&n<1.05){const push=(1.05-n)*.2;a.x-=dx/n*push;a.z-=dz/n*push;c.x+=dx/n*push;c.z+=dz/n*push;}}
   if(b.owner>=0){const p=players[b.owner];b.x=p.x+Math.sin(p.yaw)*.82;b.z=p.z+Math.cos(p.yaw)*.82;b.y=.25;b.vx=p.vx;b.vz=p.vz;b.vy=0;}
   else{const oldX=b.x;b.x+=b.vx*h;b.z+=b.vz*h;b.vy-=12*h;b.y+=b.vy*h;if(b.y<.25){b.y=.25;b.vy=Math.abs(b.vy)>.9?-b.vy*.4:0;}b.vx*=Math.exp(-h*(b.y<=.26?.85:.28));b.vz*=Math.exp(-h*(b.y<=.26?.85:.28));
    if(Math.abs(b.z)>13.7){b.z=Math.sign(b.z)*13.7;b.vz*=-.8;emit('board',b.x,b.z,'Use the rebound to keep the attack moving.');}
    if(Math.abs(b.x)>25){const t=(Math.sign(b.x)*25-oldX)/(b.x-oldX||1),crossZ=b.z-b.vz*h*(1-t);if(Math.abs(crossZ)<4.6&&b.y<2.8){const team=b.x>0?0:1;state.score[team]++;b.lastTeam=team;state.goalPause=1.65;b.vx=b.vz=b.vy=0;emit('goal',b.x,b.z,team===0?'GOAL! Great finish.':'Blue scores. Win it back!');break;}b.x=Math.sign(b.x)*24.9;b.vx*=-.78;emit('post',b.x,b.z,'Off the frame! Stay ready for the rebound.');}
    if(b.lock<=0)for(const p of players){if(p.stun>0||p.tackle>0)continue;const d=Math.hypot(p.x-b.x,p.z-b.z);if(d<(p.keeper?1.3:1)&&b.y<(p.keeper?2.1:.8)){if(p.keeper){release(p,p.team===0?1:-1,-p.z*.12,21,4,'save');break;}const completed=state.lastPasser>=0&&state.lastPasser!==p.id&&players[state.lastPasser].team===p.team;if(completed){state.passes[p.team]++;state.passChain++;}else state.passChain=0;state.lastPasser=-1;b.owner=p.id;b.lastTeam=p.team;b.lock=.32;if(p.team===0)state.selected=p.id;emit('touch',p.x,p.z,completed?'Pass received! Look for the next open angle.':'Find space. Keep your next pass moving.');break;}}
   }b.spin+=Math.hypot(b.vx,b.vz)*h/.25;
  }
 }
 reset();return{state,step,reset};
}
export type StrikerMatch=ReturnType<typeof createStrikerMatch>;
