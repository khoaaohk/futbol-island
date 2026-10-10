/** Compact arcade football: fixed-step ball contact and acceleration, no island simulation. */
export const STRIKER_HALF_X=25,STRIKER_HALF_Z=14,STRIKER_SECONDS=180;
export const STRIKER_ROUNDS=['Find Space','Beat the Press','Break the Block','Neon Final'] as const;
/** Each round counts one real football habit. Praised live, recapped at full time. */
export const STRIKER_FOCUS=['Pass to a free teammate','Beat the press with a one-two','Switch play across the pitch','Pass early, before pressure arrives'] as const;
export const STRIKER_FOCUS_GOAL=3;
/** Third star per round: one football challenge that matches the round's idea. */
export const STRIKER_CHALLENGES=['Win with a clean sheet','Score a first-time goal','Score after switching play','Win by two goals'] as const;
/** Seconds a habit keeps "counting" toward a goal (switch then score, one-two then score). */
export const STRIKER_HABIT_GOAL_WINDOW=7;
/** One-touch window: the last part of a pass's travel where a buffered Pass or Shoot is "perfect". */
export const STRIKER_TOUCH_WINDOW=.22;
/** Seconds of the goal celebration, including the opening hit-stop. Must stay under 2 s (restart test). */
export const STRIKER_GOAL_PAUSE=1.85,STRIKER_HIT_STOP=.11,STRIKER_DIVE=.75;
export type StrikerInput={x:number;z:number;pass:boolean;shoot:boolean;power:number;switchPlayer:boolean;sprint:boolean;charge:boolean;through:boolean;
 /** Skill move with the ball (E / context button). Sprint held while shooting = chip; while playing Through = lofted through ball. */
 skill:boolean;
 /** Call a teammate's run (R / hold Through): in behind, overlap, or check to the ball, chosen by the picture. */
 call:boolean};
export const strikerInput=():StrikerInput=>({x:0,z:0,pass:false,shoot:false,power:0,switchPlayer:false,sprint:false,charge:false,through:false,skill:false,call:false});
/** Skill moves, chosen by the stick relative to the carrier's facing. Sim seconds; the rig move plays over the same time. */
export type StrikerSkill='dragBack'|'stepover'|'roulette';
export const STRIKER_SKILLS:Record<StrikerSkill,{seconds:number;evade:number;label:string;lesson:string}>={
 dragBack:{seconds:.55,evade:.75,label:'Drag-back',lesson:'Drag-back: pull it away from the tackle, then turn.'},
 stepover:{seconds:.6,evade:.8,label:'Step-over',lesson:'Step-over: fake one way, go the other.'},
 roulette:{seconds:.62,evade:.85,label:'Roulette',lesson:'Roulette: spin with your body between ball and defender.'}};
/** Match modifiers (Island Cup). Each changes one thing and teaches one idea. */
export type StrikerMods={rain:boolean;small:boolean;golden:boolean;spirit:boolean};
export const STRIKER_MOD_LESSONS={rain:'Rain: the ball skids. Pass firm and short, cushion your first touch.',small:'Small goals: work it closer and pick a corner.',golden:'Knockout: a draw goes to golden goal, then penalties.',spirit:'Cup final: team spirit fills twice as fast. Pass, pass, Team Strike!'} as const;
export const STRIKER_GOAL_HALF=4.6,STRIKER_SMALL_GOAL_HALF=3.1,STRIKER_EXTRA_TIME=45,STRIKER_SHOOTOUT_KICKS=3;
/** Team shapes for Gold's AI teammates, picked before kickoff. Each teaches one idea. */
export type StrikerShape='balanced'|'wide'|'solid';
export const STRIKER_SHAPES:Record<StrikerShape,{label:string;lesson:string}>={
 balanced:{label:'Diamond 1-1-1',lesson:'A diamond gives you a pass forward, sideways and back.'},
 wide:{label:'Wide 1-2',lesson:'Width stretches the defence and opens the middle.'},
 solid:{label:'Solid 2-1',lesson:'Two at the back stops counter-attacks.'}};
export type StrikerRun='behind'|'overlap'|'check';
/** Why Blue scored, in one coaching line a 7-12 year old can act on next time (shown on the concede banner). */
export type StrikerConcede='intercept'|'tackle'|'teamStrike'|'setPiece'|'shot';
export const STRIKER_CONCEDE_LINES:Record<StrikerConcede,string>={
 intercept:'Your pass was cut out. Pick a cyan ring with a clear lane.',
 tackle:'You were tackled. Pass before the defender arrives.',
 teamStrike:'Blue Team Strike. Close the shooter down sooner.',
 setPiece:'From a set piece. Mark your player and stay goal-side.',
 shot:'Blue got a shot away. Stay goal-side and close them down.'};
/** Seconds a lost ball still "explains" a Blue goal (turnover, then a quick attack). */
export const STRIKER_CONCEDE_WINDOW=8;
export const STRIKER_RUNS:Record<StrikerRun,string>={behind:'Run in behind! Play it into space ahead of them.',overlap:'Overlap! Your teammate runs round the outside.',check:'Check to the ball! They come short to get free.'};
/** Team spirit: earned by good football (passes, habits, perfect touches, beaten tackles). Full = one Team Strike. */
export const STRIKER_SPIRIT={pass:.035,habit:.12,perfect:.08,beat:.08,steal:.1,intercept:.05,run:.08,bluePass:.06,blueIntercept:.12,blueTackle:.08,blueScale:[.3,.5,.7,.85]};
/** Blue Team Strike charge-ups allowed per match, by round (Oct 9 2026). Bot sims showed 4.6-5.4 per match in rounds 3-4,
 * which turned the special into background noise; one (R1-2) or two (R3-4) keeps it a big moment the player must answer. */
export const STRIKER_BLUE_STRIKES=[1,1,2,2];
/** Clean strike: releasing Shoot inside this band of the charge is a controlled, low, accurate finish (keeper reads it
 * a beat later). Teaches placement over power: the meter's sweet spot sits below the overhit zone. */
export const STRIKER_CLEAN:[number,number]=[.6,.86];
/** A Gold teammate is "open" for the scan markers when its lane is clear and no defender is within this distance. */
export const STRIKER_MARKED=2.6;
/** Set pieces. Penalty box: |x| > 17 and |z| < 5 (the drawn lines). Wall stands 4.6 m from the ball (scaled 9.15 m). */
export type StrikerSetPieceKind=''|'free'|'penalty'|'corner';
export const STRIKER_BOX_X=17,STRIKER_BOX_Z=5,STRIKER_WALL_GAP=4.6,STRIKER_PENALTY_X=20.2;
export const STRIKER_SET_PIECE_LESSONS:Record<Exclude<StrikerSetPieceKind,''>,string>={
 free:'Free kick: curl it around the wall (hold up/down after striking) or chip over it.',
 penalty:'Penalty: pick a corner and commit. Low and hard beats the keeper.',
 corner:'Corner: aim near or far post, then attack the cross with a header.'};
/** Blue carriers take a heavy touch on a rhythm; tackling while the ball is off their foot is a clean steal. */
export const STRIKER_HEAVY_TOUCH=.32,STRIKER_SKILL_REST=.8;
export type StrikerPlayer={id:number;team:0|1;keeper:boolean;x:number;z:number;vx:number;vz:number;yaw:number;stamina:number;receive:number;receiveX:number;receiveZ:number;kick:number;stun:number;tackle:number;cooldown:number;think:number;run:number;windup:number;keeperAim:number;tackleX:number;tackleZ:number;jockey:number;strikeYaw:number;strikeKind:'pass'|'shot'|'save';strikePower:number;saveSide:-1|1;saveHeight:number;saveWide:boolean;
 /** Keeper only: dive time left (s), reaction delay before reading a shot (s), and whether the ball was held. */
 dive:number;react:number;caught:boolean;
 /** Skill move in progress (s left), its kind/side, recent count (three in a row tires the legs). */
 skill:number;skillKind:StrikerSkill;skillSide:-1|1;skillCount:number;skillAt:number;skillYaw:number;
 /** Blue carrier rhythm: heavy-touch time left and time to the next one. Receive height for chest/thigh/header poses. */
 heavy:number;touchCycle:number;receiveHeight:number;header:number;
 /** Free-kick wall: seconds the player stays in the wall (jumps to block, up to 1.7 m). */
 wall:number;
 /** Called run (s left), its kind; Blue's Team Strike charge-up (s left, telegraphed). */
 callRun:number;callKind:StrikerRun;strikeCharge:number};
/** Round tuning, index = level-1. One new football idea per round at full strength
 * (R2 receiver press + interceptions, R3 cover + compact block, R4 both); the generic
 * knobs only creep up a small, even step so their effects cannot stack into a spike.
 * Sim lock: tests/striker-curve.cjs. */
export const STRIKER_TUNING={
 speed:[6.6,6.75,6.9,7.05],tackleWindup:[.36,.35,.34,.33],tackleThink:[1.65,1.6,1.54,1.48],carrierThink:[.95,.9,.85,.8],
 keeperReact:[.21,.2,.19,.18],keeperDive:[7.2,7.6,7.9,8.2],interceptSkill:[0,.62,.67,.72],interceptRead:[1,.28,.25,.22],
 receiverPress:[false,true,false,true],cover:[false,false,true,true],block:[false,false,true,true]};
/** Eased retry after a loss or draw, one notch only and said out loud on the ready card. */
export const STRIKER_ASSIST={speed:-.25,tackleWindup:.05,tackleThink:.25,keeperReact:.03,keeperDive:-.7,interceptSkill:.85};
export function createStrikerMatch(){
 const players:StrikerPlayer[]=Array.from({length:8},(_,id)=>({id,team:(id<4?0:1) as 0|1,keeper:id%4===3,x:0,z:0,vx:0,vz:0,yaw:id<4?Math.PI/2:-Math.PI/2,stamina:1,receive:0,receiveX:0,receiveZ:0,kick:0,stun:0,tackle:0,cooldown:0,think:.6+id*.13,run:0,windup:0,keeperAim:0,tackleX:0,tackleZ:0,jockey:0,strikeYaw:0,strikeKind:'pass',strikePower:.35,saveSide:1,saveHeight:0,saveWide:false,dive:0,react:0,caught:false,skill:0,skillKind:'stepover',skillSide:1,skillCount:0,skillAt:-9,skillYaw:0,heavy:0,touchCycle:1,receiveHeight:0,header:0,wall:0,callRun:0,callKind:'behind',strikeCharge:0}));
 const state={level:1,players,ball:{x:-7,z:0,y:.25,vx:0,vz:0,vy:0,owner:0,lastTeam:0,lock:0,spin:0},selected:0,score:[0,0],time:0,goalPause:0,charge:0,finished:false,message:'Attack right. Pass into space, then finish!',event:0,eventKind:'kickoff',eventX:0,eventZ:0,queuedPass:0,queuedThrough:false,queuedX:0,queuedZ:0,passTarget:-1,aim:0,timeScale:1,shotMoment:0,passes:[0,0],shots:[0,0],passChain:0,lastPasser:-1,
  /** Goal moment: frozen frames, who scored (-1 own goal), crowd energy 0..1.6 for sound and stands. */
  hitStop:0,scorer:-1,crowd:0,lastKicker:-1,
  /** Coach eased this round after a loss or draw (transparent, one notch, cleared on a win). */
  assist:false,assistLevel:0,
  /** First-time play: window 0..1 as an incoming pass nears the selected player; buffered first-time shot. */
  touchWindow:0,touchEta:-1,queuedShot:0,queuedShotPower:.7,queuedPerfect:false,perfect:0,firstTimeShot:false,
  /** Star tracking: when the last habit happened, goals that came from a habit, first-time goals. */
  habitAt:-99,habitGoals:0,firstTimeGoals:0,
  /** Moves: counters the HUD/scene watch, the last move's name, aftertouch curl time left, chip flag. */
  skillEvent:0,beatEvent:0,perfectTackle:0,
  /** Set piece in progress: kind, awarded team, spot, AI take timer, Gold keeper's penalty guess. The clock keeps running (a stalled kick is taken for you after 6 s). */
  setPiece:{kind:'' as StrikerSetPieceKind,team:0 as 0|1,x:0,z:0,wait:0,taker:-1,aimSide:0,guess:0},fouls:[0,0],setPieceGoals:0,setPieceShot:false,
  /** Gold's shape, team spirit per side (0..1), Team Strike events, called-run counters. */
  shape:'balanced' as StrikerShape,
  /** Oct 9 2026 playtest pass: the player's own passes (played / reached a teammate) for an honest full-time stat, the
   * ball currently travelling from one of them, and why Blue's last goal happened (for the "why" banner). */
  userPasses:0,userPassesDone:0,userPassLive:false,lostKind:'' as ''|'intercept'|'tackle',lostAt:-99,bluePieceAt:-99,concedeCause:'shot' as StrikerConcede,
  /** Match length, goal half-width, modifiers, golden-goal extra time and the penalty shootout. */
  baseDuration:STRIKER_SECONDS,duration:STRIKER_SECONDS,goalHalf:STRIKER_GOAL_HALF,mods:{rain:false,small:false,golden:false,spirit:false} as StrikerMods,extra:false,goldenWin:false,
  shootout:{active:false,turn:0 as 0|1,kicks:[0,0],goals:[0,0],wait:-1,winner:-1},spirit:[0,0],spiritEvent:0,spiritTeam:0,special:0,specialTeam:0,teamStrike:false,calls:0,runPasses:0,lastSkill:'' as string,curlTime:0,curled:false,chip:false,
  /** Teaching focus for this round, plus a counter the HUD watches for praise. */
  focus:0,focusEvent:0,firstTime:false,quickPass:false,holdTime:0,passFromZ:0,
  /** Pass preview risk 0..1 (a defender sits in the lane) and the defender reading a travelling pass. */
  passRisk:0,passAge:0,nearMiss:0,interceptor:-1,interceptX:0,interceptZ:0,overhit:false,
  /** Defending roles, for telegraphs: presser and cover of the blue team. */
  presser:-1,cover:-1,
  /** Scanning (Oct 9 2026): how open each Gold teammate is right now (0 blocked .. 1 open), passes played into open vs
   * blocked lanes, Blue Team Strikes used, clean strikes, and what built the last Gold goal (for the replay caption). */
  laneOpen:[0,0,0,0,0,0,0,0],safePasses:0,riskyPasses:0,blueStrikes:0,cleanStrike:false,cleanStrikes:0,
  goalStory:{chain:0,habit:false,firstTime:false,teamStrike:false,chip:false,curled:false,setPiece:false,clean:false,at:-1}};
 const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
 const b0=()=>state.ball;
 const T=STRIKER_TUNING,A=STRIKER_ASSIST,lv=()=>clamp(state.level,1,4)-1,eased=()=>state.assist&&state.assistLevel===state.level;
 const tune={speed:()=>T.speed[lv()]+(eased()?A.speed:0),windup:()=>T.tackleWindup[lv()]+(eased()?A.tackleWindup:0),think:()=>T.tackleThink[lv()]+(eased()?A.tackleThink:0),
  react:()=>T.keeperReact[lv()]+(eased()?A.keeperReact:0),dive:()=>T.keeperDive[lv()]+(eased()?A.keeperDive:0),skill:()=>T.interceptSkill[lv()]*(eased()?A.interceptSkill:1)};
 const emit=(kind:string,x:number,z:number,message:string)=>{state.event++;state.eventKind=kind;state.eventX=x;state.eventZ=z;state.message=message;};
 function addSpirit(team:0|1,amount:number){const before=state.spirit[team],gain=(team===1?amount*T2.blueScale[lv()]:amount)*(state.mods.spirit?2:1);state.spirit[team]=Math.min(1,before+gain);
  if(before<1&&state.spirit[team]>=1){state.spiritEvent++;state.spiritTeam=team;}}
 const T2=STRIKER_SPIRIT;
 // Call a run: the picture decides the run. A teammate behind the ball overlaps, a tightly marked one checks short,
 // otherwise the most advanced free teammate runs in behind the last defender.
 function callRun(p:StrikerPlayer){const forward=p.team===0?1:-1;let pick:StrikerPlayer|null=null,kind:StrikerRun='behind',score=-Infinity;
  for(const q of players){if(q.team!==p.team||q.keeper||q===p||q.stun>0)continue;const behind=(q.x-p.x)*forward<-1,marked=players.some(d=>d.team!==p.team&&!d.keeper&&Math.hypot(d.x-q.x,d.z-q.z)<2.2);
   const k:StrikerRun=behind?'overlap':marked?'check':'behind',value=(k==='behind'?3:k==='overlap'?2:1)+(q.x-p.x)*forward*.05;if(value>score){score=value;pick=q;kind=k;}}
  if(!pick)return;pick.callRun=2.4;pick.callKind=kind;pick.run=0;state.calls++;emit('call',pick.x,pick.z,STRIKER_RUNS[kind]);}
 function kickoff(team=0){for(const p of players){const side=p.team===0?-1:1,i=p.id%4;p.x=side*(p.keeper?22:i===0?7:12);p.z=i===1?-8:i===2?8:0;if(p.team===0&&!p.keeper){if(state.shape==='wide'&&i>0)p.z*=1.35;if(state.shape==='solid'&&i===2){p.x=-15;p.z=3;}}p.receive=p.receiveX=p.receiveZ=0;p.vx=p.vz=p.stun=p.tackle=p.kick=p.cooldown=p.run=p.windup=p.keeperAim=p.tackleX=p.tackleZ=p.jockey=p.dive=p.react=0;p.caught=false;p.skill=p.heavy=p.header=p.receiveHeight=p.wall=p.callRun=p.strikeCharge=0;p.skillCount=0;p.touchCycle=.9+p.id%3*.17;p.yaw=-side*Math.PI/2;p.strikeYaw=p.yaw;p.strikeKind='pass';p.strikePower=.35;p.saveSide=1;p.saveHeight=0;p.saveWide=false;p.stamina=1;p.think=.8+p.id*.1;}const owner=team===0?0:4;Object.assign(state.ball,{owner,x:players[owner].x,z:0,y:.25,vx:0,vz:0,vy:0,lock:.2,lastTeam:team});state.selected=0;state.charge=0;state.queuedPass=0;state.timeScale=1;state.shotMoment=0;state.passTarget=-1;state.lastPasser=-1;state.passChain=0;state.hitStop=0;state.scorer=-1;state.lastKicker=-1;state.firstTime=state.quickPass=state.overhit=false;state.holdTime=0;state.interceptor=-1;state.passRisk=0;state.presser=state.cover=-1;state.queuedShot=0;state.queuedPerfect=false;state.touchWindow=0;state.touchEta=-1;state.curlTime=0;state.chip=false;state.firstTimeShot=false;state.setPiece.kind='';state.setPieceShot=false;}
 function reset(advance=false){if(advance&&state.finished){const won=state.score[0]>state.score[1];if(won){state.level=Math.min(4,state.level+1);state.assist=false;}else{state.assist=true;state.assistLevel=state.level;}}if(state.assistLevel!==state.level)state.assist=false;state.score[0]=state.score[1]=0;state.time=0;state.finished=false;state.goalPause=0;state.message='Pass, move, receive. Pull the defence apart.';state.passes[0]=state.passes[1]=state.shots[0]=state.shots[1]=0;state.aim=0;state.focus=0;state.crowd=0;state.habitAt=-99;state.habitGoals=state.firstTimeGoals=state.perfect=state.setPieceGoals=0;state.fouls[0]=state.fouls[1]=0;state.spirit[0]=state.spirit[1]=0;state.calls=state.runPasses=0;state.safePasses=state.riskyPasses=state.blueStrikes=state.cleanStrikes=0;state.userPasses=state.userPassesDone=0;state.userPassLive=false;state.lostKind='';state.lostAt=state.bluePieceAt=-99;state.concedeCause='shot';state.cleanStrike=false;state.goalStory.at=-1;state.extra=state.goldenWin=false;state.duration=state.baseDuration;const so=state.shootout;so.active=false;so.turn=0;so.kicks[0]=so.kicks[1]=so.goals[0]=so.goals[1]=0;so.wait=-1;so.winner=-1;kickoff();}
 function release(p:StrikerPlayer,dx:number,dz:number,speed:number,lift:number,kind:string){const b=state.ball,n=Math.hypot(dx,dz)||1;state.userPassLive=false;if(kind==='save')state.lastPasser=-1;if(kind==='pass')state.passAge=0;state.interceptor=-1;state.lastKicker=p.id;p.yaw=Math.atan2(dx,dz);p.strikeYaw=p.yaw;p.strikeKind=kind==='save'?'save':kind==='shot'?'shot':'pass';p.strikePower=clamp((speed-19)/23,.15,1);p.kick=1;p.receive=0;b.owner=-1;b.x=p.x+dx/n*.9;b.z=p.z+dz/n*.9;b.y=.3;b.vx=dx/n*speed;b.vz=dz/n*speed;b.vy=lift;b.lock=.18;b.lastTeam=p.team;emit(kind,b.x,b.z,kind==='shot'?'Follow your shot for the rebound!':'Move after the pass. Make another angle.');}
 // Over-hitting (the last few % of the charge) adds lift: from range it can sail over.
 // Teaches placement over power without making a full charge useless up close.
 // Chip: aimed over the keeper. The apex sits above the keeper when they have rushed out; from the line it must
 // still dip under the bar, so a chip only beats a keeper who has come off their line (the real lesson).
 function chip(p:StrikerPlayer,power:number,aim:number){const side=p.team===0?1:-1,k=players[p.team===0?7:3],targetZ=clamp(aim*4,-4,4),d=Math.max(3,Math.abs(side*25-p.x)),dk=clamp(Math.abs(k.x-p.x),1.5,d);
  let v:number,vy:number;if(dk>d*.55){v=clamp(Math.sqrt(6*d*(2*dk-d)/1.9),11,20);vy=12*dk/v;}else{vy=7.6+power*.8;v=clamp(Math.max(dk/(vy/12),d/1.1),9,20);}
  state.shots[p.team]++;state.lastPasser=-1;state.chip=p.team===0;if(p.team===0)state.firstTimeShot=false;state.curlTime=0;
  release(p,side*27-p.x,targetZ-p.z,v,vy,'shot');k.react=p.team===0?tune.react():.11;p.strikePower=.45;if(p.team===0)state.message='Chip! Over the keeper when they rush out.';}
 // Team Strike: the special shot, earned only by good team play (full spirit). Fast and low, the keeper reads it late
 // and reaches less, but it is still one goal and still has to be aimed away from the keeper.
 function teamStrike(p:StrikerPlayer,aim:number){shoot(p,1,aim);const b=state.ball,n=Math.hypot(b.vx,b.vz)||1;b.vx=b.vx/n*44;b.vz=b.vz/n*44;b.vy=2.2;state.overhit=false;
  const k=players[p.team===0?7:3];k.react+=.18;state.spirit[p.team]=0;state.special++;state.specialTeam=p.team;state.teamStrike=true;
  state.message=p.team===0?'TEAM STRIKE! Built from your passes and habits.':'Blue Team Strike! Pressure the shooter sooner next time.';}
 function shoot(p:StrikerPlayer,power:number,aim:number,firstTime=false,manual=false){state.teamStrike=false;state.cleanStrike=false;const penalty=state.setPiece.kind==='penalty';if(p.team===0){if(!state.setPiece.kind)state.setPieceShot=false;state.firstTimeShot=firstTime;state.chip=false;state.curled=false;state.curlTime=p.id===state.selected?.32:0;}if(p.team===0&&power>=.75)state.shotMoment=.18;state.shots[p.team]++;state.lastPasser=-1;const side=p.team===0?1:-1,G=state.goalHalf-.1,targetZ=clamp(aim*G,-G,G),overhit=power>.93;state.overhit=overhit&&p.team===0;
  release(p,side*27-p.x,targetZ-p.z,(24+power*18)*(penalty?.68:1),2+power*3.2+(overhit?(power-.93)/.07*3.4:0),'shot');
  // The opposing keeper reads the strike after a short, round-scaled reaction.
  const keeper=players[p.team===0?7:3];keeper.react=p.team===0?tune.react()+(firstTime?.06:0):.11;
  // Penalty: Blue's keeper must guess as the ball is struck (left, middle or right on a fixed, fair rotation).
  // Spot kicks travel at a kid's pace: a right guess reaches a placed shot, only a hard one in the corner beats it.
  if(penalty&&p.team===0){const guess=[-1,0,1,1,-1,0][(state.fouls[1]+state.shots[0])%6];keeper.react=0;if(guess){keeper.dive=STRIKER_DIVE;keeper.vz=guess*12;keeper.vx=-.6;keeper.saveSide=guess*-1>0?1:-1;keeper.saveWide=true;keeper.saveHeight=.6;}}
  if(overhit)state.message='Huge power! Too much can fly over the bar.';
  // Clean strike: a controlled release in the sweet spot stays low and the keeper reads it a beat later.
  else if(manual&&p.team===0&&!penalty&&power>=STRIKER_CLEAN[0]&&power<=STRIKER_CLEAN[1]){const b=state.ball;b.vy*=.8;keeper.react+=.05;state.cleanStrike=true;state.cleanStrikes++;state.message='Clean strike! Controlled power keeps it low and on target.';}}
 // Score passing lanes, not just the nearest teammate. The same choice drives
 // the receiver marker and actual pass, so the preview tells the truth.
 let laneCover=0;
 function receiver(p:StrikerPlayer,ix:number,iz:number){let target:StrikerPlayer|undefined,best=-Infinity;const n=Math.hypot(ix,iz),forward=p.team===0?1:-1;laneCover=0;
  for(const q of players){if(q.team!==p.team||q===p||q.keeper||q.stun>0)continue;const dx=q.x-p.x,dz=q.z-p.z,d=Math.hypot(dx,dz)||1,alignment=n>.1?(dx*ix+dz*iz)/(d*n):dx*forward/d;let cover=0;
   for(const enemy of players){if(enemy.team===p.team)continue;const t=clamp(((enemy.x-p.x)*dx+(enemy.z-p.z)*dz)/(d*d),0,1);if(t>.08&&t<.94){const gap=Math.hypot(enemy.x-p.x-dx*t,enemy.z-p.z-dz*t);cover+=Math.max(0,2.1-gap)*3;}}
   const rank=alignment*(n>.1?10:3)-d*.08-cover*1.8+(q.callRun>0?6:0);if(rank>best){best=rank;target=q;laneCover=cover;}}
  return target;
 }
 /** Defenders standing in the lane from (ax,az) to (bx,bz): same measure as the pass preview (0 = clear). */
 function laneBlock(team:0|1,ax:number,az:number,bx:number,bz:number){const dx=bx-ax,dz=bz-az,d2=dx*dx+dz*dz||1;let cover=0;
  for(const e of players){if(e.team===team||e.keeper)continue;const t=clamp(((e.x-ax)*dx+(e.z-az)*dz)/d2,0,1);if(t>.08&&t<.94){const gap=Math.hypot(e.x-ax-dx*t,e.z-az-dz*t);cover+=Math.max(0,2.1-gap)*3;}}return cover;}
 /** Support angles (Oct 9 2026): an off-ball Gold teammate looks at a few spots around its shape position and takes the one
  * with a clear lane from the ball, away from defenders and not on top of a teammate. Re-read every 0.35 s, not per tick. */
 const support=new Float32Array(16),supportT=new Float32Array(8);
 const SUPPORT_OFFSETS=[[0,0],[0,3],[0,-3],[3,0],[-3,0],[2.5,2.5],[2.5,-2.5],[-2.5,2.5],[-2.5,-2.5]];
 function supportSpot(p:StrikerPlayer,bx:number,bz:number,baseX:number,baseZ:number,forward:number){
  if(supportT[p.id]>0)return;supportT[p.id]=.35;let best=-Infinity,sx=baseX,sz=baseZ;
  for(const [ox,oz] of SUPPORT_OFFSETS){const cx=clamp(baseX+ox*forward,-21,21),cz=clamp(baseZ+oz,-11.5,11.5),d=Math.hypot(cx-bx,cz-bz);
   let score=-laneBlock(0,bx,bz,cx,cz)*1.4-Math.hypot(ox,oz)*.22-Math.max(0,4.5-d)*1.2-Math.max(0,d-16)*.5;
   for(const e of players)if(e.team===1&&!e.keeper)score-=Math.max(0,STRIKER_MARKED+1.2-Math.hypot(e.x-cx,e.z-cz))*1.1;
   for(const q of players)if(q.team===0&&!q.keeper&&q!==p&&q.id!==state.selected){const qx=support[q.id*2],qz=support[q.id*2+1];if(supportT[q.id]>0)score-=Math.max(0,4-Math.hypot(qx-cx,qz-cz))*.8;}
   if(score>best){best=score;sx=cx;sz=cz;}}
  support[p.id*2]=sx;support[p.id*2+1]=sz;}
 function pass(p:StrikerPlayer,ix:number,iz:number,through=false,returnTo=-1,sprint=false){
  const target=returnTo>=0?players[returnTo]:receiver(p,ix,iz);if(!target)return;
  state.lastPasser=p.id;p.run=1.5;if(p.team===0){state.passFromZ=p.z;state.quickPass=state.holdTime<1.2&&state.passChain>0;}
  const distance=Math.hypot(target.x-p.x,target.z-p.z),manual=p.team===0&&p.id===state.selected,n=Math.max(1,Math.hypot(ix,iz)),runSpeed=sprint&&target.stamina>.04?12:8;
  // Control transfers to the receiver. Lead the movement the player is already
  // holding, including acceleration, rather than their previous AI velocity.
  // Solve a short intercept against friction; the released ball never homes.
  // Scanning stat: a pass the player chose into an open lane, or into a blocked one (the preview was warm).
  if(manual&&returnTo<0&&!state.setPiece.kind){if(laneCover/2.4>.5)state.riskyPasses++;else state.safePasses++;}
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
  const userPass=manual&&!state.setPiece.kind;if(userPass)state.userPasses++;
  const lofted=through&&sprint&&(p.team===0||state.setPiece.kind==='corner');release(p,tx-p.x,tz-p.z,lofted?speed*.8:speed,lofted?7.4:through?1.5:.5,'pass');state.userPassLive=userPass;if(lofted)state.message='Lofted through ball! Over the press, into the run.';else if(manual&&returnTo<0&&state.safePasses+state.riskyPasses<=3&&!state.setPiece.kind)state.message='Scan as it travels: cyan rings are free teammates for your next pass.';if(p.team===0)state.selected=target.id;
 }
 function tackle(p:StrikerPlayer){if(p.cooldown>0||p.stun>0)return;
  // Timed tackle: the carrier's heavy touch leaves the ball off their foot. Step in now for a clean steal.
  {const b=state.ball,carrier=b.owner>=0?players[b.owner]:null;if(p.id===state.selected&&carrier&&carrier.team!==p.team&&carrier.heavy>0&&Math.hypot(b.x-p.x,b.z-p.z)<2.6){carrier.stun=.45;carrier.heavy=0;b.owner=p.id;b.lastTeam=p.team;b.lock=.25;state.lastPasser=-1;state.passChain=0;p.receive=.22;p.receiveX=b.x-p.x;p.receiveZ=b.z-p.z;p.cooldown=.5;p.strikeKind='pass';state.perfectTackle++;addSpirit(0,T2.steal);state.holdTime=0;emit('steal',p.x,p.z,'PERFECT TACKLE! You stepped in when the ball left their foot.');return;}}
  // Coming from behind a runner is a foul in real football: the slide is held back and the coach says why.
  {const b=state.ball,carrier=b.owner>=0?players[b.owner]:null;if(p.id===state.selected&&carrier&&carrier.team!==p.team&&!carrier.keeper){const dx=carrier.x-p.x,dz=carrier.z-p.z,d=Math.hypot(dx,dz)||1,v=Math.hypot(carrier.vx,carrier.vz);if(v>2&&(carrier.vx*dx+carrier.vz*dz)/(v*d)>.6){p.cooldown=.35;emit('behind',p.x,p.z,'Not from behind! Get goal-side first, then tackle.');return;}}}p.tackle=.28;p.cooldown=1.15;const b=state.ball,dx=p.id===state.selected?b.x-p.x:p.tackleX-p.x,dz=p.id===state.selected?b.z-p.z:p.tackleZ-p.z,n=Math.hypot(dx,dz)||1;p.vx=dx/n*16;p.vz=dz/n*16;p.yaw=Math.atan2(dx,dz);emit('tackle',p.x,p.z,p.team===0?'Win the ball, then find a teammate.':'Sliding in! Move the ball before they arrive.');}
 // --- Set pieces -------------------------------------------------------------------------------------------
 // A foul (a tackle from behind) or a parry around the post stops play. Everyone is placed and
 // the kick is taken with the normal controls. Blue's set pieces are taken by the AI after a short look.
 function awardSetPiece(kind:Exclude<StrikerSetPieceKind,''>,team:0|1,x:number,z:number){const b=state.ball,forward=team===0?1:-1,goalX=forward*25,sp=state.setPiece;
  sp.kind=kind;sp.team=team;if(team===1)state.bluePieceAt=state.time;sp.wait=team===0?6:kind==='penalty'?1.6:1.1;sp.guess=0;state.queuedPass=state.queuedShot=0;state.curlTime=0;state.interceptor=-1;state.charge=0;state.lastPasser=-1;state.setPieceShot=false;
  if(kind==='penalty'){x=forward*STRIKER_PENALTY_X;z=0;}if(kind==='corner'){x=forward*24.3;z=(Math.sign(z)||1)*13.2;}
  x=clamp(x,-24.3,24.3);z=clamp(z,-13.2,13.2);sp.x=x;sp.z=z;
  // Taker: the nearest outfield player of the awarded team.
  let taker=-1,best=Infinity;for(const p of players)if(p.team===team&&!p.keeper){const d=Math.hypot(p.x-x,p.z-z);if(d<best){best=d;taker=p.id;}}sp.taker=taker;
  const gx=goalX-x,gz=-z,gl=Math.hypot(gx,gz)||1,ux=gx/gl,uz=gz/gl;
  for(const p of players){p.vx=p.vz=0;p.tackle=p.windup=p.stun=p.skill=p.dive=p.react=p.run=p.receive=0;p.jockey=0;p.heavy=0;p.caught=false;p.wall=0;}
  const t=players[taker];t.x=x-ux*.85;t.z=z-uz*.85;t.yaw=Math.atan2(ux,uz);Object.assign(b,{owner:taker,x,z,y:.25,vx:0,vz:0,vy:0,lock:.3,lastTeam:team});
  const attackers=players.filter(p=>p.team===team&&!p.keeper&&p.id!==taker),defenders=players.filter(p=>p.team!==team&&!p.keeper),keeper=players[team===0?7:3],ownKeeper=players[team===0?3:7];
  keeper.x=goalX-forward*.6;keeper.z=0;keeper.yaw=Math.atan2(-forward,0);keeper.tackleX=keeper.x;keeper.keeperAim=0;ownKeeper.x=-goalX+forward*2.5;ownKeeper.z=0;
  if(kind==='penalty'){
   // Everyone else waits outside the box, behind the spot.
   attackers.forEach((p,i)=>{p.x=forward*15.5;p.z=(i?-1:1)*6;});defenders.forEach((p,i)=>{p.x=forward*15.5;p.z=(i-1)*3;});
   sp.aimSide=team===1?[1,-1,1,-1,-1,1][(state.fouls[0]+state.level)%6]:0;
   // Blue's penalty taker "tells" with the hips: honest in early rounds, sometimes a dummy later.
   if(team===1){const honest=(state.fouls[0]+state.level)%(state.level<3?9:3)!==0;t.yaw=Math.atan2(-1,(honest?sp.aimSide:-sp.aimSide)*.45);}
  }else if(kind==='corner'){
   // Two attackers at the near and far post; defenders mark them; the third defender guards the edge.
   const near=Math.sign(z),posts=[[goalX-forward*3.4,near*2.2],[goalX-forward*4.6,-near*1.6]];
   attackers.forEach((p,i)=>{const [px,pz]=posts[i%2];p.x=px;p.z=pz;});defenders.forEach((p,i)=>{if(i<2){const a=attackers[i%attackers.length];p.x=a.x+forward*.9;p.z=a.z+.6*(i?1:-1);}else{p.x=goalX-forward*9;p.z=0;}});
   if(team===0)state.selected=attackers[0]?.id??taker;
  }else{
   // Free kick: a two-player wall on the ball-to-goal line, the keeper covering the side the wall does not.
   const close=Math.abs(goalX-x)<20;defenders.forEach((p,i)=>{if(i<2&&close){const wx=x+ux*STRIKER_WALL_GAP,wz=z+uz*STRIKER_WALL_GAP;p.x=wx-uz*(i?.55:-.55);p.z=wz+ux*(i?.55:-.55);p.yaw=Math.atan2(-ux,-uz);p.wall=1.4;}else{p.x=clamp(x+ux*9,-22,22);p.z=clamp(z+uz*9+(i-1)*3,-12,12);}});
   attackers.forEach((p,i)=>{p.x=clamp(x+ux*8,-22,22);p.z=clamp(z+(i?-1:1)*5.5,-12,12);});if(close)keeper.z=clamp(-Math.sign(z||1)*1.3,-3,3);
  }
  if(team===0&&kind!=='corner')state.selected=taker;
  emit(kind==='penalty'?'penalty':kind==='corner'?'corner':'freekick',x,z,team===0?STRIKER_SET_PIECE_LESSONS[kind]:kind==='penalty'?'Penalty to Blue. Watch the hips, then pick a side!':kind==='corner'?'Blue corner. Mark your player and clear it!':'Blue free kick. Hold the shape.');}
 function foul(tackler:StrikerPlayer,victim:StrikerPlayer){state.fouls[tackler.team]++;const team=victim.team,forward=team===0?1:-1,inBox=victim.x*forward>STRIKER_BOX_X&&Math.abs(victim.z)<STRIKER_BOX_Z;
  emit('foul',victim.x,victim.z,'');awardSetPiece(inBox?'penalty':'free',team,victim.x,victim.z);
  state.message=tackler.team===0?'Foul! Tackle from the side or front, never from behind.':inBox?'Fouled in the box: PENALTY! Pick a corner and commit.':'Fouled from behind: free kick! '+(Math.abs(state.setPiece.x-25)<20?'Curl it around the wall.':'Play it forward.');}
 // --- Penalty shootout: three each, then sudden death. Gold kicks first. ----------------------------------------
 function startShootout(){const so=state.shootout;so.active=true;so.turn=0;so.kicks[0]=so.kicks[1]=so.goals[0]=so.goals[1]=0;so.winner=-1;so.wait=-1;
  emit('shootout',0,0,'Penalties! Three each. Pick your corner; on Blue\'s kicks, hold up or down to dive.');awardSetPiece('penalty',0,25,0);}
 function decided(){const so=state.shootout,[g,b]=so.goals,[kg,kb]=so.kicks,n=STRIKER_SHOOTOUT_KICKS;
  if(kg<=n&&kb<=n){if(g>b+(n-kb))return 0;if(b>g+(n-kg))return 1;}if(kg===kb&&kg>=n&&g!==b)return g>b?0:1;return -1;}
 function nextPenalty(){const so=state.shootout;so.kicks[so.turn]++;const w=decided();if(w>=0){so.winner=w;so.active=false;state.finished=true;state.charge=0;state.crowd=1;emit('shootoutend',0,0,w===0?'Gold wins on penalties!':'Blue wins on penalties.');return;}
  so.turn=so.turn===0?1:0;so.wait=-1;awardSetPiece('penalty',so.turn,so.turn===0?25:-25,0);}
 function shootoutStep(dt:number,input:StrikerInput){const so=state.shootout;
  if(state.goalPause>0){state.goalPause-=dt;if(state.hitStop>0)state.hitStop=Math.max(0,state.hitStop-dt);else celebrate(dt);if(state.goalPause<=0)nextPenalty();return;}
  // Play the kick with the normal engine (clock frozen); a kick that does not go in within 1.6 s is a miss or save.
  const t=state.time;stepPlay(dt,input);state.time=t;if(state.setPiece.kind===''&&so.wait<0&&state.goalPause<=0)so.wait=1.6;
  if(so.wait>0){so.wait-=dt;if(so.wait<=0&&state.goalPause<=0){emit('miss',state.ball.x,state.ball.z,so.turn===0?'Saved! Pick a corner next time.':'Saved! Great dive!');nextPenalty();}}}
 /** AI taker for Blue (and for Gold after a long wait, so a match never stalls). */
 function takeSetPiece(){const sp=state.setPiece,t=players[sp.taker],forward=sp.team===0?1:-1,goal=Math.abs(forward*25-t.x);
  if(sp.kind==='penalty'){state.setPieceShot=sp.team===0;shoot(t,.62,sp.team===1?sp.aimSide*.8:.7);}
  else if(sp.kind==='corner'){const target=players.filter(p=>p.team===sp.team&&!p.keeper&&p.id!==t.id)[0];if(target){state.setPieceShot=sp.team===0;pass(t,target.x-t.x,target.z-t.z,true,target.id,true);}}
  else if(goal<20){state.setPieceShot=sp.team===0;shoot(t,.7,players[sp.team===0?7:3].z>0?-.85:.85);}else pass(t,forward,0);
  sp.kind='';}
 // Skill move: stick back = drag-back, stick to a side = step-over, otherwise roulette. A skill started before a
 // committed tackle arrives makes it miss; spamming them tires the legs (three inside 3 s rests them).
 function skillMove(p:StrikerPlayer,ix:number,iz:number){if(p.skill>0||p.stun>0||p.tackle>0)return false;if(state.time-p.skillAt>3)p.skillCount=0;
  if(p.skillCount>=3&&state.time-p.skillAt<STRIKER_SKILL_REST+1){emit('tired',p.x,p.z,'Tired legs! Pass the ball instead.');return false;}
  const fx=Math.sin(p.yaw),fz=Math.cos(p.yaw),n=Math.hypot(ix,iz),ahead=n>.3?(ix*fx+iz*fz)/n:0,across=n>.3?(ix*fz-iz*fx)/n:0;
  let kind:StrikerSkill='roulette',sideSign:-1|1=1;if(ahead<-.45)kind='dragBack';else if(Math.abs(across)>.4){kind='stepover';sideSign=across>0?1:-1;}
  else{let best=Infinity;for(const q of players)if(q.team!==p.team&&!q.keeper){const d=Math.hypot(q.x-p.x,q.z-p.z);if(d<best){best=d;sideSign=((q.x-p.x)*fz-(q.z-p.z)*fx)>0?-1:1;}}}
  p.skill=STRIKER_SKILLS[kind].seconds;p.skillKind=kind;p.skillSide=sideSign;p.skillYaw=p.yaw;p.skillCount++;p.skillAt=state.time;state.skillEvent++;state.lastSkill=kind;
  emit('skill',p.x,p.z,STRIKER_SKILLS[kind].lesson);return true;}
 // Read a shot once, after the reaction delay: set, or dive to the predicted crossing.
 function readShot(k:StrikerPlayer){const b=state.ball,forward=k.team===0?1:-1;if(b.owner>=0||b.vx*forward>=0)return;const t=(k.x-b.x)/(b.vx||-1e-6);if(t<=0)return;if(t>.7){k.react=.1;return;}
  const zc=b.z+b.vz*t,yc=Math.max(.25,b.y+b.vy*t-6*t*t),gap=zc-k.z;k.saveHeight=yc;k.saveSide=gap*forward<0?-1:1;k.saveWide=Math.abs(gap)>.48;
  if(Math.abs(gap)<.85||Math.abs(zc)>state.goalHalf+1.4||yc>3.1){k.jockey=1;return;}
  const reach=(k.team===1?tune.dive():10.5)*(state.teamStrike?.6:1);k.dive=STRIKER_DIVE;k.vz=clamp(gap/Math.max(t,.14),-reach,reach);k.vx=forward*.8;}
 function score(team:number){if(state.shootout.active){state.shootout.goals[team]++;state.shootout.wait=-1;state.goalPause=1.1;state.hitStop=STRIKER_HIT_STOP;state.crowd=1.4;state.scorer=-1;state.ball.lastTeam=team;emit('goal',state.ball.x,state.ball.z,team===0?'Penalty scored!':'Blue scores the penalty.');return;}
  if(state.extra)state.goldenWin=true;state.score[team]++;if(team===1)state.concedeCause=state.teamStrike?'teamStrike':state.time-state.bluePieceAt<5?'setPiece':state.lostKind&&state.time-state.lostAt<STRIKER_CONCEDE_WINDOW?state.lostKind:'shot';if(team===0){const g=state.goalStory;g.chain=state.passChain;g.habit=state.time-state.habitAt<STRIKER_HABIT_GOAL_WINDOW;g.firstTime=state.firstTimeShot;g.teamStrike=state.teamStrike;g.chip=state.chip;g.curled=state.curled;g.setPiece=state.setPieceShot;g.clean=state.cleanStrike;g.at=state.time;if(state.time-state.habitAt<STRIKER_HABIT_GOAL_WINDOW)state.habitGoals++;if(state.firstTimeShot)state.firstTimeGoals++;if(state.setPieceShot)state.setPieceGoals++;}const b=state.ball;b.lastTeam=team;state.goalPause=STRIKER_GOAL_PAUSE;state.hitStop=STRIKER_HIT_STOP;state.crowd=1.6;const kicker=state.lastKicker>=0?players[state.lastKicker]:null;state.scorer=kicker&&kicker.team===team&&!kicker.keeper?kicker.id:-1;state.charge=0;state.interceptor=-1;
  // The ball keeps travelling into the net (slowed in celebrate), not frozen on the line.
  b.vx=clamp(b.vx,-14,14);b.vz*=.4;b.vy=Math.min(b.vy,1);emit('goal',b.x,b.z,team===0?'GOAL! Great finish.':'Blue scores. Win it back!');}
 // Goal celebration: scorer runs to the corner, teammates join, the other side trudges back.
 function celebrate(dt:number){const b=state.ball,scorer=state.scorer>=0?players[state.scorer]:null,team=b.lastTeam,forward=team===0?1:-1;
  const side=Math.sign(b.x)||forward;b.x=clamp(b.x+b.vx*dt,-26,26);b.z=clamp(b.z+b.vz*dt,-state.goalHalf+.3,state.goalHalf-.3);b.vx*=Math.exp(-dt*5);b.vz*=Math.exp(-dt*5);b.vy-=12*dt;b.y+=b.vy*dt;if(b.y<.25){b.y=.25;b.vy=0;}if(Math.abs(b.x)>25.9)b.vx=0;b.spin+=Math.hypot(b.vx,b.vz)*dt/.25;
  for(const p of players){let tx=p.x,tz=p.z,speed=0;
   if(p.keeper){speed=0;}
   else if(p===scorer){tx=side*20;tz=(Math.sign(p.z)||1)*11.5;speed=9;}
   else if(p.team===team){const lead=scorer??players[team===0?0:4];tx=lead.x-forward*1.6;tz=lead.z+(p.id%4-1)*1.4;speed=8;}
   else{tx=p.x-forward*2;speed=2.2;}
   const dx=tx-p.x,dz=tz-p.z,n=Math.hypot(dx,dz),want=n>.4?speed*Math.min(1,n/2):0,response=1-Math.exp(-dt*8);
   p.vx+=((n?dx/n:0)*want-p.vx)*response;p.vz+=((n?dz/n:0)*want-p.vz)*response;p.x=clamp(p.x+p.vx*dt,-24,24);p.z=clamp(p.z+p.vz*dt,-13,13);
   p.kick=Math.max(0,p.kick-dt*2.6);p.dive=Math.max(0,p.dive-dt);p.receive=Math.max(0,p.receive-dt);p.tackle=p.windup=0;p.stun=Math.max(0,p.stun-dt);
   if(Math.hypot(p.vx,p.vz)>.3)p.yaw+=Math.atan2(Math.sin(Math.atan2(p.vx,p.vz)-p.yaw),Math.cos(Math.atan2(p.vx,p.vz)-p.yaw))*(1-Math.exp(-dt*10));}
 }
 function step(dt:number,input:StrikerInput){if(dt<=0||state.finished)return;dt=Math.min(dt,.05);if(state.shootout.active){shootoutStep(dt,input);return;}
  state.time=Math.min(state.duration,state.time+dt);
  if(state.time>=state.duration&&state.mods.golden&&state.score[0]===state.score[1]&&state.goalPause<=0){
   if(!state.extra){state.extra=true;state.duration+=STRIKER_EXTRA_TIME;emit('golden',0,0,'Golden goal! The next goal wins.');}
   else{startShootout();return;}}
  if(state.time>=state.duration){state.finished=true;state.charge=0;state.crowd=1;return;}
  stepPlay(dt,input);}
 function stepPlay(dt:number,input:StrikerInput){
  if(state.goalPause>0){state.goalPause-=dt;state.crowd=Math.max(.6,state.crowd-dt*.35);if(state.hitStop>0)state.hitStop=Math.max(0,state.hitStop-dt);else celebrate(dt);if(state.goalPause<=0){if(state.goldenWin){state.finished=true;state.charge=0;return;}if(state.shootout.active){nextPenalty();return;}kickoff(state.ball.lastTeam===0?1:0);}return;}
  {const sp=state.setPiece;if(sp.kind){const t=players[sp.taker];
   // The kick happened (by the player or the AI): play on.
   if(b0().owner!==sp.taker)sp.kind='';
   else{sp.wait-=dt;
    // Blue penalty: the player picks the Gold keeper's dive with the stick (held when the kick comes).
    if(sp.kind==='penalty'&&sp.team===1)sp.guess=Math.abs(input.z)>.3?Math.sign(input.z):0;
    // Gold corner: Switch flips between the near- and far-post attacker; Pass whips in the cross.
    if(sp.kind==='corner'&&sp.team===0){if(input.switchPlayer){const others=players.filter(p=>p.team===0&&!p.keeper&&p.id!==sp.taker);const i=others.findIndex(p=>p.id===state.selected);state.selected=others[(i+1)%others.length].id;input.switchPlayer=false;}
     if(input.pass||input.through){state.setPieceShot=true;pass(t,players[state.selected].x-t.x,players[state.selected].z-t.z,true,state.selected,true);sp.kind='';input.pass=input.through=false;state.message='Cross! Tap Shoot as it arrives to head it in.';}}
    else if(sp.team===0&&(input.shoot||input.pass||input.through))state.setPieceShot=true;
    if(sp.kind&&sp.wait<=0){const guess=sp.guess,blue=sp.team===1,penalty=sp.kind==='penalty';takeSetPiece();
     if(penalty&&blue){const k=players[3];k.react=0;if(guess){k.dive=STRIKER_DIVE;k.vz=guess*12;k.vx=.6;k.saveSide=guess>0?1:-1;k.saveWide=true;k.saveHeight=.6;}}}
   }
   if(input.switchPlayer&&sp.kind)input.switchPlayer=false;}}
  state.queuedPass=Math.max(0,state.queuedPass-dt);state.queuedShot=Math.max(0,state.queuedShot-dt);state.passAge+=dt;
  const b=state.ball;if(input.switchPlayer){state.queuedPass=0;let best=Infinity,next=state.selected;const previous=state.selected;for(const p of players)if(p.team===0&&!p.keeper&&p.id!==previous){const d=Math.hypot(p.x-b.x,p.z-b.z);if(d<best){best=d;next=p.id;}}state.selected=next;}
  const user=players[state.selected];state.aim=input.z;state.passTarget=b.owner===user.id?(receiver(user,input.x,input.z)?.id??-1):-1;state.passRisk=state.passTarget>=0?clamp(laneCover/2.4,0,1):0;state.charge=input.charge&&b.owner===user.id?Math.min(1,state.charge+dt*.95):0;
  if(b.owner===user.id)state.holdTime+=dt;
  // Scan markers: how open each Gold teammate is from the ball (lane clear and unmarked). Once per frame, 3 x 4 checks.
  for(const q of players){if(q.team!==0||q.keeper||q.id===b.owner){state.laneOpen[q.id]=0;continue;}let near=Infinity;for(const e of players)if(e.team===1&&!e.keeper)near=Math.min(near,Math.hypot(e.x-q.x,e.z-q.z));
   state.laneOpen[q.id]=clamp(1-laneBlock(0,b.x,b.z,q.x,q.z)/2.4,0,1)*clamp((near-STRIKER_MARKED*.6)/(STRIKER_MARKED*.6),0,1);}
  // Crowd energy follows the attack: gold near the blue goal, or blue threatening ours.
  {const owner=b.owner>=0?players[b.owner]:null,gold=clamp((b.x-6)/14,0,1),blue=clamp((-b.x-6)/14,0,1)*.75,target=owner?(owner.team===0?gold:blue):Math.max(gold,blue)*.8;state.crowd+=(target-state.crowd)*(1-Math.exp(-dt*(target>state.crowd?1.6:.7)));}
  // Touch window: how close a Gold pass is to reaching the selected player (0 = none, 1 = at feet).
  {const incoming=b.owner<0&&state.lastPasser>=0&&players[state.lastPasser].team===0&&state.lastPasser!==user.id,v2=b.vx*b.vx+b.vz*b.vz;let w=0,e=-1;if(incoming&&v2>4){const eta=((user.x-b.x)*b.vx+(user.z-b.z)*b.vz)/v2;if(eta>0){e=eta;if(eta<STRIKER_TOUCH_WINDOW)w=1-eta/STRIKER_TOUCH_WINDOW;}}state.touchWindow=w;state.touchEta=e;}
  if(input.skill&&b.owner===user.id)skillMove(user,input.x,input.z);
  if(input.call&&b.owner===user.id&&!state.setPiece.kind)callRun(user);
  // Aftertouch curl: for a moment after striking, holding up or down bends the ball (Sensible-style, gently capped).
  if(state.curlTime>0){state.curlTime-=dt;if(b.owner<0&&state.lastKicker===state.selected&&Math.abs(input.z)>.3){const bend=input.z*24*dt;b.vz=clamp(b.vz+bend,-16,16);if(!state.curled){state.curled=true;state.message='Curled it! Bend the ball away from the keeper.';}}}
  if(input.shoot&&b.owner===user.id){if(input.sprint)chip(user,clamp(input.power,0,1),input.z);else if(state.spirit[0]>=1&&input.power>=.88&&!state.setPiece.kind)teamStrike(user,input.z);else shoot(user,clamp(input.power,0,1),input.z,false,true);}
  // Shoot while a pass is on its way: a buffered first-time shot. Inside the window it is "perfect".
  else if(input.shoot&&b.owner<0&&state.lastPasser>=0&&players[state.lastPasser].team===0&&state.lastPasser!==user.id){state.queuedShot=.65;state.queuedPass=0;state.queuedShotPower=clamp(input.power>.3?input.power:.72,.45,.9);state.queuedPerfect=state.touchWindow>0;state.message='FIRST-TIME SHOT READY · meet it and strike!';}
  if(input.pass||input.through){if(b.owner===user.id)pass(user,input.x,input.z,input.through,-1,input.sprint);else if(b.owner<0&&state.lastPasser>=0&&players[state.lastPasser].team===0){state.queuedPass=.65;state.queuedShot=0;state.queuedThrough=input.through;state.queuedX=input.x;state.queuedZ=input.z;state.queuedPerfect=state.touchWindow>0;state.message='ONE-TOUCH READY · meet it and move it.';}else tackle(user);}
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
   if(T.receiverPress[lv()]&&!owner&&state.lastPasser>=0&&players[state.lastPasser].team===0){let best=Infinity;const target=players[state.selected];for(const p of players)if(p.team===1&&!p.keeper&&p.id!==closest[1]){const gap=Math.hypot(p.x-target.x,p.z-target.z);if(gap<best){best=gap;receiverPress=p.id;}}}
   // Pressure and cover: while Gold carries the ball, Blue's second defender
   // sits goal-side of the presser instead of following a mark (rounds 3-4).
   // Gold's AI teammates keep marking, so the player is never left 3v1.
   const cover=[-1,-1];
   if(owner&&!owner.keeper)for(const team of [1]){if(owner.team===team||!T.cover[lv()])continue;const goalX=team===0?-25:25,gx=goalX-b.x,gz=-b.z,gl=Math.hypot(gx,gz)||1,cx=b.x+gx/gl*4.5,cz=b.z+gz/gl*4.5;let best=Infinity;
    for(const p of players)if(p.team===team&&!p.keeper&&p.id!==closest[team]&&p.id!==state.selected&&p.stun<=0){const d=Math.hypot(p.x-cx,p.z-cz);if(d<best){best=d;cover[team]=p.id;}}}
   state.presser=owner&&owner.team===0?closest[1]:-1;state.cover=cover[1];
   // Read the pass lane. One defender per pass may step across it, after a
   // short read; they must actually beat the ball to the spot.
   if(!owner&&state.lastPasser>=0&&b.lock<=0){const passer=players[state.lastPasser],team=passer.team===0?1:0,skill=team===1?tune.skill():.85,read=team===1?T.interceptRead[lv()]:.2,v2=b.vx*b.vx+b.vz*b.vz;
    if(skill>0&&state.passAge>read&&v2>64){const target=passer.team===0?players[state.selected]:null,tReceive=target?Math.max(0,((target.x-b.x)*b.vx+(target.z-b.z)*b.vz)/v2):9;let best=state.interceptor>=0?-.2:0,id=-1,ix=0,iz=0;
     for(const q of players){if(q.team!==team||q.keeper||q.stun>0||q.tackle>0)continue;const t=((q.x-b.x)*b.vx+(q.z-b.z)*b.vz)/v2;if(t<.1||t>1.3||t>tReceive-.08)continue;const slow=(1-Math.exp(-.85*t))/(.85*t),px=b.x+b.vx*t*slow,pz=b.z+b.vz*t*slow,margin=t-Math.hypot(px-q.x,pz-q.z)/(7.6*skill)-.06+(q.id===state.interceptor?.2:0);if(margin>best){best=margin;id=q.id;ix=px;iz=pz;}}
     state.interceptor=id;state.interceptX=ix;state.interceptZ=iz;}else if(skill<=0)state.interceptor=-1;}
   else if(owner)state.interceptor=-1;
   for(const p of players){if(state.setPiece.kind){p.vx=p.vz=0;if(p.id===state.setPiece.taker&&state.setPiece.team===0&&state.setPiece.kind!=='corner')p.yaw=Math.atan2(25-p.x,clamp(input.z*4.5,-4.5,4.5)-p.z);continue;}
    p.receive=Math.max(0,p.receive-h);supportT[p.id]=Math.max(0,supportT[p.id]-h);p.wall=Math.max(0,p.wall-h);p.kick=Math.max(0,p.kick-h*2.6);p.cooldown=Math.max(0,p.cooldown-h);p.stun=Math.max(0,p.stun-h);p.tackle=Math.max(0,p.tackle-h);p.think-=h;if(p.windup>0){if(b.owner<0||players[b.owner].team===p.team)p.windup=0;else{p.windup-=h;if(p.windup<=0)tackle(p);}}p.run=Math.max(0,p.run-h);p.jockey=0;p.header=Math.max(0,p.header-h);if(p.strikeCharge>0&&b.owner!==p.id){p.strikeCharge=0;state.spirit[p.team]*=.5;}let dx=0,dz=0,speed=8;
    if(b.owner===p.id&&p.team===1&&!p.keeper){p.heavy=Math.max(0,p.heavy-h);p.touchCycle-=h;if(p.touchCycle<=0){p.heavy=STRIKER_HEAVY_TOUCH;p.touchCycle=1.05+(p.id%3)*.12;}}else{p.heavy=0;if(b.owner!==p.id)p.touchCycle=Math.min(p.touchCycle,.9);}
    if(p.react>0){p.react-=h;if(p.react<=0){p.react=0;readShot(p);}}
    if(p.dive>0){p.dive=Math.max(0,p.dive-h);if(p.dive<=0)p.cooldown=Math.max(p.cooldown,.25);}
    if(p.id===state.selected){const n=Math.max(1,Math.hypot(input.x,input.z));dx=input.x/n;dz=input.z/n;
     // Receive assistance only with a neutral stick; manual movement always wins.
     if(Math.hypot(input.x,input.z)<.12&&b.owner<0&&state.lastPasser>=0&&players[state.lastPasser].team===p.team){const t=clamp(((p.x-b.x)*b.vx+(p.z-b.z)*b.vz)/(b.vx*b.vx+b.vz*b.vz||1),0,.65),ax=b.x+b.vx*t-p.x,az=b.z+b.vz*t-p.z,length=Math.hypot(ax,az);if(length>.3){dx=ax/Math.max(1,length);dz=az/Math.max(1,length);}}
     const boost=input.sprint&&p.stamina>.04&&Math.hypot(dx,dz)>.1;speed=boost?12:8;p.stamina=clamp(p.stamina+h*(boost?-.35:.22),0,1);if(input.charge&&owner===p)speed*=.65;}
    else{speed=p.team===1?tune.speed():7.2;const forward=p.team===0?1:-1;let tx=p.x,tz=p.z;
     if(p.keeper){
      // Narrow the angle: stand on the ball-to-goal line, further off it as an attacker closes in.
      const goalX=-forward*25,t0=b.owner<0&&b.vx*forward<0?clamp((-forward*22.5-b.x)/b.vx,0,.65):0,approaching=t0>0&&Math.abs(b.vx)>12&&Math.abs(b.z+b.vz*t0)<6.5,t=approaching?t0:0,threat=(owner&&owner.team!==p.team)||approaching,gx=b.x-goalX,gz=b.z,gl=Math.hypot(gx,gz)||1,out=threat&&gl<15?2.5+(15-gl)*.12:2.5;
      // Held ball: distribute to the best open lane after a short look.
      if(owner===p){tx=p.x;tz=p.z;speed=0;if(p.think<=0){p.caught=false;p.think=.24;pass(p,forward,0);}}
      else{if(p.think<=0){p.keeperAim=approaching?clamp((b.z+b.vz*t)*.8,-3.8,3.8):clamp(gz/gl*out,-3.8,3.8);p.tackleX=approaching?goalX+forward*2.4:goalX+gx/gl*out;p.think=.24;}
       tx=p.tackleX||-forward*22.5;tz=p.keeperAim;speed=approaching?6.3:threat?5.5:4.5;}
      // A charged shot coming: set the feet, weight forward.
      if(owner&&owner.team!==p.team&&(owner.id===state.selected?state.charge>.2:Math.abs(forward*-25-owner.x)<21))p.jockey=1;
     }
     else if(owner===p&&p.strikeCharge>0){p.strikeCharge=Math.max(0,p.strikeCharge-h);tx=p.x+forward*.3;tz=p.z;speed=1.2;p.jockey=0;if(p.strikeCharge<=0){const k=players[p.team===0?7:3];teamStrike(p,k.z>0?-.85:.85);}}
     else if(owner===p&&p.team===1&&state.spirit[1]>=1&&state.blueStrikes<STRIKER_BLUE_STRIKES[lv()]&&Math.abs(forward*25-p.x)<21&&!state.setPiece.kind){p.strikeCharge=1.05;state.blueStrikes++;emit('bluecharge',p.x,p.z,'Blue is charging a Team Strike! Close the shooter down!');tx=p.x;tz=p.z;}
     else if(owner===p){tx=forward*22;tz=p.z*.65;for(const q of players){if(q.team===p.team||q.keeper)continue;const ahead=(q.x-p.x)*forward,gap=q.z-p.z;if(ahead>0&&ahead<5&&Math.abs(gap)<2.5)tz=clamp(p.z+(gap>=0?-3:3),-10,10);}if(p.think<=0){p.think=p.team===1?T.carrierThink[lv()]:.8;if(Math.abs(forward*25-p.x)<19)shoot(p,.45+Math.abs(Math.sin(state.time))*.4,Math.sin(state.time*1.7)*.85);else if(players.some(q=>q.team!==p.team&&Math.hypot(q.x-p.x,q.z-p.z)<3))pass(p,forward,0);}}
     else if(p.id===state.interceptor){tx=clamp(state.interceptX,-23,23);tz=clamp(state.interceptZ,-12,12);speed=7.6*(p.team===1?tune.skill():.85)+.6;p.jockey=.6;}
     else if((!owner||owner.team!==p.team)&&p.id===closest[p.team]&&!owner?.keeper){const lead=owner?0:Math.min(.4,Math.hypot(p.x-b.x,p.z-b.z)/24);tx=clamp(b.x+b.vx*lead,-23,23);tz=clamp(b.z+b.vz*lead,-12,12);if(owner&&owner.team!==p.team){const gap=Math.hypot(p.x-b.x,p.z-b.z);if(gap<5){p.jockey=1;tx=b.x-forward*1.9;tz=b.z;speed*=.8;}// Good defenders get goal-side first: no wind-up while the carrier runs away from them (that would be a foul from behind).
      const away=(owner.vx*(p.x-owner.x)+owner.vz*(p.z-owner.z))<-.55*Math.hypot(owner.vx,owner.vz)*gap;if(gap<3.1&&p.think<=0&&p.windup<=0&&!away){p.windup=p.team===1?tune.windup():.36-(state.level-1)*.025;p.think=p.team===1?tune.think():1.65-(state.level-1)*.12;p.tackleX=b.x+owner.vx*.12;p.tackleZ=b.z+owner.vz*.12;}}}
     else if(p.id===receiverPress){const target=players[state.selected];tx=clamp(target.x+1.4,-21,21);tz=clamp(target.z,-11,11);p.jockey=1;}
     else if(p.id===cover[p.team]){const goalX=-forward*25,gx=goalX-b.x,gz=-b.z,gl=Math.hypot(gx,gz)||1;tx=clamp(b.x+gx/gl*4.5,-22,22);tz=clamp(b.z+gz/gl*4.5,-11,11);p.jockey=Math.hypot(p.x-b.x,p.z-b.z)<8?1:0;}
     else if(owner?.team===p.team){
      // A triangle around the ball: width plus a forward run after releasing it.
      tx=clamp(b.x+forward*(p.run>0?9:p.id%4===0?-5:5),-20,20);tz=p.id%4===1?-8:p.id%4===2?8:(b.z>0?-3:3);
      // Team shape (Gold): wide players hug the touchlines; solid keeps one teammate back as rest defence.
      if(p.team===0&&p.run<=0){if(state.shape==='wide'&&p.id%4!==0){tz=p.id%4===1?-11.5:11.5;tx=clamp(b.x+forward*6,-20,20);}if(state.shape==='solid'&&p.id%4===2){tx=clamp(Math.min(b.x-8,-6),-20,20);tz=b.z*.3;}}
      // Gold's support angle: pick the open spot near the shape position (forward runs and called runs keep their line).
      if(p.team===0&&p.run<=0&&p.callRun<=0){supportSpot(p,b.x,b.z,tx,tz,forward);tx=support[p.id*2];tz=support[p.id*2+1];}
      // A called run overrides the shape until the pass arrives or the run fades.
      if(p.team===0&&p.callRun>0){const carrier=owner!;p.callRun=Math.max(0,p.callRun-h);speed=10.5;
       if(p.callKind==='behind'){let last=-25;for(const q of players)if(q.team!==p.team&&!q.keeper)last=Math.max(last,q.x*forward);tx=clamp(forward*(last+3.5),-22.5,22.5);tz=clamp(p.z*.7,-10,10);}
       else if(p.callKind==='overlap'){const out=Math.sign(carrier.z)||1;tx=clamp(carrier.x+forward*7,-22,22);tz=clamp(carrier.z+out*4.5,-12,12);}
       else{tx=clamp(carrier.x+forward*3,-22,22);tz=clamp(carrier.z+(p.z>carrier.z?4:-4),-12,12);}}
      // Shift the receiving angle out of a defender's cover shadow.
      for(const q of players){if(q.team===p.team||q.keeper)continue;const ax=tx-b.x,az=tz-b.z,length=ax*ax+az*az||1,t=clamp(((q.x-b.x)*ax+(q.z-b.z)*az)/length,0,1);if(t>.15&&t<.9&&Math.hypot(q.x-b.x-ax*t,q.z-b.z-az*t)<1.7)tz=clamp(tz+(tz>=b.z?2:-2),-11,11);}
     }else if(!owner){tx=clamp(b.x-forward*6,-19,19);tz=(p.id%4===1?-8:p.id%4===2?8:0)*.8+b.z*.2;}else{
      // Goal-side marking that tracks runs: later rounds read the runner's speed.
      const mark=players[(p.id%4)+(p.team===0?4:0)],lead=p.team===1?.1*state.level:.3,running=mark.run>0&&p.team===1&&state.level>=2;tx=clamp(mark.x+mark.vx*lead-forward*(running?1.3:2),-21,21);tz=clamp((mark.z+mark.vz*lead)*.75+b.z*.25,-11,11);if(running)speed*=1.12;if(p.team===1&&T.block[lv()]){tx=clamp(Math.max(tx,b.x+4),-21,21);tz=clamp(mark.z*.45+b.z*.15,-8,8);}p.jockey=Math.hypot(p.x-b.x,p.z-b.z)<8?1:0;}
     const n=Math.hypot(tx-p.x,tz-p.z);dx=(tx-p.x)/Math.max(1,n);dz=(tz-p.z)/Math.max(1,n);speed*=Math.min(1,n/1.8);
    }
    if(p.cooldown>.35&&p.tackle<=0)speed*=.68;
    // Skill move path (selected carrier only): the body follows the move, the ball stays glued.
    if(p.skill>0){const spec=STRIKER_SKILLS[p.skillKind],t=1-p.skill/spec.seconds,fx=Math.sin(p.skillYaw),fz=Math.cos(p.skillYaw),sx=fz*p.skillSide,sz=-fx*p.skillSide;
     if(p.skillKind==='dragBack'){dx=-fx;dz=-fz;speed=t<.5?2.4:6.5;if(t>=.5)p.yaw=p.skillYaw+Math.PI;}
     else if(p.skillKind==='stepover'){if(t<.45){dx=-sx*.6+fx*.4;dz=-sz*.6+fz*.4;speed=3;}else{dx=sx*.8+fx*.6;dz=sz*.8+fz*.6;speed=10.5;}}
     else{dx=fx*.55+sx*.85;dz=fz*.55+sz*.85;speed=t<.3?4:8.5;}
     p.skill=Math.max(0,p.skill-h);if(p.skill<=0&&p.skillKind==='dragBack')p.yaw=p.skillYaw+Math.PI;}
    if(p.dive>0){p.vz*=Math.exp(-h*2.2);p.vx*=Math.exp(-h*3);}
    else if(p.stun>0){p.vx*=Math.exp(-h*4);p.vz*=Math.exp(-h*4);}else if(p.tackle<=0){const tx=dx*speed,tz=dz*speed,braking=tx*p.vx+tz*p.vz<=0||Math.hypot(tx,tz)<Math.hypot(p.vx,p.vz),rate=(p.id===state.selected?(braking?26:18):12)*(state.mods.rain?.72:1),response=1-Math.exp(-h*rate);p.vx+=(tx-p.vx)*response;p.vz+=(tz-p.vz)*response;if(Math.hypot(tx,tz)<.001&&Math.hypot(p.vx,p.vz)<.025)p.vx=p.vz=0;}
    const nextX=p.x+p.vx*h,nextZ=p.z+p.vz*h;p.x=clamp(nextX,-24,24);p.z=clamp(nextZ,-13,13);if(p.x!==nextX)p.vx=0;if(p.z!==nextZ)p.vz=0;
    if(p.id===state.selected&&!input.sprint&&owner&&owner.team!==p.team&&Math.hypot(p.x-b.x,p.z-b.z)<5)p.jockey=1;
    if(p.dive>0||p.skill>0){/* mid-dive or mid-skill: the body keeps the move's facing */}
    else if(p.jockey>0&&p.tackle<=0)p.yaw+=Math.atan2(Math.sin(Math.atan2(b.x-p.x,b.z-p.z)-p.yaw),Math.cos(Math.atan2(b.x-p.x,b.z-p.z)-p.yaw))*(1-Math.exp(-h*14));
    else if(Math.hypot(p.vx,p.vz)>.3)p.yaw+=Math.atan2(Math.sin(Math.atan2(p.vx,p.vz)-p.yaw),Math.cos(Math.atan2(p.vx,p.vz)-p.yaw))*(1-Math.exp(-h*14));
    if(p.tackle>0&&b.owner>=0&&b.lock<=0){const victim=players[b.owner];
     // A skill move inside its evade window beats the committed challenge: the tackler goes past and stumbles.
     if(victim.team!==p.team&&victim.skill>0&&1-victim.skill/STRIKER_SKILLS[victim.skillKind].seconds<STRIKER_SKILLS[victim.skillKind].evade&&Math.hypot(victim.x-p.x,victim.z-p.z)<1.9){p.tackle=0;p.stun=.5;p.vx*=.4;p.vz*=.4;state.beatEvent++;addSpirit(victim.team,T2.beat);emit('beat',p.x,p.z,STRIKER_SKILLS[victim.skillKind].label+' beat the tackle! Now pass or shoot.');}
     else if(victim.team!==p.team&&Math.hypot(victim.x-p.x,victim.z-p.z)<1.65&&!victim.keeper&&(p.team===1||p.id===state.selected)&&Math.hypot(victim.vx,victim.vz)>3.5&&(p.vx*Math.sin(victim.yaw)+p.vz*Math.cos(victim.yaw))/(Math.hypot(p.vx,p.vz)||1)>.8){p.tackle=0;foul(p,victim);break;}
     else if(victim.team!==p.team&&Math.hypot(victim.x-p.x,victim.z-p.z)<1.65){victim.stun=.6;if(p.team===1)addSpirit(1,T2.blueTackle);if(victim.strikeCharge>0){victim.strikeCharge=0;state.spirit[victim.team]*=.5;}if(victim.team===0){state.lostKind='tackle';state.lostAt=state.time;}victim.vx=p.vx*.7;victim.vz=p.vz*.7;b.owner=-1;b.vx=p.vx*.6;b.vz=p.vz*.6;b.vy=2;b.lock=.2;p.tackle=0;emit('hit',victim.x,victim.z,victim.team===0?'Tackled! Release the ball before the defender arrives.':'Clean challenge! Chase the loose ball.');}}
   }
   // Separate bodies gently; tackles supply their own impulse.
   for(let i=0;i<players.length;i++)for(let j=i+1;j<players.length;j++){const a=players[i],c=players[j],dx=c.x-a.x,dz=c.z-a.z,n=Math.hypot(dx,dz);if(n>.001&&n<1.05){const push=(1.05-n)*.2;a.x-=dx/n*push;a.z-=dz/n*push;c.x+=dx/n*push;c.z+=dz/n*push;}}
   if(b.owner>=0){const p=players[b.owner],reach=.82+(p.heavy>0?Math.sin(p.heavy/STRIKER_HEAVY_TOUCH*Math.PI)*.85:0);b.x=p.x+Math.sin(p.yaw)*reach;b.z=p.z+Math.cos(p.yaw)*reach;b.y=.25;b.vx=p.vx;b.vz=p.vz;b.vy=0;}
   else{const oldX=b.x,oldZ=b.z,oldY=b.y;b.x+=b.vx*h;b.z+=b.vz*h;b.vy-=12*h;b.y+=b.vy*h;if(b.y<.25){b.y=.25;b.vy=Math.abs(b.vy)>.9?-b.vy*.4:0;}const grip=b.y<=.26?(state.mods.rain?.5:.85):.28;b.vx*=Math.exp(-h*grip);b.vz*=Math.exp(-h*grip);
    if(Math.abs(b.z)>13.7){b.z=Math.sign(b.z)*13.7;b.vz*=-.8;emit('board',b.x,b.z,'Use the rebound to keep the attack moving.');}
    if(Math.abs(b.x)>25){const t=(Math.sign(b.x)*25-oldX)/(b.x-oldX||1),crossZ=oldZ+(b.z-oldZ)*t,crossY=oldY+(b.y-oldY)*t;const G=state.goalHalf;if(Math.abs(crossZ)<G&&crossY<2.8){score(b.x>0?0:1);break;}
     // Last touched by the defending side over its own end line: corner.
     if((b.x>0&&b.lastTeam===1)||(b.x<0&&b.lastTeam===0)){awardSetPiece('corner',b.x>0?0:1,b.x,crossZ);break;}
     // Near misses get their own beat: the crowd gasps and the lesson is specific.
     const shot=Math.abs(b.vx)>14,attack=b.lastTeam===0;b.x=Math.sign(b.x)*24.9;b.vx*=-.78;
     if(shot&&Math.abs(crossZ)<G+2.9)state.nearMiss++;
     if(shot&&Math.abs(crossZ)<G)emit('miss',b.x,crossZ,attack?(state.overhit?'Over the bar! Placement beats power.':'Just over! Keep the shot low.'):'Over! Lucky escape.');
     else if(shot&&Math.abs(crossZ)<G+.55)emit('post',b.x,crossZ,attack?'Off the post! So close. Aim just inside it.':'Off our post! Close them down sooner.');
     else if(shot&&Math.abs(crossZ)<G+2.9)emit('miss',b.x,crossZ,attack?'Just wide! Aim inside the posts.':'Wide! Keep pressing the shooter.');
     else emit('board',b.x,b.z,'Off the frame! Stay ready for the rebound.');}
    if(b.lock<=0)for(const p of players){if(p.stun>0||p.tackle>0)continue;const d=Math.hypot(p.x-b.x,p.z-b.z),diving=p.dive>0;// The selected Gold player can take a high ball on the chest or head (chest/thigh control, headers).
     if(d<(p.keeper?(diving?1.6:1.3):1)&&b.y<(p.keeper?(diving?2.4:2.1):p.id===state.selected&&p.team===0?1.9:p.wall>0?1.7:.8)){if(p.keeper){
       // Latch contact before the clearance moves the ball. Wide stops get a
       // side dive, central stops stay upright; neither rolls the root mesh.
       const side=p.team===0?1:-1,speed=Math.hypot(b.vx,b.vz);if(!diving){p.saveSide=(b.z-p.z)*side<0?-1:1;p.saveHeight=b.y;p.saveWide=Math.abs(b.z-p.z)>.48;}
       const shotAt=b.lastTeam!==p.team&&speed>14;p.react=0;state.interceptor=-1;
       // Soft balls are held (Gold's keeper is kinder); hard wide stops are parried toward the corner, away from the goal mouth.
       if(speed<(p.team===0?19:15)&&!p.saveWide&&b.y<1.8){state.lastPasser=-1;state.lastKicker=-1;p.kick=1;p.strikeKind='save';p.caught=true;state.userPassLive=false;b.owner=p.id;b.lastTeam=p.team;b.lock=.3;b.vx=b.vz=b.vy=0;p.think=.75;emit('save',p.x,p.z,p.team===1?'Keeper holds it. Shoot lower and wider.':'Safe hands! Now build again.');}
       else if(p.saveWide&&speed>25&&Math.abs(b.z)>1.8){release(p,-side*.3,Math.sign(b.z)||1,13,2.6,'save');state.message=p.team===1?'Tipped round the post! Corner to Gold.':'Our keeper tips it wide! Defend the corner.';}
       else{release(p,side,p.saveWide?(Math.sign(b.z-p.z)||1)*.95:-p.z*.12,p.saveWide?24:21,4,'save');if(shotAt)state.message=p.team===1?'Great save! Aim for the corners.':'Our keeper saves! Recover your shape.';}
       break;}
      const passer=state.lastPasser,completed=passer>=0&&passer!==p.id&&players[passer].team===p.team,stolen=passer>=0&&players[passer].team!==p.team;const ranIn=completed&&p.team===0&&p.callRun>0;if(completed){state.passes[p.team]++;state.passChain++;addSpirit(p.team,p.team===0?T2.pass:T2.bluePass);if(ranIn){state.runPasses++;addSpirit(0,T2.run);}}else state.passChain=0;if(stolen)addSpirit(p.team,p.team===0?T2.intercept:T2.blueIntercept);if(completed&&p.team===0&&state.userPassLive)state.userPassesDone++;if(stolen&&p.team===1){state.lostKind='intercept';state.lostAt=state.time;}state.userPassLive=false;p.callRun=0;state.lastPasser=-1;state.interceptor=-1;p.receive=.22;p.receiveHeight=b.y;p.receiveX=b.x-p.x;p.receiveZ=b.z-p.z;b.owner=p.id;b.lastTeam=p.team;b.lock=.32;if(p.team===0){state.selected=p.id;state.holdTime=0;}
      emit(stolen?'intercept':'touch',p.x,p.z,stolen?(p.team===1?'Intercepted! Pass away from the defender\'s lane.':'Interception! Now go forward.'):completed?'Pass received! Look for the next open angle.':'Find space. Keep your next pass moving.');
      if(ranIn)state.message='Great run! You played it into the run you called.';
      if(completed&&p.team===0){
       // The round's habit, measured on the completed pass.
       const free=!players.some(q=>q.team===1&&!q.keeper&&Math.hypot(q.x-p.x,q.z-p.z)<3.2),habit=[free,state.firstTime,Math.abs(p.z-state.passFromZ)>=9,state.quickPass][state.level-1];
       if(habit){state.focus++;state.focusEvent++;state.habitAt=state.time;addSpirit(0,T2.habit);state.message=['Found space! No defender near your receiver.','Beat the press! The one-two got you through.','Switched play! The block can\'t cover both sides.','Early pass! You moved it before the pressure arrived.'][state.level-1];}
       // Directional first touch: a held direction pushes the ball into space.
       const n=Math.hypot(input.x,input.z);if(n>.5&&state.queuedPass<=0){p.vx+=input.x/n*2.6;p.vz+=input.z/n*2.6;p.receiveX+=input.x/n*.35;p.receiveZ+=input.z/n*.35;if(!habit)state.message='Good first touch, into space!';}
      }
      state.firstTime=false;state.quickPass=false;
      if(completed&&p.team===0&&state.queuedShot>0){state.queuedShot=0;const perfect=state.queuedPerfect;state.queuedPerfect=false;if(perfect){state.perfect++;addSpirit(0,T2.perfect);}const headed=p.receiveHeight>1.15;if(headed)p.header=.4;shoot(p,headed?state.queuedShotPower*.6:state.queuedShotPower,input.z,true);if(headed){b.vy=-1.5;b.y=Math.max(.5,b.y);}state.message=headed?'HEADER! Attack the ball and nod it down.':perfect?'PERFECT first-time shot! No time for the keeper to set.':'FIRST-TIME SHOT! Hit it before the defence closes.';}
      else if(completed&&p.team===0&&state.queuedPass>0){state.queuedPass=0;const perfect=state.queuedPerfect;state.queuedPerfect=false;const returnTo=Math.hypot(state.queuedX,state.queuedZ)<.12?passer:-1;pass(p,state.queuedX,state.queuedZ,state.queuedThrough,returnTo,input.sprint);state.firstTime=true;
       // Perfectly timed: a crisper ball that defenders read a beat later.
       if(perfect){state.perfect++;if(state.passChain<4)addSpirit(0,T2.perfect);if(state.passChain<3)state.passAge=-.15;b.vx*=1.1;b.vz*=1.1;}
       state.message=perfect?'PERFECT first touch! The press is a step behind.':returnTo>=0?'ONE-TWO! Follow your pass into space.':'FIRST-TIME PASS! Keep the move flowing.';}break;}}
   }b.spin+=Math.hypot(b.vx,b.vz)*h/.25;
  }
 }
 reset();/** Island Cup: set length and modifiers before reset(). Rounds mode uses the defaults. */
 function configure(o:{duration?:number;mods?:Partial<StrikerMods>}){state.baseDuration=o.duration??STRIKER_SECONDS;Object.assign(state.mods,{rain:false,small:false,golden:false,spirit:false},o.mods??{});state.goalHalf=state.mods.small?STRIKER_SMALL_GOAL_HALF:STRIKER_GOAL_HALF;}
 return{state,step,reset,configure};
}
export type StrikerMatch=ReturnType<typeof createStrikerMatch>;
/** Who won: 0 Gold, 1 Blue, -1 draw. Counts golden goals and penalty shootouts. */
export function strikerWinner(s:{score:number[];shootout:{winner:number}}){return s.score[0]>s.score[1]?0:s.score[1]>s.score[0]?1:s.shootout.winner;}
/** Up to three stars per round, each earned on its own: win, the round habit 3/3, the round challenge. */
export function strikerStars(s:{level:number;score:number[];focus:number;habitGoals:number;firstTimeGoals:number}){
 const win=s.score[0]>s.score[1],habit=s.focus>=STRIKER_FOCUS_GOAL,challenge=[win&&s.score[1]===0,s.firstTimeGoals>0,s.habitGoals>0,s.score[0]-s.score[1]>=2][Math.max(1,Math.min(4,s.level))-1];
 return{win,habit,challenge,count:Number(win)+Number(habit)+Number(challenge)};
}
/** Replay caption: how the goal was built, in a 7v7 kid's words (passes first, then the finish). */
export function strikerGoalStory(g:{chain:number;habit:boolean;firstTime:boolean;teamStrike:boolean;chip:boolean;curled:boolean;setPiece:boolean;clean:boolean},level:number){
 const parts:string[]=[];
 if(g.setPiece)parts.push('Set piece');else if(g.chain>=2)parts.push(`${g.chain} passes`);else if(g.chain===1)parts.push('One pass');else parts.push('Solo run');
 if(g.habit)parts.push(STRIKER_FOCUS[Math.max(1,Math.min(4,level))-1].toLowerCase());
 parts.push(g.teamStrike?'Team Strike':g.chip?'chip over the keeper':g.firstTime?'first-time finish':g.curled?'curled finish':g.clean?'clean strike':'finish');
 return parts.join(' · ');}
/** Context prompt for the action buttons (Oct 9 2026 playtest): what a young player should press right now. "shoot" in
 * the shooting zone, "pass" when a teammate is open and the carrier is pressed or has held the ball a while, "tackle"
 * at the exact moment a Blue carrier's heavy touch leaves the ball off their foot. Pure and allocation-free. */
export type StrikerHint=''|'pass'|'shoot'|'tackle';
export const STRIKER_SHOOT_ZONE=12;
export function strikerHint(s:{finished:boolean;goalPause:number;selected:number;holdTime:number;laneOpen:number[];setPiece:{kind:string};ball:{owner:number;x:number;z:number};players:{id:number;team:0|1;keeper:boolean;x:number;z:number;heavy:number}[]}):StrikerHint{
 if(s.finished||s.goalPause>0||s.setPiece.kind)return '';
 const user=s.players[s.selected],owner=s.ball.owner;
 if(owner===user.id){
  if(user.x>=STRIKER_SHOOT_ZONE&&Math.abs(user.z)<9)return 'shoot';
  let pressed=false,open=false;
  for(const q of s.players){if(q.keeper)continue;if(q.team===1&&Math.hypot(q.x-user.x,q.z-user.z)<3.5)pressed=true;if(q.team===0&&q.id!==user.id&&s.laneOpen[q.id]>.7)open=true;}
  return open&&(pressed||s.holdTime>1.8)?'pass':'';}
 if(owner>=0){const carrier=s.players[owner];if(carrier.team===1&&!carrier.keeper&&carrier.heavy>0&&Math.hypot(s.ball.x-user.x,s.ball.z-user.z)<2.6)return 'tackle';}
 return '';}
