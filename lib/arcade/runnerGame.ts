import {JUMP_V,crossesPickup,goalPoints} from '../../components/games/runnerPhysics';
export const RUNNER_STRIKE_X=-.3;
/** Each stage introduces a football decision before adding another defensive line. */
export const RUNNER_STAGES=[
 {name:'Find space',lesson:'Follow the footballs into the open lane.',patterns:2},
 {name:'Read the defender',lesson:'Read the stance. Jump low tackles; use a skill move on a square defender.',patterns:3},
 {name:'Change direction',lesson:'Watch the gap. If a defender closes it, cut into the space they left.',patterns:5},
 {name:'Build the attack',lesson:'Use your teammate: a one-two takes a defender out of the game.',patterns:6},
 {name:'Beat the press',lesson:'Two defenders closing? Go round them, or split them with fast feet.',patterns:7},
 {name:'Complete striker',lesson:'Beat the back line, then pick your finish against the keeper.',patterns:7},
] as const;
/** Two-line patterns (3, 4, 5) are spread between single lines so a new stage never stacks them. */
export const RUNNER_PATTERN_ORDER=[0,3,1,4,2,6,5] as const;
export const runnerPatternFor=(index:number,patterns:number)=>{const order=RUNNER_PATTERN_ORDER.filter(p=>p<patterns);return order[index%order.length];};
/** Jockey pokes, tackler slides low, sweeper blocks wide, presser closes you down (stage 3+),
 * wall stands square with its feet apart (stage 2+), pair squeezes a gap (stage 5+),
 * line is a back-line defender in a boss shift. */
export type RunnerDefender='jockey'|'tackler'|'sweeper'|'presser'|'wall'|'pair'|'line';
/** Skill move that beats each defender family when timed (real football counters). */
export const RUNNER_SKILL_FOR={jockey:'stepover',presser:'roulette',tackler:'dragBack',sweeper:'rainbowFlick',wall:'nutmeg',pair:'croqueta',line:'bodyFeint'} as const;
export type RunnerSkill=typeof RUNNER_SKILL_FOR[RunnerDefender]|'chipShot';
export const RUNNER_SKILLS:Record<RunnerSkill,{label:string;teach:string;seconds:number}>={
 stepover:{label:'Step-over',teach:'Foot round the ball, then go the other way.',seconds:.6},
 roulette:{label:'Roulette',teach:'Spin, and keep your body between ball and defender.',seconds:.7},
 dragBack:{label:'Drag-back',teach:'Sole on the ball, pull it back: the tackle hits nothing.',seconds:.6},
 rainbowFlick:{label:'Rainbow flick',teach:'Flick it over a flat-footed defender.',seconds:.75},
 nutmeg:{label:'Nutmeg',teach:'Feet wide apart? Slip it through the legs.',seconds:.7},
 croqueta:{label:'Croqueta',teach:'Fast feet, side to side, through the gap.',seconds:.55},
 bodyFeint:{label:'Body feint',teach:'Dip your shoulder one way, go the other.',seconds:.55},
 chipShot:{label:'Chip',teach:'Keeper off the line? Lift it over.',seconds:.6},
};
/** Seconds of contact time in which a skill move beats its defender; the inner band is perfect. */
export const RUNNER_SKILL_WINDOW={early:.72,late:.07,perfectEarly:.42,perfectLate:.15} as const;
/** Power run: clean (non-link) touches to fill the meter, burst length, and whether it is a
 * one-tackle shield (user decision Oct 4 2026: option b) or the old full invincibility. */
export const RUNNER_TUNING={powerTouches:8,powerSeconds:3,powerShield:true};
/** Seconds of the full-time beat (stumble, slow-down, whistle) before the result card. */
export const RUNNER_OUTRO=1.35;
/** Forward closing speed of a presser, m/s. Read-to-contact stays above one second at max speed. */
export const RUNNER_PRESS_SPEED=4.2;
/** Keeper sway period (s) and how far from the keeper a placed/power shot must go to score. */
export const RUNNER_KEEPER={period:2.6,sway:1.9,placedGap:1.2,powerGap:.8,cornerGap:2};
export type RunnerRoute='main'|'wing'|'middle';
export type RunnerObject={lane:number;z:number;kind:'defender'|'cone'|'coin'|'goal'|'mud'|'mate'|'fork';passed:boolean;openLane:number;knock?:number;scored?:boolean;x?:number;vx?:number;read?:number;aim?:number;reaction?:number;netHit?:number;hitX?:number;role?:RunnerDefender;tackle?:number;goalBurst?:number;returnKick?:number;returnCooldown?:number;returnAim?:number;threat?:number;press?:number;link?:boolean;
 /** Closer: steps from its lane into this lane after its read (stage 3+). */closeTo?:number;closing?:number;closeThreat?:boolean;
 /** Skill move beat this defender; it is wrong-footed and cannot tackle. */beaten?:number;
 /** Back-line boss: slot (0 left, 1 right of the pair), clock and current shift (-1 left pair, 1 right pair). */slot?:number;lineClock?:number;shift?:number;boss?:boolean;
 /** Mud: length in metres; over = cleared it in the air. */length?:number;over?:boolean;
 /** Keeper goal: keeper x, sway clock, rush (0..1 off the line), rush enabled, wing cross finish. */keeper?:boolean;kx?:number;kclock?:number;kout?:number;rush?:boolean;cross?:boolean;danger?:boolean;
 /** Bonus ball for brave skill takers. */bonus?:boolean};
export type RunnerShot={active:boolean;x:number;z:number;age:number;power:boolean;height?:number;volley?:boolean;precision?:boolean;blast?:number;penetrations?:number;returner?:RunnerObject;returning?:boolean;windup?:number;vx?:number;aimX?:number;chip?:boolean};
export function createRunnerGame(){return{time:0,distance:0,x:0,vx:0,lean:0,slidePose:0,jumpPrep:0,landing:0,stride:0,lane:0,y:0,vy:0,jumping:false,slide:0,boost:0,energy:0,balls:1,collected:0,charging:false,charge:0,queuedMove:'' as ''|'jump'|'slide',moveBuffer:0,shotBuffer:0,bufferedPower:0,lastBlast:0,lastVolley:false,kick:0,shotCooldown:0,celebrate:0,score:0,goals:0,streak:0,lives:3,hurt:0,spawn:0,nextGoal:90,seed:47,wave:0,level:1,stageName:RUNNER_STAGES[0].name as string,stageProgress:0,combo:0,bestCombo:0,readLane:0,pattern:'Follow the footballs',objects:[] as RunnerObject[],shots:Array.from({length:4},()=>({active:false,x:0,z:0,age:0,power:false} as RunnerShot)),event:0,eventKind:'touch',eventX:0,eventZ:0,eventAt:-9,message:'Collect footballs. Line up your lane, then shoot.',
 /* Feel/presentation state: read by the renderer and audio, never by collisions. */
 speed:13,prevLane:0,cutDir:0,cutAge:9,cuts:0,jumps:0,slides:0,landings:0,nearMisses:0,nearStreak:0,recover:0,outro:0,hits:0,
 /* Depth systems (Oct 4 2026, round 2). */
 shield:false,easeNext:false,mud:0,burst:0,
 skill:'' as RunnerSkill|'',skillT:0,skillSide:1 as -1|1,skillCooldown:0,skillPerfect:false,
 pass:{phase:'' as ''|'out'|'back',t:0,mateX:0,mateZ:0},
 route:'main' as RunnerRoute,goalCount:0,bossPending:false,boss:0,bossSeen:0,
 /* Mission counters. */
 skills:0,skillKinds:[] as string[],oneTwos:0,chips:0,headers:0,bosses:0,hurdles:0,puddleJumps:0,cornerGoals:0,rounded:0,shieldSaves:0,wingRuns:0,middleRuns:0,closersBeaten:0};}
export type RunnerGame=ReturnType<typeof createRunnerGame>;
export function runnerMultiplier(s:RunnerGame){return Math.min(3,1+Math.floor(s.combo/6));}
function cleanPlay(s:RunnerGame){s.combo++;s.bestCombo=Math.max(s.bestCombo,s.combo);}
/** Pace: smooth ramp to 18 m/s by stage 5, then a gentle climb to 20 m/s. */
export function runnerPace(distance:number){return 13+Math.min(5,distance/360*1.1)+Math.min(2,Math.max(0,distance-1636)/1000);}
// Patterns are authored in metres: every challenge leaves a visible open lane,
// and the ball trail arrives before its corresponding defensive line.
export function spawnRunnerPattern(s:RunnerGame){
 const goal=s.objects.find(o=>o.kind==='goal'&&!o.passed&&o.z<0);
 if(goal){s.readLane=goal.openLane;s.pattern=goal.keeper?'Watch the keeper':'Find the golden opening';return 24;}
 // Reserve a distinct finishing beat: no fresh obstacle line is placed across a goal or a back line.
 const room=s.nextGoal-s.distance;if(room<(runnerBossDue(s)||s.bossPending?175:62))return 18;
 const index=s.wave++,stage=RUNNER_STAGES[Math.min(5,s.level-1)];
 const lane=[0,-1,1,0,1,-1][index%6];s.readLane=lane;
 // Kind reset: right after a lost chance the next encounter is a single, simple line.
 // Wing route: single lines and more footballs; middle route: the busy patterns.
 let pattern=runnerPatternFor(index,stage.patterns);
 if(s.easeNext){pattern=index%2?1:0;s.easeNext=false;}
 else if(s.route==='wing')pattern=index%2?1:0;
 else if(s.route==='middle'&&pattern<2&&s.level>=3)pattern=index%2?5:2;
 // Lines must be behind the runner before the goal's golden trail appears.
 if(room<95&&pattern>=3&&pattern!==6)pattern=index%2?1:0;
 let defenderIndex=0;const roles:RunnerDefender[]=s.level>=3?['jockey','presser','tackler','wall','sweeper']:s.level>=2?['jockey','tackler','wall','sweeper']:['jockey','tackler','sweeper'];
 const add=(kind:RunnerObject['kind'],lane:number,z:number,extra?:Partial<RunnerObject>)=>{const o:RunnerObject={kind,lane,z,passed:false,openLane:0,...(kind==='defender'?{role:roles[(index+defenderIndex++)%roles.length]}:{}),...extra};s.objects.push(o);return o;};
 // The trail fades as the player learns to read defenders: 3 balls, then 2 from stage 4.
 const trailCount=s.route==='wing'?3:s.level>=4?2:3;
 const trail=(open:number,start:number)=>{for(let i=3-trailCount;i<3;i++)add('coin',open,start-i*4);};
 // A link ball sits just beyond each gap, so the trail visibly runs THROUGH the
 // opening before it turns. Following the footballs never lures an early cut
 // into a defender. Link balls reload but do not build the power-run meter.
 const link=(open:number,lineZ:number)=>s.objects.push({kind:'coin',lane:open,z:lineZ-4,passed:false,openLane:0,link:true});
 const line=(open:number,z:number,cones:boolean)=>{let first=true;for(const blocked of[-1,0,1])if(blocked!==open){add(cones&&first?'cone':'defender',blocked,z);first=false;}};
 s.pattern=['Follow the footballs','Switch into space','Split the defenders','Cut after the first line','Collect, then create space','Read two defensive lines','Split the pair'][pattern];
 let linkLane=lane;
 if(pattern===0)line(lane,-57,true);
 else if(pattern===1){add('defender',-lane||1,-57);if(s.level>1)add('cone',lane===0?-1:0,-57);}
 else if(pattern===6){
  // Two defenders squeeze the middle: go round the outside, or burst between them early.
  const open=lane===0?(index%2?-1:1):lane;
  add('defender',-1,-57,{role:'pair'});add('defender',1,-57,{role:'pair'});
  trail(open,-40);link(open,-57);
  s.pattern='Split the pair';return 42*Math.max(.82,1-(s.level-1)*.04);
 }
 else if(pattern===2&&s.level>=3&&index%2===0){
  // Closer: a defender steps across into the trail lane after a visible read.
  // The lane it leaves is the new opening. No link ball here: the player must read the step.
  const from=lane===0?(index%4?-1:1):0;
  for(const blocked of[-1,0,1])if(blocked!==lane)add('defender',blocked,-57,blocked===from?{closeTo:lane}:undefined);
  linkLane=NaN;s.pattern='Watch the gap close';
 }
 else line(lane,-57,pattern===4);
 // Puddles in the trail lane from stage 2: lift the ball over them.
 if(s.level>=2&&(pattern===0||pattern===1)&&index%3===2)add('mud',lane,-41.2,{length:2.6});
 // A teammate on the wing from stage 2: a one-two beats the next defender.
 if(s.level>=2&&(pattern===1||pattern===2)&&index%3===1){const side=lane===0?(index%2?-1:1):lane;add('mate',side,-46,{x:side*4.3});}
 trail(lane,-40);
 if(pattern>=3){
  // Adjacent-lane changes only; 30 m leaves >1.15 s even at maximum boosted speed.
  const next=lane===0?(index%2?-1:1):0;
  if(pattern===3)line(next,-87,true);
  else if(pattern===4){add('defender',lane,-87);add('cone',-lane-next,-87);}
  else line(next,-87,false);
  trail(next,-70);
  link(lane,-57);link(next,-87);
  return 74;
 }
 if(!Number.isNaN(linkLane))link(linkLane,-57);
 if(s.wave===1)s.message='Follow the footballs. A clear lane is always available.';
 return 42*Math.max(.82,1-(s.level-1)*.04);
}
/** The back-line boss: two lines of two defenders that shift across together. */
/** From stage 2, every second goal of the run is guarded by a back line first. */
export const runnerBossDue=(s:RunnerGame)=>s.level>=2&&s.goalCount%2===1&&!s.boss&&!s.bossPending;
export function spawnRunnerBoss(s:RunnerGame){
 s.boss=2;s.bossPending=false;s.pattern='Beat the back line';
 // The first back line of a run is a single line; later ones come in two waves.
 const lines:readonly (readonly [number,number])[]=s.bossSeen++===0?[[-60,-1]]:[[-60,-1],[-92,1]];
 for(const [z,shift] of lines)for(const slot of[0,1])s.objects.push({kind:'defender',role:'line',lane:shift>0?slot:slot-1,z,passed:false,openLane:shift>0?-1:1,slot,shift,lineClock:0,boss:true});
 s.message='THE BACK LINE! They shift together. Attack the side they leave open.';s.event++;s.eventKind='boss';s.eventX=0;s.eventZ=-60;
}
/** The tackle volume matches the extended leg, not just the torso centre. */
export const RUNNER_DEFENDER_REACH={rest:{x:.85,z:.9},jockey:{x:.92,z:1.2},tackler:{x:.94,z:2.1},sweeper:{x:1.15,z:1.55},presser:{x:.95,z:1.35},wall:{x:.95,z:1.1},pair:{x:.92,z:1.2},line:{x:.95,z:1.1}} as const;
export function runnerDefenderReach(o:RunnerObject){return (o.tackle??0)>.08&&(o.tackle??0)<.7?RUNNER_DEFENDER_REACH[o.role??'jockey']:RUNNER_DEFENDER_REACH.rest;}
function feedback(s:RunnerGame,kind:string,x:number,z:number,message:string){s.event++;s.eventAt=s.time;s.eventKind=kind;s.eventX=x;s.eventZ=z;s.message=message;}
/** One place for losing a chance: a short kind slow-down, then the full-time beat. */
function loseChance(s:RunnerGame,message:string){s.lives--;s.hurt=1.2;s.combo=s.streak=s.energy=0;s.nearStreak=0;s.hits++;s.recover=1.6;s.easeNext=true;s.skill='';if(s.boss)s.boss=-1;if(s.lives<=0){s.outro=RUNNER_OUTRO;s.charging=false;s.charge=0;}feedback(s,'hit',s.x,0,s.lives?message:'Full time! Great effort. One more run?');}
/** A power-run shield takes one tackle instead of a chance. */
function absorb(s:RunnerGame,o:RunnerObject|undefined,x:number,z:number){s.shield=false;s.shieldSaves++;s.hurt=.35;if(o){o.passed=true;o.knock=.65;}s.score+=50;feedback(s,'shield',x,z,'Strong on the ball! Your power run rode that tackle. +50');}
/** Advances only the full-time beat after the last chance. The match clock
 * (s.time) and all rules stay frozen; the world coasts to a stop. */
export function runnerOutro(s:RunnerGame,dt:number){
 if(s.lives>0||s.outro<=0)return;dt=Math.max(0,Math.min(dt,.05));s.outro=Math.max(0,s.outro-dt);
 const k=s.outro/RUNNER_OUTRO,travel=s.speed*k*k*dt;s.distance+=travel;for(const o of s.objects)o.z+=travel;
 s.hurt=Math.max(0,s.hurt-dt);s.slide=Math.max(0,s.slide-dt);s.slidePose*=Math.exp(-dt*10);s.kick=Math.max(0,s.kick-dt);
 if(s.jumping){s.y+=s.vy*dt-21*dt*dt;s.vy-=42*dt;if(s.y<=0){s.y=0;s.vy=0;s.jumping=false;}}
 s.stride+=dt*s.speed*.7*k;
}
/** Full time is shown only after the outro beat has played. */
export function runnerOver(s:RunnerGame){return s.lives<=0&&s.outro<=0;}
/** A late press is kept through landing. Early airborne presses never create
 * an automatic chain: the player still reads and times each challenge. */
export function runnerJump(s:RunnerGame){if(s.lives<=0)return;if(s.jumping){s.queuedMove='jump';s.moveBuffer=.18;return;}s.queuedMove='';s.moveBuffer=0;s.jumping=true;s.vy=JUMP_V;s.jumpPrep=.09;s.landing=0;s.slide=0;s.skill='';s.jumps++;}
export function runnerSlide(s:RunnerGame){if(s.lives<=0)return;if(s.jumping){s.queuedMove='slide';s.moveBuffer=.18;
 // Fast-fall: slide in the air drives the body down so the slide lands promptly.
 if(s.y>.25)s.vy=Math.min(s.vy,-13);return;}s.queuedMove='';s.moveBuffer=0;s.skill='';if(s.slide<=.1)s.slides++;s.slide=.65;}
export function runnerCharge(s:RunnerGame,held:boolean){if(held){if(s.lives>0&&s.balls>0&&!s.charging){s.charging=true;s.charge=0;}}else{s.charging=false;s.charge=0;s.shotBuffer=0;s.bufferedPower=0;s.moveBuffer=0;s.queuedMove='';}}
export function runnerRelease(s:RunnerGame){if(!s.charging)return false;s.charging=false;
 // Preserve a deliberate charged release during the last instant of recovery.
 // Long slides still require a new shot rather than firing an unexpected kick.
 if(s.balls>0&&s.lives>0&&(s.slide>0||s.shotCooldown>0)&&s.slide<=.16&&s.shotCooldown<=.16){s.shotBuffer=.18;s.bufferedPower=s.charge;s.charge=0;return true;}
 const fired=runnerShoot(s);s.charge=0;return fired;}
/** Defender in the player's path that a skill move would meet, nearest first. */
export function runnerSkillTarget(s:RunnerGame,far=-16){let best:RunnerObject|undefined;
 for(const o of s.objects){if(o.kind!=='defender'||o.passed||o.beaten||o.knock||o.z<far||o.z>-.3)continue;const reach=RUNNER_DEFENDER_REACH[o.role??'jockey'];if(Math.abs(s.x-(o.x??o.lane*2.4))>reach.x+.35)continue;if(!best||o.z>best.z)best=o;}
 return best;}
/** Seconds until a defender's active reach meets the player. */
export function runnerContactTime(s:RunnerGame,o:RunnerObject){return Math.max(0,-o.z-RUNNER_DEFENDER_REACH[o.role??'jockey'].z)/Math.max(1,s.speed);}
/** A keeper goal close enough to chip. */
function chipGoal(s:RunnerGame){return s.objects.find(o=>o.kind==='goal'&&o.keeper&&!o.passed&&o.z<-6&&o.z>-26);}
/** Skill button: the move is chosen by the defender family in front (each is a real
 * counter); the player chooses WHEN. Too early and the defender recovers. */
export function runnerSkill(s:RunnerGame){
 if(s.lives<=0||s.skillCooldown>0||s.skill)return false;
 if(s.balls<=0){s.message='No ball to dribble! Collect a football first.';return false;}
 if(s.jumping||s.slide>0){s.message='Get your feet set for a skill move.';return false;}
 const target=runnerSkillTarget(s);
 if(!target){const goal=chipGoal(s);
  if(goal&&s.shotCooldown<=0){const shot=s.shots.find(p=>!p.active);if(!shot)return false;
   Object.assign(shot,{active:true,returner:undefined,returning:false,windup:0,vx:0,aimX:0,volley:false,height:.28,x:s.x+RUNNER_STRIKE_X,z:-.9,age:0,power:false,precision:false,blast:0,penetrations:0,chip:true});
   s.balls--;s.kick=.3;s.shotCooldown=.3;s.skill='chipShot';s.skillT=0;s.skillSide=1;s.skillCooldown=.5;s.lastVolley=false;s.lastBlast=0;
   feedback(s,'shot',shot.x,-.9,(goal.kout??0)>.3?'CHIP! Lift it over the keeper.':'Chip away! Best when the keeper rushes out.');return true;}
  s.message='Skill moves beat a defender right in front of you.';return false;}
 const move=RUNNER_SKILL_FOR[target.role??'jockey'],spec=RUNNER_SKILLS[move],time=runnerContactTime(s,target);
 s.skill=move;s.skillT=0;s.skillSide=(target.x??target.lane*2.4)>s.x?-1:1;s.skillCooldown=.45;s.charging=false;s.charge=0;
 if(time>RUNNER_SKILL_WINDOW.early){s.skillPerfect=false;feedback(s,'early',s.x,target.z,`Too early! Wait until they are close, then ${spec.label.toLowerCase()}.`);return true;}
 const perfect=time<=RUNNER_SKILL_WINDOW.perfectEarly&&time>=RUNNER_SKILL_WINDOW.perfectLate;s.skillPerfect=perfect;
 target.beaten=1;if(target.role==='pair')for(const o of s.objects)if(o.role==='pair'&&!o.passed&&Math.abs(o.z-target.z)<.5)o.beaten=1;s.skills++;if(!s.skillKinds.includes(move))s.skillKinds.push(move);if(target.closing!==undefined)s.closersBeaten++;
 const reward=(60+(perfect?40:0))*runnerMultiplier(s);s.score+=reward;cleanPlay(s);
 feedback(s,'skillmove',s.x,target.z,`${perfect?'PERFECT ':''}${spec.label.toUpperCase()}! ${spec.teach} +${reward}`);return true;
}
export function runnerShoot(s:RunnerGame){
 if(s.lives<=0||s.shotCooldown>0)return false;
 if(s.balls===0){s.message='No ball! Collect a football to reload.';return false;}
 if(s.slide>0){s.message='Set your feet before you shoot.';return false;}
 // One-two: in a teammate's lane, the shot becomes a pass and the return comes back ahead.
 const mate=!s.jumping&&s.pass.phase===''&&s.objects.find(o=>o.kind==='mate'&&!o.passed&&o.z>-18&&o.z<-4&&s.lane===o.lane);
 if(mate){mate.passed=true;s.pass.phase='out';s.pass.t=0;s.pass.mateX=mate.x??mate.lane*4.3;s.pass.mateZ=mate.z;s.balls--;s.kick=.3;s.shotCooldown=.3;s.skill='';s.lastVolley=false;s.lastBlast=0;feedback(s,'pass',s.x,mate.z,'Pass! Now move: your teammate plays it back.');return true;}
 const shot=s.shots.find(p=>!p.active);if(!shot)return false;
 const volley=s.jumping&&s.y>.45;
 const goal=s.objects.find(o=>o.kind==='goal'&&!o.passed&&o.z< -8&&o.z> -22&&(o.keeper||Math.abs(s.x-o.openLane*2.4)<.65));
 Object.assign(shot,{active:true,returner:undefined,returning:false,windup:0,vx:0,aimX:0,volley,height:volley?s.y*.65+.4:.28,x:s.x+RUNNER_STRIKE_X,z:-.9,age:0,power:s.boost>0||s.charge>=.8,precision:!!goal,blast:s.charge,penetrations:s.charge>=.8?2:0,chip:false});s.balls--;s.lastVolley=volley;s.lastBlast=s.charge;s.kick=.3;s.shotCooldown=.3;s.skill='';
 feedback(s,'shot',shot.x,-.9,volley?'AERIAL VOLLEY! Meet it in the air, then land balanced.':s.charge>=.8?'POWER BLAST! Drive through the defence.':'Shot away! Keep moving into space.');return true;
}
/** Keeper position at a given time: a readable sway along the line, or rushing at the runner. */
function keeperStep(s:RunnerGame,o:RunnerObject,dt:number){
 o.kclock=(o.kclock??0)+dt;
 if(o.rush&&o.z>-30&&!o.scored)o.kout=Math.min(1,(o.kout??0)+dt/.9);
 const sway=Math.sin((o.kclock??0)*Math.PI*2/RUNNER_KEEPER.period)*RUNNER_KEEPER.sway;
 const target=(o.kout??0)>0?Math.max(-2.4,Math.min(2.4,s.x)):sway,old=o.kx??0;
 o.kx=old+(target-old)*(1-Math.exp(-dt*((o.kout??0)>0?2.4:6)));o.vx=dt?(o.kx-old)/dt:0;
 // The golden frame shows the side the keeper is leaving (guidance fades after stage 3).
 const ahead=(o.kx??0)+(o.vx??0)*.35;o.openLane=ahead>.4?-1:ahead<-.4?1:(o.vx??0)>0?-1:1;
}
function scoreGoal(s:RunnerGame,target:RunnerObject,x:number,power:boolean,precision:boolean,label:string){
 target.passed=true;target.scored=true;target.netHit=.65;target.goalBurst=0;target.hitX=x;s.goals++;s.streak++;s.celebrate=1;
 const reward=(goalPoints(power,s.streak)+150+(precision?150:0))*runnerMultiplier(s)*(target.danger?2:1);cleanPlay(s);s.score+=reward;
 feedback(s,'goal',x,target.z,`${label}! +${reward} · ${target.danger?'Danger zone ×2':s.streak>1?`×${Math.min(3,s.streak)} streak`:'Great finish!'}`);
}
/** Resolve a shot arriving at a goal. Keeper goals check the gap to the keeper and the shot type. */
function shotAtGoal(s:RunnerGame,shot:RunnerShot,target:RunnerObject){
 target.hitX=shot.x;
 if(!target.keeper){
  if(Math.abs(shot.x-target.openLane*2.4)<1.05)scoreGoal(s,target,shot.x,shot.power,!!shot.precision,shot.precision?'PERFECT FINISH':'GOAL');
  else{target.reaction=.5;s.streak=0;s.combo=0;feedback(s,'save',shot.x,target.z,'Saved! Find the golden opening and shoot again.');}
  return;}
 const gap=Math.abs(shot.x-(target.kx??0)),inside=Math.abs(shot.x)<3.5;
 if(target.cross){if(shot.volley&&inside){s.headers++;scoreGoal(s,target,shot.x,shot.power,true,'VOLLEYED THE CROSS');}else{target.reaction=.5;s.streak=0;feedback(s,'save',shot.x,target.z,'Cleared! Attack the cross: jump, then shoot in the air.');}return;}
 if(shot.chip){if(inside&&(target.kout??0)>.3){s.chips++;scoreGoal(s,target,shot.x,false,true,'CHIPPED IT');}else{target.reaction=.5;s.streak=0;feedback(s,'save',shot.x,target.z,inside?'Caught! A chip works when the keeper rushes off the line.':'Over the bar!');}return;}
 if((target.kout??0)>.35){target.reaction=.5;s.streak=0;s.combo=0;feedback(s,'save',shot.x,target.z,'Smothered! Keeper rushing out? Chip it (Skill) or go round him.');return;}
 if(inside&&gap>=(shot.power?RUNNER_KEEPER.powerGap:RUNNER_KEEPER.placedGap)){
  const corner=gap>=RUNNER_KEEPER.cornerGap;if(corner)s.cornerGoals++;
  scoreGoal(s,target,shot.x,shot.power,corner,corner?'INTO THE CORNER':shot.power?'POWER PAST HIM':'PLACED IT');}
 else{target.reaction=.5;s.streak=0;s.combo=0;feedback(s,'save',shot.x,target.z,'Keeper saved! Watch which way he moves, then shoot the other side.');}
}
export function tickRunner(s:RunnerGame,dt:number){
 if(s.lives<=0)return;dt=Math.max(0,Math.min(dt,.05));s.time+=dt;s.moveBuffer=Math.max(0,s.moveBuffer-dt);s.shotBuffer=Math.max(0,s.shotBuffer-dt);if(s.charging)s.charge=Math.min(1,s.charge+dt/1.1);s.hurt=Math.max(0,s.hurt-dt);s.slide=Math.max(0,s.slide-dt);s.boost=Math.max(0,s.boost-dt);if(s.boost<=0)s.shield=false;s.kick=Math.max(0,s.kick-dt);s.shotCooldown=Math.max(0,s.shotCooldown-dt);s.celebrate=Math.max(0,s.celebrate-dt);s.recover=Math.max(0,s.recover-dt);s.cutAge+=dt;s.mud=Math.max(0,s.mud-dt);s.burst=Math.max(0,s.burst-dt);s.skillCooldown=Math.max(0,s.skillCooldown-dt);
 if(s.skill){s.skillT+=dt;if(s.skillT>=RUNNER_SKILLS[s.skill].seconds){s.skill='';s.skillT=0;}}
 if(s.lane!==s.prevLane){s.cutDir=Math.sign(s.lane-s.prevLane);s.cutAge=0;s.cuts++;s.prevLane=s.lane;}
 // Exact critically damped spring: a lane cut accelerates and plants without
 // snapping velocity or overshooting, including when the player reverses it.
 const previousX=s.x,previousY=s.y,previousVy=s.vy;
 const offset=s.x-s.lane*2.4,omega=22,impulse=s.vx+omega*offset,decay=Math.exp(-omega*dt);
 s.x=s.lane*2.4+(offset+impulse*dt)*decay;s.vx=(s.vx-omega*impulse*dt)*decay;
 const blend=1-Math.exp(-dt*18);s.lean+=(Math.max(-1,Math.min(1,s.vx/10))-s.lean)*blend;
 s.slidePose+=(Math.min(1,s.slide/.16)-s.slidePose)*(1-Math.exp(-dt*24));
 s.jumpPrep=Math.max(0,s.jumpPrep-dt);s.landing=Math.max(0,s.landing-dt);
 // Analytic ballistic integration keeps the same hurdle height at 30/60/120 Hz.
 if(s.jumping){s.y+=s.vy*dt-21*dt*dt;s.vy-=42*dt;if(s.y<=0&&s.vy<0){s.y=0;s.vy=0;s.jumping=false;s.landing=.2;s.landings++;}}

 if(!s.jumping&&s.moveBuffer>0){const move=s.queuedMove;if(move==='jump')runnerJump(s);else if(move==='slide')runnerSlide(s);}
 if(s.shotBuffer>0&&s.slide<=0&&s.shotCooldown<=0){const heldPower=s.charge;s.charge=s.bufferedPower;s.shotBuffer=0;runnerShoot(s);s.charge=heldPower;}
 // One-two: out to the teammate, then the return arrives ahead of the runner.
 if(s.pass.phase){s.pass.t+=dt;if(s.pass.phase==='out'&&s.pass.t>=.32){s.pass.phase='back';s.pass.t=0;}
  else if(s.pass.phase==='back'&&s.pass.t>=.32){s.pass.phase='';s.pass.t=0;s.balls=Math.min(5,s.balls+1);s.burst=1.4;s.oneTwos++;
   const beat=s.objects.filter(o=>o.kind==='defender'&&!o.passed&&!o.beaten&&o.z>-36&&o.z<0&&Math.abs((o.x??o.lane*2.4)-s.x)<1.6).sort((a,b)=>b.z-a.z)[0];if(beat)beat.beaten=1;
   const reward=80*runnerMultiplier(s);s.score+=reward;cleanPlay(s);feedback(s,'onetwo',s.x,-6,`ONE-TWO! Pass and move${beat?': the return takes the defender out':''}. +${reward}`);}}
 const nextLevel=1+Math.floor(s.distance/360);
 if(nextLevel!==s.level){s.level=nextLevel;const stage=RUNNER_STAGES[Math.min(5,s.level-1)];s.stageName=stage.name;s.message=`STAGE ${s.level} · ${stage.name}. ${stage.lesson}`;}
 s.stageProgress=(s.distance%360)/360;
 // Pace ramps smoothly with distance (no stage-boundary jolt) and eases off for
 // a moment after a lost chance so the player can reset. Puddles drag; a one-two lifts it.
 const pace=runnerPace(s.distance),speed=pace*(s.boost>0?1.3:1)*(1-.16*Math.min(1,s.recover/1.2))*(1-.28*Math.min(1,s.mud/.4))*(1+.15*Math.min(1,s.burst/.4)),travel=speed*dt;s.speed=speed;s.distance+=travel;s.spawn-=dt;
 s.stride+=dt*speed*.7*(1-s.slidePose*.85)*(1-(s.kick>0?Math.sin(s.kick/.3*Math.PI/2):0)*.5);
 // From stage 2 the second goal of each stage is guarded by a back line first.
 if(runnerBossDue(s)&&s.nextGoal-s.distance<=100&&s.nextGoal-s.distance>60)spawnRunnerBoss(s);
 if(s.distance>=s.nextGoal){s.nextGoal+=180;const index=s.goalCount++,lane=[0,1,-1][Math.floor((s.nextGoal-270)/180)%3];s.readLane=lane;
  const keeper=s.level>=2,cross=keeper&&s.route==='wing',rush=keeper&&!cross&&(s.route==='middle'||s.level>=3&&index%2===1);
  s.objects.push({lane:0,z:-60,kind:'goal',passed:false,openLane:lane,...(keeper?{keeper:true,kx:0,kclock:index*.7,kout:0,rush,cross,danger:s.route==='middle'}:{})});
  for(let i=0;i<3;i++)s.objects.push({lane,z:-28-i*4,kind:'coin',passed:false,openLane:0});
  // Route fork just behind every second goal (stage 2+): choose the wing or the middle for the next attack.
  if(s.level>=2&&s.goalCount%2===0&&s.route==='main')s.objects.push({kind:'fork',lane:0,z:-76,passed:false,openLane:0});
  s.pattern=keeper?'Watch the keeper':'Find the golden opening';
  s.message=cross?'Wing play: a cross is coming! Jump, then shoot in the air.':rush?'Keeper rushing out! Chip it (Skill) or go round him.':keeper?'Watch the keeper sway. Shoot to the side he leaves.':`Goal ahead: ${lane<0?'left':lane>0?'right':'centre'} lane. Follow gold, then shoot!`;}
 if(s.spawn<=0)s.spawn=spawnRunnerPattern(s)/speed;
 for(const o of s.objects){o.z+=travel;if(o.netHit)o.netHit=Math.max(0,o.netHit-dt);if(o.kind==='goal'&&o.reaction)o.reaction=Math.max(0,o.reaction-dt);
  if(o.kind==='goal'&&o.keeper&&!o.passed)keeperStep(s,o,dt);
  if(o.kind==='defender'&&o.passed&&o.tackle)o.tackle+=dt;
  if(o.beaten)o.beaten=Math.min(2,o.beaten+dt);
  if(o.scored)o.goalBurst=Math.min(1.2,(o.goalBurst??0)+dt);
  if(o.kind==='defender'){o.returnKick=Math.max(0,(o.returnKick??0)-dt);o.returnCooldown=Math.max(0,(o.returnCooldown??0)-dt);}
  if(o.kind==='defender'&&!o.passed){const role=o.role??'jockey',old=o.x??o.lane*2.4,tell=role==='tackler'?.65:.5;
   // At maximum boosted speed the initial read still precedes contact by >1s.
   if(o.z> -32&&o.read===undefined){o.read=0;o.aim=Math.max(o.lane*2.4-.8,Math.min(o.lane*2.4+.8,s.x+s.vx*.15));}
   if(o.read!==undefined)o.read+=dt;
   // Closer: after a .3 s read it steps across into the lane it is closing.
   if(o.closeTo!==undefined&&(o.read??-1)>=.3){o.closeThreat=Math.abs(s.x-o.closeTo*2.4)<1.2;o.lane=o.closeTo;o.closeTo=undefined;o.closing=1;o.aim=o.lane*2.4;feedback(s,'close',old,o.z,'Gap closing! Cut into the space they left.');}
   if(o.closing)o.closing=Math.abs(old-o.lane*2.4)>.25?1:0;
   // Back line: the pair shifts across as one unit every 1.7 s and holds its shape once you are close.
   if(role==='line'&&o.z<-18){o.lineClock=(o.lineClock??0)+dt;const sh=(o.shift??1)*(Math.floor((o.lineClock??0)/1.7)%2===0?1:-1);o.lane=(o.slot??0)+(sh>0?0:-1);o.openLane=sh>0?-1:1;}
   const base=o.lane*2.4;
   // Presser: after a visible .25 s read it sprints out to close the space, then
   // pokes. It never leaves its lane band, so the marked escape stays open.
   if(role==='presser'&&o.read!==undefined){o.press=Math.min(1,Math.max(0,(o.read-.25)/.35))*(o.z<-10?1:Math.max(0,1-(o.z+10)/4));o.z+=RUNNER_PRESS_SPEED*o.press*dt;}
   const committed=(o.read??0)>tell&&o.z>-12;
   if(!committed)o.aim=Math.max(base-.8,Math.min(base+.8,s.x+s.vx*.12));
   if(committed&&o.z> -9&&!o.beaten)o.tackle=(o.tackle??0)+dt;
   const stride=role==='jockey'||role==='presser'?.72:role==='sweeper'?.8:role==='tackler'?.42:0;
   let target=(o.returnCooldown??0)>1.25?old:committed?o.aim!:base+Math.max(-.8,Math.min(.8,Math.sin(s.time*(role==='jockey'?3.6:role==='sweeper'?2.7:role==='presser'?3:2.2)+o.lane*2)*stride+(o.aim===undefined?0:(o.aim-base)*.18*(stride?1:0))));
   // Wall and back line stand square: no lunge. Pair squeezes the middle over one second.
   if(role==='wall'||role==='line'){target=base;o.aim=base;}
   if(role==='pair'){const sq=Math.min(1,Math.max(0,(o.read??0)/1));target=base-Math.sign(base||1)*1.7*sq;o.aim=target;}
   if(o.beaten)target=old+Math.sign(old-s.x||1)*.6;
   const rate=o.closing?7:role==='line'?6:committed?(role==='sweeper'?9:5):3;
   o.x=old+(target-old)*(1-Math.exp(-dt*rate));o.vx=dt?(o.x-old)/dt:0;o.reaction=committed?Math.min(1,((o.read??0)-tell)/.25):Math.min(1,(o.read??0)/tell);
   // Danger memory for the near-miss reward: the runner stood in this tackle's
   // path late in the approach and still got away clean.
   if(o.read!==undefined&&o.z>-14&&Math.abs(s.x-(o.x??base))<runnerDefenderReach(o).x+.2)o.threat=1;
  }
  if(o.knock)o.knock=Math.max(0,o.knock-dt);}
 // Sweep shots against moving targets, selecting the first object on their path.
 for(const shot of s.shots){if(!shot.active)continue;
  if(shot.returner){const defender=shot.returner;if(defender.passed||defender.knock){shot.active=false;shot.returner=undefined;continue;}shot.x=(defender.x??defender.lane*2.4)+.2;shot.z=defender.z+.6;shot.windup=Math.max(0,(shot.windup??0)-dt);
   if(shot.windup===0){shot.returner=undefined;shot.returning=true;shot.age=0;shot.vx=((shot.aimX??0)-shot.x)/Math.max(.4,-shot.z/22);defender.returnKick=.46;feedback(s,'return',shot.x,shot.z,'RETURN BALL! Jump or change lanes.');}continue;}
  if(shot.returning){const oldZ=shot.z,oldX=shot.x;shot.z+=22*dt;shot.x+=(shot.vx??0)*dt;shot.age+=dt;
   if(oldZ<0&&shot.z>=0){const t=-oldZ/(shot.z-oldZ),crossX=oldX+(shot.x-oldX)*t;shot.active=false;
    if(Math.abs(crossX-(previousX+(s.x-previousX)*t))<.62&&Math.max(0,previousY+previousVy*dt*t-21*dt*dt*t*t)<.8&&s.hurt===0&&(RUNNER_TUNING.powerShield||s.boost===0)){if(s.shield)absorb(s,undefined,crossX,0);else loseChance(s,'Return caught you! Jump or cut away after shooting.');}
    else if(s.hurt===0){s.score+=40;cleanPlay(s);feedback(s,'skill',crossX,0,'Return avoided! +40 · attack the space.');}}
   if(shot.age>3||shot.z>3)shot.active=false;continue;}
  const previous=shot.z;shot.z-=(shot.chip?28:40+(shot.blast??0)*14)*dt;shot.age+=dt;
  // A chip floats: high over the first defenders, dropping into the goal.
  if(shot.chip){const arc=Math.sin(Math.min(1,shot.age/1.1)*Math.PI)*2.6;shot.height=.28+arc/Math.max(.05,1-Math.min(1,shot.age/1.8));}
  // Resolve every permitted penetration within this sweep, not one target per frame.
  for(let contacts=0;contacts<3&&shot.active&&!shot.returner;contacts++){let target:RunnerObject|undefined;
  for(const o of s.objects){if(o.passed||o.kind==='coin'||o.kind==='mud'||o.kind==='mate'||o.kind==='fork'||o.z>previous+travel+.5||o.z<shot.z-.5)continue;if(shot.chip&&o.kind!=='goal')continue;const hitTime=Math.max(0,Math.min(1,(previous-o.z+travel)/Math.max(.00001,previous-shot.z+travel)));const targetX=(o.x??o.lane*2.4)-(o.vx??0)*dt*(1-hitTime);if(o.kind!=='goal'&&Math.abs(shot.x-targetX)>.85)continue;if(!target||o.z>target.z)target=o;}
  if(!target)break;
  if(target.kind==='defender'&&!shot.power&&!shot.volley&&target.z< -12&&target.z> -38&&(target.returnCooldown??0)<=0&&(target.tackle??0)===0&&!target.beaten){
   // A planted, centred boot can return a normal shot. Edge contacts and blasts beat it.
   if(Math.abs(shot.x-(target.x??target.lane*2.4))<.55){shot.returner=target;shot.windup=.3;shot.aimX=s.x;shot.x=(target.x??target.lane*2.4)+.2;shot.z=target.z+.6;target.returnCooldown=2;target.returnAim=Math.atan2((shot.aimX??0)-shot.x,-shot.z);feedback(s,'block',shot.x,shot.z,'BLOCKED · defender winding up! Jump or cut away.');continue;}}
  if(target){shot.active=false;if(target.kind==='goal')shotAtGoal(s,shot,target);
   else{target.passed=true;target.knock=.65;if((shot.penetrations??0)>0){shot.penetrations=Math.max(0,(shot.penetrations??0)-1);shot.active=true;}const reward=100*runnerMultiplier(s);s.score+=reward;cleanPlay(s);feedback(s,'clear',shot.x,target.z,`Lane cleared! +${reward} · attack the space.`);}
  }
  }
  if(shot.age>1.8||shot.z< -72)shot.active=false;
 }
 for(const o of s.objects){
  if(o.passed)continue;
  if(o.kind==='mate'||o.kind==='fork'){if(o.z>=0){o.passed=true;if(o.kind==='fork'){s.route=s.lane<0?'wing':'middle';if(s.route==='wing')s.wingRuns++;else s.middleRuns++;feedback(s,'route',s.x,0,s.route==='wing'?'WING ROUTE: fewer defenders. Finish with a cross!':'THROUGH THE MIDDLE: busy, but goals count double!');}}continue;}
  if(o.kind==='mud'){const len=o.length??2.6,inLane=Math.abs(s.x-o.lane*2.4)<1;
   if(o.z>=0&&o.z-len<=0&&inLane){if(s.y<.25){o.passed=true;s.mud=.9;const lost=s.balls>0;if(lost)s.balls--;feedback(s,'mud',s.x,0,lost?'Puddle! The ball stuck. Jump puddles to lift it over.':'Puddle! Wet pitches slow you down.');}else o.over=true;}
   if(o.z-len>0){o.passed=true;if(o.over){s.puddleJumps++;s.score+=20;cleanPlay(s);feedback(s,'skill',s.x,0,'Lifted it over the puddle! +20');}}
   continue;}
  const defender=o.kind==='defender',reach=defender?runnerDefenderReach(o):null;
  // Keeper rushing out: running into him loses the ball; rounding him walks it in.
  if(o.kind==='goal'&&o.keeper&&(o.kout??0)>.5&&!o.scored){const keeperZ=o.z+(o.kout??0)*7;
   if(keeperZ-travel<=.6&&keeperZ>=-.6){o.kout=0;o.rush=false;
    if(Math.abs(s.x-(o.kx??0))>1.2&&s.balls>0){s.rounded++;scoreGoal(s,o,s.x,false,true,'ROUNDED THE KEEPER');}
    else{if(s.balls>0)s.balls--;o.passed=true;s.streak=0;feedback(s,'save',s.x,o.z,'Keeper smothered it! Go round him early, or chip it.');}
    continue;}}
  const contact=reach?o.z-travel<=reach.z&&o.z>=-reach.z:crossesPickup(-(o.z-travel),-o.z);
  if(!contact)continue;
  const crossing=Math.max(0,Math.min(1,(travel-o.z)/Math.max(.00001,travel))),contactX=previousX+(s.x-previousX)*crossing,defenderX=(o.x??o.lane*2.4)-(o.vx??0)*dt*(1-crossing),contactY=Math.max(0,previousY+previousVy*dt*crossing-21*dt*dt*crossing*crossing);
  const same=Math.abs(contactX-defenderX)<(reach?.x??.85),slip=defender&&s.slide>0&&(o.role??'jockey')!=='tackler',evaded=contactY>=.9||slip,invincible=!RUNNER_TUNING.powerShield&&s.boost>0;
  if(!defender)o.passed=true;
  if(o.kind==='goal'){s.streak=0;s.combo=0;s.message=o.keeper?'Shoot before reaching the keeper. Look up early!':'Shoot before reaching the goal. Look up early!';}
  else if(same&&o.kind==='coin'){s.score+=25*runnerMultiplier(s);cleanPlay(s);if(!o.link)s.energy++;s.balls=Math.min(5,s.balls+1);s.collected++;feedback(s,'collect',s.x,o.z,o.bonus?'Brave! Bonus ball through the middle.':s.balls===5?'Five balls ready. Shoot to create space!':`Ball collected · ${s.balls}/5 ready to shoot`);
   if(s.energy>=RUNNER_TUNING.powerTouches){s.energy=0;s.boost=RUNNER_TUNING.powerSeconds;s.shield=RUNNER_TUNING.powerShield;s.message=RUNNER_TUNING.powerShield?'Clean touches! Burst of pace: you can ride one tackle.':'Five clean touches. Break away! Shoot for a power goal.';}}
  else if(defender&&o.beaten){/* Wrong-footed by a skill move or one-two: no tackle. */}
  else if(same&&o.kind!=='coin'&&s.hurt===0&&!invincible&&!evaded){if(s.shield)absorb(s,o,s.x,o.z);else{o.passed=true;
   // One back-line catch is enough: the rest of the line drops off so a boss never costs two chances.
   if(o.boss)for(const b of s.objects)if(b.boss&&!b.passed)b.beaten=1;
   loseChance(s,o.role==='tackler'?'Low tackle! Jump, drag it back, or change lanes.':o.role==='presser'?'Pressed! Cut away early when they sprint out.':o.role==='line'?'Caught by the back line! Go to the side they leave open.':o.role==='pair'?'Squeezed! Go round the pair, or split them early.':o.closing!==undefined?'The gap closed! Watch for a defender stepping across.':'Tackled! Shoot, skill or cut into the open lane.');}}
  else if(same&&o.kind!=='coin'&&evaded&&!invincible){o.passed=true;const reward=40*runnerMultiplier(s);s.score+=reward;cleanPlay(s);if(contactY>=.9&&o.role==='tackler')s.hurdles++;feedback(s,'skill',s.x,0,`${slip?'Slipped the defender':'Clean hurdle'}! +${reward}`);}
  else if(same&&o.kind!=='coin'&&invincible){o.passed=true;o.knock=.65;s.score+=50;feedback(s,'clear',s.x,o.z,'Power run! +50');}
  if(defender&&!o.passed&&o.z>(reach?.z??.9)){o.passed=true;
   if(o.closeThreat&&!o.beaten&&s.hurt===0&&s.lives>0)s.closersBeaten++;
   if(o.threat&&!o.beaten&&s.hurt===0&&!invincible&&s.lives>0){s.nearMisses++;s.nearStreak++;const reward=25*runnerMultiplier(s);s.score+=reward;cleanPlay(s);
    feedback(s,'skill',s.x,0,s.nearStreak>1?`${s.nearStreak} tackles beaten! +${reward} · great scanning`:`Beat the tackle! +${reward}`);}}
 }
 // Boss resolution: both back lines passed without losing a chance.
 if(s.boss&&!s.objects.some(o=>o.boss&&!o.passed)){if(s.boss>0){s.bosses++;const reward=300*runnerMultiplier(s);s.score+=reward;cleanPlay(s);feedback(s,'boss',s.x,0,`BACK LINE BEATEN! +${reward} · now pick your finish.`);}s.boss=0;}
 // A route lasts until the goal it leads to has been played.
 for(let i=s.objects.length-1;i>=0;i--){const o=s.objects[i];
  if(o.kind==='goal'&&o.passed&&o.z>9&&s.route!=='main')s.route='main';
  if(o.z>9||o.kind==='coin'&&o.passed)s.objects.splice(i,1);}
}
