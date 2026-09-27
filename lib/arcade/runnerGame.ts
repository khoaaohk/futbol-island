import {JUMP_V,stepJump,crossesPickup,goalPoints} from '../../components/games/runnerPhysics';
export const RUNNER_STRIKE_X=-.3;
export type RunnerDefender='jockey'|'tackler'|'sweeper';
export type RunnerObject={lane:number;z:number;kind:'defender'|'cone'|'coin'|'goal';passed:boolean;openLane:number;knock?:number;scored?:boolean;x?:number;vx?:number;read?:number;aim?:number;reaction?:number;netHit?:number;hitX?:number;role?:RunnerDefender;tackle?:number;goalBurst?:number;returnKick?:number;returnCooldown?:number;returnAim?:number};
export type RunnerShot={active:boolean;x:number;z:number;age:number;power:boolean;precision?:boolean;blast?:number;penetrations?:number;returner?:RunnerObject;returning?:boolean;windup?:number;vx?:number;aimX?:number};
export function createRunnerGame(){return{time:0,distance:0,x:0,vx:0,lean:0,slidePose:0,jumpPrep:0,landing:0,stride:0,lane:0,y:0,vy:0,jumping:false,slide:0,boost:0,energy:0,balls:1,collected:0,charging:false,charge:0,lastBlast:0,kick:0,shotCooldown:0,celebrate:0,score:0,goals:0,streak:0,lives:3,hurt:0,spawn:0,nextGoal:90,seed:47,wave:0,level:1,combo:0,bestCombo:0,readLane:0,pattern:'Follow the footballs',objects:[] as RunnerObject[],shots:Array.from({length:4},()=>({active:false,x:0,z:0,age:0,power:false} as RunnerShot)),event:0,eventKind:'touch',eventX:0,eventZ:0,message:'Collect footballs. Line up your lane, then shoot.'};}
export type RunnerGame=ReturnType<typeof createRunnerGame>;
export function runnerMultiplier(s:RunnerGame){return Math.min(3,1+Math.floor(s.combo/6));}
function cleanPlay(s:RunnerGame){s.combo++;s.bestCombo=Math.max(s.bestCombo,s.combo);}
// Patterns are authored in metres: every challenge leaves a visible open lane,
// and the ball trail arrives before its corresponding defensive line.
function spawnPattern(s:RunnerGame){
 const index=s.wave++,lane=[0,-1,1,0,1,-1][index%6];s.readLane=lane;
 let defenderIndex=0;const roles:RunnerDefender[]=['jockey','tackler','sweeper'];
 const add=(kind:RunnerObject['kind'],lane:number,z:number)=>s.objects.push({kind,lane,z,passed:false,openLane:0,...(kind==='defender'?{role:roles[(index+defenderIndex++)%3]}:{})});
 const goal=s.objects.find(o=>o.kind==='goal'&&!o.passed&&o.z<0);
 if(goal){s.readLane=goal.openLane;s.pattern='Find the golden opening';return;}
 if(s.nextGoal-s.distance<28)return;
 const pattern=index%3;s.pattern=pattern===0?'Follow the footballs':pattern===1?'Switch into space':'Split the defenders';
 if(pattern===0){let first=true;for(const blocked of[-1,0,1])if(blocked!==lane){add(first?'cone':'defender',blocked,-57);first=false;}}
 else if(pattern===1){add('defender',-lane||1,-57);if(s.level>1)add('cone',lane===0?-1:0,-57);}
 else for(const blocked of[-1,0,1])if(blocked!==lane)add('defender',blocked,-57);
 for(let i=0;i<3;i++)add('coin',lane,-40-i*4);
 if(s.wave===1)s.message='Follow the footballs. A clear lane is always available.';
}
/** The tackle volume matches the extended leg, not just the torso centre. */
const DEFENDER_REACH={rest:{x:.85,z:.9},jockey:{x:.92,z:1.2},tackler:{x:.94,z:2.1},sweeper:{x:1.15,z:1.55}} as const;
export function runnerDefenderReach(o:RunnerObject){return (o.tackle??0)>.08&&(o.tackle??0)<.7?DEFENDER_REACH[o.role??'jockey']:DEFENDER_REACH.rest;}
function feedback(s:RunnerGame,kind:string,x:number,z:number,message:string){s.event++;s.eventKind=kind;s.eventX=x;s.eventZ=z;s.message=message;}
export function runnerJump(s:RunnerGame){if(!s.jumping&&s.lives>0){s.jumping=true;s.vy=JUMP_V;s.jumpPrep=.09;s.landing=0;s.slide=0;}}
export function runnerSlide(s:RunnerGame){if(!s.jumping&&s.lives>0)s.slide=.65;}
export function runnerCharge(s:RunnerGame,held:boolean){if(held){if(s.lives>0&&s.balls>0&&!s.charging){s.charging=true;s.charge=0;}}else{s.charging=false;s.charge=0;}}
export function runnerRelease(s:RunnerGame){if(!s.charging)return false;s.charging=false;const fired=runnerShoot(s);s.charge=0;return fired;}
export function runnerShoot(s:RunnerGame){
 if(s.lives<=0||s.shotCooldown>0)return false;
 if(s.balls===0){s.message='No ball! Collect a football to reload.';return false;}
 if(s.y>.45||s.slide>0){s.message='Set your feet before you shoot.';return false;}
 const shot=s.shots.find(p=>!p.active);if(!shot)return false;
 const goal=s.objects.find(o=>o.kind==='goal'&&!o.passed&&o.z< -8&&o.z> -22&&Math.abs(s.x-o.openLane*2.4)<.65);
 Object.assign(shot,{active:true,returner:undefined,returning:false,windup:0,vx:0,aimX:0,x:s.x+RUNNER_STRIKE_X,z:-.9,age:0,power:s.boost>0||s.charge>=.8,precision:!!goal,blast:s.charge,penetrations:s.charge>=.8?2:0});s.balls--;s.lastBlast=s.charge;s.kick=.3;s.shotCooldown=.3;
 feedback(s,'shot',shot.x,-.9,s.charge>=.8?'POWER BLAST! Drive through the defence.':'Shot away! Keep moving into space.');return true;
}
export function tickRunner(s:RunnerGame,dt:number){
 if(s.lives<=0)return;dt=Math.max(0,Math.min(dt,.05));s.time+=dt;if(s.charging)s.charge=Math.min(1,s.charge+dt/1.1);s.hurt=Math.max(0,s.hurt-dt);s.slide=Math.max(0,s.slide-dt);s.boost=Math.max(0,s.boost-dt);s.kick=Math.max(0,s.kick-dt);s.shotCooldown=Math.max(0,s.shotCooldown-dt);s.celebrate=Math.max(0,s.celebrate-dt);
 // Exact critically damped spring: a lane cut accelerates and plants without
 // snapping velocity or overshooting, including when the player reverses it.
 const offset=s.x-s.lane*2.4,omega=22,impulse=s.vx+omega*offset,decay=Math.exp(-omega*dt);
 s.x=s.lane*2.4+(offset+impulse*dt)*decay;s.vx=(s.vx-omega*impulse*dt)*decay;
 const blend=1-Math.exp(-dt*18);s.lean+=(Math.max(-1,Math.min(1,s.vx/10))-s.lean)*blend;
 s.slidePose+=(Math.min(1,s.slide/.16)-s.slidePose)*(1-Math.exp(-dt*24));
 s.jumpPrep=Math.max(0,s.jumpPrep-dt);s.landing=Math.max(0,s.landing-dt);
 const impact=stepJump(s,dt);if(impact>0){s.y=0;s.vy=0;s.jumping=false;s.landing=.2;}
 s.stride+=dt*(3.5+(s.boost>0?8:6)*.95)*(1-s.slidePose*.85)*(1-(s.kick>0?Math.sin(s.kick/.3*Math.PI/2):0)*.5);

 s.level=1+Math.floor(s.distance/360);const speed=(13+Math.min(5,(s.level-1)*1.1))*(s.boost>0?1.3:1),travel=speed*dt;s.distance+=travel;s.spawn-=dt;
 if(s.distance>=s.nextGoal){s.nextGoal+=180;const lane=[0,1,-1][Math.floor((s.nextGoal-270)/180)%3];s.readLane=lane;s.objects.push({lane:0,z:-60,kind:'goal',passed:false,openLane:lane});for(let i=0;i<3;i++)s.objects.push({lane,z:-28-i*4,kind:'coin',passed:false,openLane:0});s.pattern='Find the golden opening';s.message=`Goal ahead: ${lane<0?'left':lane>0?'right':'centre'} lane. Follow gold, then shoot!`;}
 if(s.spawn<=0){s.spawn=42/speed;spawnPattern(s);}
 for(const o of s.objects){o.z+=travel;if(o.netHit)o.netHit=Math.max(0,o.netHit-dt);if(o.kind==='goal'&&o.reaction)o.reaction=Math.max(0,o.reaction-dt);
  if(o.kind==='defender'&&o.passed&&o.tackle)o.tackle+=dt;
  if(o.scored)o.goalBurst=Math.min(1.2,(o.goalBurst??0)+dt);
  if(o.kind==='defender'){o.returnKick=Math.max(0,(o.returnKick??0)-dt);o.returnCooldown=Math.max(0,(o.returnCooldown??0)-dt);}
  if(o.kind==='defender'&&!o.passed){const base=o.lane*2.4,old=o.x??base,role=o.role??'jockey',tell=role==='tackler'?.65:.5;
   // At maximum boosted speed the initial read still precedes contact by >1s.
   if(o.z> -32&&o.read===undefined){o.read=0;o.aim=Math.max(base-.8,Math.min(base+.8,s.x+s.vx*.15));}
   if(o.read!==undefined)o.read+=dt;
   const committed=(o.read??0)>tell&&o.z>-12;
   if(!committed)o.aim=Math.max(base-.8,Math.min(base+.8,s.x+s.vx*.12));
   if(committed&&o.z> -9)o.tackle=(o.tackle??0)+dt;
   const stride=role==='jockey'?.72:role==='sweeper'?.8:.42;
   const target=(o.returnCooldown??0)>1.25?old:committed?o.aim!:base+Math.max(-.8,Math.min(.8,Math.sin(s.time*(role==='jockey'?3.6:role==='sweeper'?2.7:2.2)+o.lane*2)*stride+(o.aim===undefined?0:(o.aim-base)*.18)));
   o.x=old+(target-old)*(1-Math.exp(-dt*(committed?(role==='sweeper'?9:5):3)));o.vx=dt?(o.x-old)/dt:0;o.reaction=committed?Math.min(1,((o.read??0)-tell)/.25):Math.min(1,(o.read??0)/tell);
  }
  if(o.knock)o.knock=Math.max(0,o.knock-dt);}
 // Sweep shots against moving targets, selecting the first object on their path.
 for(const shot of s.shots){if(!shot.active)continue;
  if(shot.returner){const defender=shot.returner;if(defender.passed||defender.knock){shot.active=false;shot.returner=undefined;continue;}shot.x=(defender.x??defender.lane*2.4)+.2;shot.z=defender.z+.6;shot.windup=Math.max(0,(shot.windup??0)-dt);
   if(shot.windup===0){shot.returner=undefined;shot.returning=true;shot.age=0;shot.vx=((shot.aimX??0)-shot.x)/Math.max(.4,-shot.z/22);defender.returnKick=.46;feedback(s,'return',shot.x,shot.z,'RETURN BALL! Jump or change lanes.');}continue;}
  if(shot.returning){const oldZ=shot.z,oldX=shot.x;shot.z+=22*dt;shot.x+=(shot.vx??0)*dt;shot.age+=dt;
   if(oldZ<0&&shot.z>=0){const t=-oldZ/(shot.z-oldZ),crossX=oldX+(shot.x-oldX)*t;shot.active=false;
    if(Math.abs(crossX-s.x)<.62&&s.y<.8&&s.hurt===0&&s.boost===0){s.lives--;s.hurt=1.2;s.combo=s.streak=s.energy=0;feedback(s,'hit',s.x,0,s.lives?'Return caught you! Jump or cut away after shooting.':'Full time. Try a new route.');}
    else if(s.hurt===0){s.score+=40;cleanPlay(s);feedback(s,'skill',crossX,0,'Return avoided! +40 · attack the space.');}}
   if(shot.age>3||shot.z>3)shot.active=false;continue;}
  const previous=shot.z;shot.z-=(40+(shot.blast??0)*14)*dt;shot.age+=dt;let target:RunnerObject|undefined;
  for(const o of s.objects){if(o.passed||o.kind==='coin'||o.z>previous+travel+.5||o.z<shot.z-.5)continue;if(o.kind!=='goal'&&Math.abs(shot.x-(o.x??o.lane*2.4))>.85)continue;if(!target||o.z>target.z)target=o;}
  if(target?.kind==='defender'&&!shot.power&&target.z< -12&&target.z> -38&&(target.returnCooldown??0)<=0&&(target.tackle??0)===0){
   // A planted, centred boot can return a normal shot. Edge contacts and blasts beat it.
   if(Math.abs(shot.x-(target.x??target.lane*2.4))<.55){shot.returner=target;shot.windup=.3;shot.aimX=s.x;shot.x=(target.x??target.lane*2.4)+.2;shot.z=target.z+.6;target.returnCooldown=2;target.returnAim=Math.atan2((shot.aimX??0)-shot.x,-shot.z);feedback(s,'block',shot.x,shot.z,'BLOCKED · defender winding up! Jump or cut away.');continue;}}
  if(target){shot.active=false;if(target.kind==='goal'){target.hitX=shot.x;
    if(Math.abs(shot.x-target.openLane*2.4)<1.05){target.passed=true;target.scored=true;target.netHit=.65;target.goalBurst=0;s.goals++;s.streak++;s.celebrate=1;const reward=(goalPoints(shot.power,s.streak)+150+(shot.precision?150:0))*runnerMultiplier(s);cleanPlay(s);s.score+=reward;feedback(s,'goal',shot.x,target.z,`${shot.precision?'PERFECT FINISH':'GOAL'}! +${reward} · ${s.streak>1?`×${Math.min(3,s.streak)} streak`:'Great finish!'}`);}
    else{target.reaction=.5;s.streak=0;s.combo=0;feedback(s,'save',shot.x,target.z,'Saved! Find the golden opening and shoot again.');}
   }else{target.passed=true;target.knock=.65;if((shot.penetrations??0)>0){shot.penetrations=Math.max(0,(shot.penetrations??0)-1);shot.active=true;}const reward=100*runnerMultiplier(s);s.score+=reward;cleanPlay(s);feedback(s,'clear',shot.x,target.z,`Lane cleared! +${reward} · attack the space.`);}
  }
  if(shot.age>1.8||shot.z< -72)shot.active=false;
 }
 for(const o of s.objects){
  if(o.passed)continue;
  const defender=o.kind==='defender',reach=defender?runnerDefenderReach(o):null;
  const contact=reach?o.z-travel<=reach.z&&o.z>=-reach.z:crossesPickup(-(o.z-travel),-o.z);
  if(!contact)continue;
  const same=Math.abs(s.x-(o.x??o.lane*2.4))<(reach?.x??.85),slip=defender&&s.slide>0&&(o.role??'jockey')!=='tackler',evaded=s.y>=.9||slip;
  if(!defender)o.passed=true;
  if(o.kind==='goal'){s.streak=0;s.combo=0;s.message='Shoot before reaching the goal. Look up early!';}
  else if(same&&o.kind==='coin'){s.score+=25*runnerMultiplier(s);cleanPlay(s);s.energy++;s.balls=Math.min(5,s.balls+1);s.collected++;feedback(s,'collect',s.x,o.z,s.balls===5?'Five balls ready. Shoot to create space!':`Ball collected · ${s.balls}/5 ready to shoot`);if(s.energy===5){s.energy=0;s.boost=3;s.message='Five clean touches. Break away! Shoot for a power goal.';}}
  else if(same&&o.kind!=='coin'&&s.hurt===0&&s.boost===0&&!evaded){o.passed=true;s.lives--;s.streak=0;s.combo=0;s.energy=0;s.hurt=1.2;feedback(s,'hit',s.x,0,s.lives?(o.role==='tackler'?'Low tackle! Jump or change lanes next time.':'Tackled! Shoot or cut into the open lane.'):'Full time. Try a new route.');}
  else if(same&&o.kind!=='coin'&&evaded&&s.boost===0){o.passed=true;const reward=40*runnerMultiplier(s);s.score+=reward;cleanPlay(s);feedback(s,'skill',s.x,0,`${slip?'Slipped the defender':'Clean hurdle'}! +${reward}`);}
  else if(same&&o.kind!=='coin'&&s.boost>0){o.passed=true;o.knock=.65;s.score+=50;feedback(s,'clear',s.x,o.z,'Power run! +50');}
  if(defender&&o.z>(reach?.z??.9))o.passed=true;
 }
 for(let i=s.objects.length-1;i>=0;i--)if(s.objects[i].z>9||s.objects[i].kind==='coin'&&s.objects[i].passed)s.objects.splice(i,1);
}
