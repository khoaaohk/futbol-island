import {JUMP_V,crossesPickup,goalPoints} from '../../components/games/runnerPhysics';
export const RUNNER_STRIKE_X=-.3;
/** Each stage introduces a football decision before adding another defensive line. */
export const RUNNER_STAGES=[
 {name:'Find space',lesson:'Follow the footballs into the open lane.',patterns:2},
 {name:'Read the defender',lesson:'Read the planted foot. Jump low tackles; slide past upright defenders.',patterns:3},
 {name:'Change direction',lesson:'Beat the first line, then cut into the next opening.',patterns:4},
 {name:'Build the attack',lesson:'Collect on the first touch, then choose your next route.',patterns:5},
 {name:'Beat the press',lesson:'Draw the defender, then attack the space they leave.',patterns:6},
 {name:'Complete striker',lesson:'Link clean touches, lane changes and composed finishes.',patterns:6},
] as const;
export type RunnerDefender='jockey'|'tackler'|'sweeper';
export type RunnerObject={lane:number;z:number;kind:'defender'|'cone'|'coin'|'goal';passed:boolean;openLane:number;knock?:number;scored?:boolean;x?:number;vx?:number;read?:number;aim?:number;reaction?:number;netHit?:number;hitX?:number;role?:RunnerDefender;tackle?:number;goalBurst?:number;returnKick?:number;returnCooldown?:number;returnAim?:number};
export type RunnerShot={active:boolean;x:number;z:number;age:number;power:boolean;height?:number;volley?:boolean;precision?:boolean;blast?:number;penetrations?:number;returner?:RunnerObject;returning?:boolean;windup?:number;vx?:number;aimX?:number};
export function createRunnerGame(){return{time:0,distance:0,x:0,vx:0,lean:0,slidePose:0,jumpPrep:0,landing:0,stride:0,lane:0,y:0,vy:0,jumping:false,slide:0,boost:0,energy:0,balls:1,collected:0,charging:false,charge:0,queuedMove:'' as ''|'jump'|'slide',moveBuffer:0,shotBuffer:0,bufferedPower:0,lastBlast:0,lastVolley:false,kick:0,shotCooldown:0,celebrate:0,score:0,goals:0,streak:0,lives:3,hurt:0,spawn:0,nextGoal:90,seed:47,wave:0,level:1,stageName:RUNNER_STAGES[0].name as string,stageProgress:0,combo:0,bestCombo:0,readLane:0,pattern:'Follow the footballs',objects:[] as RunnerObject[],shots:Array.from({length:4},()=>({active:false,x:0,z:0,age:0,power:false} as RunnerShot)),event:0,eventKind:'touch',eventX:0,eventZ:0,message:'Collect footballs. Line up your lane, then shoot.'};}
export type RunnerGame=ReturnType<typeof createRunnerGame>;
export function runnerMultiplier(s:RunnerGame){return Math.min(3,1+Math.floor(s.combo/6));}
function cleanPlay(s:RunnerGame){s.combo++;s.bestCombo=Math.max(s.bestCombo,s.combo);}
// Patterns are authored in metres: every challenge leaves a visible open lane,
// and the ball trail arrives before its corresponding defensive line.
export function spawnRunnerPattern(s:RunnerGame){
 const goal=s.objects.find(o=>o.kind==='goal'&&!o.passed&&o.z<0);
 if(goal){s.readLane=goal.openLane;s.pattern='Find the golden opening';return 24;}
 // Reserve a distinct finishing beat: no fresh obstacle line is placed across a goal.
 if(s.nextGoal-s.distance<50)return 18;
 const index=s.wave++,stage=RUNNER_STAGES[Math.min(5,s.level-1)];
 const lane=[0,-1,1,0,1,-1][index%6];s.readLane=lane;
 const pattern=index%stage.patterns;
 let defenderIndex=0;const roles:RunnerDefender[]=['jockey','tackler','sweeper'];
 const add=(kind:RunnerObject['kind'],lane:number,z:number)=>s.objects.push({kind,lane,z,passed:false,openLane:0,...(kind==='defender'?{role:roles[(index+defenderIndex++)%roles.length]}:{})});
 const trail=(open:number,start:number)=>{for(let i=0;i<3;i++)add('coin',open,start-i*4);};
 const line=(open:number,z:number,cones:boolean)=>{let first=true;for(const blocked of[-1,0,1])if(blocked!==open){add(cones&&first?'cone':'defender',blocked,z);first=false;}};
 s.pattern=['Follow the footballs','Switch into space','Split the defenders','Cut after the first line','Collect, then create space','Read two defensive lines'][pattern];
 if(pattern===0)line(lane,-57,true);
 else if(pattern===1){add('defender',-lane||1,-57);if(s.level>1)add('cone',lane===0?-1:0,-57);}
 else line(lane,-57,pattern===4);
 trail(lane,-40);
 if(pattern>=3){
  // Adjacent-lane changes only; 30 m leaves >1.28 s even at maximum boosted speed.
  const next=lane===0?(index%2?-1:1):0;
  if(pattern===3)line(next,-87,true);
  else if(pattern===4){add('defender',lane,-87);add('cone',-lane-next,-87);}
  else line(next,-87,false);
  trail(next,-70);
  return 74;
 }
 if(s.wave===1)s.message='Follow the footballs. A clear lane is always available.';
 return 42;
}
/** The tackle volume matches the extended leg, not just the torso centre. */
const DEFENDER_REACH={rest:{x:.85,z:.9},jockey:{x:.92,z:1.2},tackler:{x:.94,z:2.1},sweeper:{x:1.15,z:1.55}} as const;
export function runnerDefenderReach(o:RunnerObject){return (o.tackle??0)>.08&&(o.tackle??0)<.7?DEFENDER_REACH[o.role??'jockey']:DEFENDER_REACH.rest;}
function feedback(s:RunnerGame,kind:string,x:number,z:number,message:string){s.event++;s.eventKind=kind;s.eventX=x;s.eventZ=z;s.message=message;}
/** A late press is kept through landing. Early airborne presses never create
 * an automatic chain: the player still reads and times each challenge. */
export function runnerJump(s:RunnerGame){if(s.lives<=0)return;if(s.jumping){s.queuedMove='jump';s.moveBuffer=.18;return;}s.queuedMove='';s.moveBuffer=0;s.jumping=true;s.vy=JUMP_V;s.jumpPrep=.09;s.landing=0;s.slide=0;}
export function runnerSlide(s:RunnerGame){if(s.lives<=0)return;if(s.jumping){s.queuedMove='slide';s.moveBuffer=.18;return;}s.queuedMove='';s.moveBuffer=0;s.slide=.65;}
export function runnerCharge(s:RunnerGame,held:boolean){if(held){if(s.lives>0&&s.balls>0&&!s.charging){s.charging=true;s.charge=0;}}else{s.charging=false;s.charge=0;s.shotBuffer=0;s.bufferedPower=0;s.moveBuffer=0;s.queuedMove='';}}
export function runnerRelease(s:RunnerGame){if(!s.charging)return false;s.charging=false;
 // Preserve a deliberate charged release during the last instant of recovery.
 // Long slides still require a new shot rather than firing an unexpected kick.
 if(s.balls>0&&s.lives>0&&(s.slide>0||s.shotCooldown>0)&&s.slide<=.16&&s.shotCooldown<=.16){s.shotBuffer=.18;s.bufferedPower=s.charge;s.charge=0;return true;}
 const fired=runnerShoot(s);s.charge=0;return fired;}
export function runnerShoot(s:RunnerGame){
 if(s.lives<=0||s.shotCooldown>0)return false;
 if(s.balls===0){s.message='No ball! Collect a football to reload.';return false;}
 if(s.slide>0){s.message='Set your feet before you shoot.';return false;}
 const shot=s.shots.find(p=>!p.active);if(!shot)return false;
 const volley=s.jumping&&s.y>.45;
 const goal=s.objects.find(o=>o.kind==='goal'&&!o.passed&&o.z< -8&&o.z> -22&&Math.abs(s.x-o.openLane*2.4)<.65);
 Object.assign(shot,{active:true,returner:undefined,returning:false,windup:0,vx:0,aimX:0,volley,height:volley?s.y*.65+.4:.28,x:s.x+RUNNER_STRIKE_X,z:-.9,age:0,power:s.boost>0||s.charge>=.8,precision:!!goal,blast:s.charge,penetrations:s.charge>=.8?2:0});s.balls--;s.lastVolley=volley;s.lastBlast=s.charge;s.kick=.3;s.shotCooldown=.3;
 feedback(s,'shot',shot.x,-.9,volley?'AERIAL VOLLEY! Meet it in the air, then land balanced.':s.charge>=.8?'POWER BLAST! Drive through the defence.':'Shot away! Keep moving into space.');return true;
}
export function tickRunner(s:RunnerGame,dt:number){
 if(s.lives<=0)return;dt=Math.max(0,Math.min(dt,.05));s.time+=dt;s.moveBuffer=Math.max(0,s.moveBuffer-dt);s.shotBuffer=Math.max(0,s.shotBuffer-dt);if(s.charging)s.charge=Math.min(1,s.charge+dt/1.1);s.hurt=Math.max(0,s.hurt-dt);s.slide=Math.max(0,s.slide-dt);s.boost=Math.max(0,s.boost-dt);s.kick=Math.max(0,s.kick-dt);s.shotCooldown=Math.max(0,s.shotCooldown-dt);s.celebrate=Math.max(0,s.celebrate-dt);
 // Exact critically damped spring: a lane cut accelerates and plants without
 // snapping velocity or overshooting, including when the player reverses it.
 const previousX=s.x,previousY=s.y,previousVy=s.vy;
 const offset=s.x-s.lane*2.4,omega=22,impulse=s.vx+omega*offset,decay=Math.exp(-omega*dt);
 s.x=s.lane*2.4+(offset+impulse*dt)*decay;s.vx=(s.vx-omega*impulse*dt)*decay;
 const blend=1-Math.exp(-dt*18);s.lean+=(Math.max(-1,Math.min(1,s.vx/10))-s.lean)*blend;
 s.slidePose+=(Math.min(1,s.slide/.16)-s.slidePose)*(1-Math.exp(-dt*24));
 s.jumpPrep=Math.max(0,s.jumpPrep-dt);s.landing=Math.max(0,s.landing-dt);
 // Analytic ballistic integration keeps the same hurdle height at 30/60/120 Hz.
 if(s.jumping){s.y+=s.vy*dt-21*dt*dt;s.vy-=42*dt;if(s.y<=0&&s.vy<0){s.y=0;s.vy=0;s.jumping=false;s.landing=.2;}}

 if(!s.jumping&&s.moveBuffer>0){const move=s.queuedMove;if(move==='jump')runnerJump(s);else if(move==='slide')runnerSlide(s);}
 if(s.shotBuffer>0&&s.slide<=0&&s.shotCooldown<=0){const heldPower=s.charge;s.charge=s.bufferedPower;s.shotBuffer=0;runnerShoot(s);s.charge=heldPower;}
 const nextLevel=1+Math.floor(s.distance/360);
 if(nextLevel!==s.level){s.level=nextLevel;const stage=RUNNER_STAGES[Math.min(5,s.level-1)];s.stageName=stage.name;s.message=`STAGE ${s.level} · ${stage.name}. ${stage.lesson}`;}
 s.stageProgress=(s.distance%360)/360;const speed=(13+Math.min(5,(s.level-1)*1.1))*(s.boost>0?1.3:1),travel=speed*dt;s.distance+=travel;s.spawn-=dt;
 s.stride+=dt*speed*.7*(1-s.slidePose*.85)*(1-(s.kick>0?Math.sin(s.kick/.3*Math.PI/2):0)*.5);
 if(s.distance>=s.nextGoal){s.nextGoal+=180;const lane=[0,1,-1][Math.floor((s.nextGoal-270)/180)%3];s.readLane=lane;s.objects.push({lane:0,z:-60,kind:'goal',passed:false,openLane:lane});for(let i=0;i<3;i++)s.objects.push({lane,z:-28-i*4,kind:'coin',passed:false,openLane:0});s.pattern='Find the golden opening';s.message=`Goal ahead: ${lane<0?'left':lane>0?'right':'centre'} lane. Follow gold, then shoot!`;}
 if(s.spawn<=0)s.spawn=spawnRunnerPattern(s)/speed;
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
    if(Math.abs(crossX-(previousX+(s.x-previousX)*t))<.62&&Math.max(0,previousY+previousVy*dt*t-21*dt*dt*t*t)<.8&&s.hurt===0&&s.boost===0){s.lives--;s.hurt=1.2;s.combo=s.streak=s.energy=0;feedback(s,'hit',s.x,0,s.lives?'Return caught you! Jump or cut away after shooting.':'Full time. Try a new route.');}
    else if(s.hurt===0){s.score+=40;cleanPlay(s);feedback(s,'skill',crossX,0,'Return avoided! +40 · attack the space.');}}
   if(shot.age>3||shot.z>3)shot.active=false;continue;}
  const previous=shot.z;shot.z-=(40+(shot.blast??0)*14)*dt;shot.age+=dt;
  // Resolve every permitted penetration within this sweep, not one target per frame.
  for(let contacts=0;contacts<3&&shot.active&&!shot.returner;contacts++){let target:RunnerObject|undefined;
  for(const o of s.objects){if(o.passed||o.kind==='coin'||o.z>previous+travel+.5||o.z<shot.z-.5)continue;const hitTime=Math.max(0,Math.min(1,(previous-o.z+travel)/Math.max(.00001,previous-shot.z+travel)));const targetX=(o.x??o.lane*2.4)-(o.vx??0)*dt*(1-hitTime);if(o.kind!=='goal'&&Math.abs(shot.x-targetX)>.85)continue;if(!target||o.z>target.z)target=o;}
  if(!target)break;
  if(target.kind==='defender'&&!shot.power&&!shot.volley&&target.z< -12&&target.z> -38&&(target.returnCooldown??0)<=0&&(target.tackle??0)===0){
   // A planted, centred boot can return a normal shot. Edge contacts and blasts beat it.
   if(Math.abs(shot.x-(target.x??target.lane*2.4))<.55){shot.returner=target;shot.windup=.3;shot.aimX=s.x;shot.x=(target.x??target.lane*2.4)+.2;shot.z=target.z+.6;target.returnCooldown=2;target.returnAim=Math.atan2((shot.aimX??0)-shot.x,-shot.z);feedback(s,'block',shot.x,shot.z,'BLOCKED · defender winding up! Jump or cut away.');continue;}}
  if(target){shot.active=false;if(target.kind==='goal'){target.hitX=shot.x;
    if(Math.abs(shot.x-target.openLane*2.4)<1.05){target.passed=true;target.scored=true;target.netHit=.65;target.goalBurst=0;s.goals++;s.streak++;s.celebrate=1;const reward=(goalPoints(shot.power,s.streak)+150+(shot.precision?150:0))*runnerMultiplier(s);cleanPlay(s);s.score+=reward;feedback(s,'goal',shot.x,target.z,`${shot.precision?'PERFECT FINISH':'GOAL'}! +${reward} · ${s.streak>1?`×${Math.min(3,s.streak)} streak`:'Great finish!'}`);}
    else{target.reaction=.5;s.streak=0;s.combo=0;feedback(s,'save',shot.x,target.z,'Saved! Find the golden opening and shoot again.');}
   }else{target.passed=true;target.knock=.65;if((shot.penetrations??0)>0){shot.penetrations=Math.max(0,(shot.penetrations??0)-1);shot.active=true;}const reward=100*runnerMultiplier(s);s.score+=reward;cleanPlay(s);feedback(s,'clear',shot.x,target.z,`Lane cleared! +${reward} · attack the space.`);}
  }
  }
  if(shot.age>1.8||shot.z< -72)shot.active=false;
 }
 for(const o of s.objects){
  if(o.passed)continue;
  const defender=o.kind==='defender',reach=defender?runnerDefenderReach(o):null;
  const contact=reach?o.z-travel<=reach.z&&o.z>=-reach.z:crossesPickup(-(o.z-travel),-o.z);
  if(!contact)continue;
  const crossing=Math.max(0,Math.min(1,(travel-o.z)/Math.max(.00001,travel))),contactX=previousX+(s.x-previousX)*crossing,defenderX=(o.x??o.lane*2.4)-(o.vx??0)*dt*(1-crossing),contactY=Math.max(0,previousY+previousVy*dt*crossing-21*dt*dt*crossing*crossing);
  const same=Math.abs(contactX-defenderX)<(reach?.x??.85),slip=defender&&s.slide>0&&(o.role??'jockey')!=='tackler',evaded=contactY>=.9||slip;
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
