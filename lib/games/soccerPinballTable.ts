import type {PinballBall,PinballState} from './soccerPinball';

/* Futbol Pinball playfield features, themed for the island club:
 *  - kickboards (slingshots) above each flipper: read the rebound;
 *  - a free-kick WALL of three drop targets below the keeper;
 *  - G-O-A-L corner-flag standups on both rails (spell it = goal-line saver);
 *  - three crest-star rollover lanes top-left (lane change, bonus multiplier,
 *    plunger skill shot);
 *  - three training-cone pop bumpers top-right;
 *  - a dribble-gate spinner on the left rail (spins = touches);
 *  - the dugout scoop: holds the ball for a one-line coach tip, starts modes.
 * Pure, allocation-free simulation run inside the 480 Hz substep. Every
 * collider is a capsule thicker than one substep of travel (MAX_SPEED/480 =
 * 3.1px), so nothing can tunnel. The renderer only reads this state. */

export type ContactFn=(b:PinballBall,ax:number,ay:number,bx:number,by:number,rad:number)=>{nx:number;ny:number;cx:number;cy:number}|null;
export type ResolveFn=(b:PinballBall,nx:number,ny:number,svx:number,svy:number,e:number,mu:number)=>number;
export type TableHelpers={contact:ContactFn;resolve:ResolveFn};

// ---- layout (table px; y grows toward the flippers) ------------------------
export const CREST_POSTS=[46,72] as const, CREST_TOP=62, CREST_BOT=98, CREST_LINE=88, CREST_RIGHT=100;
export const CREST_LANES=[33,59,86] as const;
export const WALL_Y=132, WALL_X=[158,180,202] as const, WALL_HALF=8, WALL_RAD=4;
export const FLAGS=[{x:24,y:300},{x:24,y:345},{x:335,y:300},{x:335,y:345}] as const, FLAG_HALF=8, FLAG_RAD=3, FLAG_LETTERS='GOAL';
/** Kickboards: a = top, b = bottom of the back edge, c = bottom-inner corner.
 * The a→c face kicks; the back and bottom edges are dead walls. Both leave a
 * 17px channel against the rail (the right one keeps the soft-entry drop). */
export const SLINGS=[{ax:40,ay:392,bx:40,by:436,cx:74,cy:470},{ax:318,ay:392,bx:318,by:436,cx:284,cy:470}] as const, SLING_RAD=3;
/* Cone triangle chosen by sim (launchdrain.mjs): it sends launch rebounds
 * back up-table or out to the right rail instead of straight down the middle. */
export const CONES=[{x:276,y:94},{x:320,y:94},{x:298,y:130}] as const, CONE_R=10;
export const SPINNER={x0:20,x1:52,y:210} as const;
export const DUGOUT={x:306,y:262,r:9} as const;
export const SAVER={x:180,y:576,half:28} as const;
export const TRAINING_GOAL=12;
export const PINBALL_MODES=[
 {id:'freekick',name:'FREE KICK',goal:'Knock down the whole wall',time:30,need:1},
 {id:'onetwo',name:'ONE–TWO',goal:'Kickboard, then hit a target',time:30,need:3},
 {id:'counter',name:'COUNTER ATTACK',goal:'Block 3 counter shots',time:35,need:3},
] as const;
export const CUP_FINAL_TIME=45;
export const COACH_TIPS=[
 'Coach: read the rebound. The ball leaves a board at the same angle it hits.',
 'Coach: time your block. Strike as the ball reaches your flipper.',
 'Coach: aim beside the posts. The keeper cannot reach the corners.',
 'Coach: switch feet. Build with one flipper, finish with the other.',
 'Coach: use the width. Hit the corner flags to stretch the defence.',
] as const;

export type PinballMode='none'|'freekick'|'onetwo'|'counter'|'final';
export type PinballTable={
 crest:number;bonusX:number;saverUsed:boolean;skillBand:number;skillOpen:number;laneCool:[number,number,number];laneFlash:[number,number,number];
 wall:[number,number,number];wallLit:number;wallReset:number;
 flags:number;saver:boolean;
 slingCool:[number,number];slingFlash:[number,number];
 coneCool:[number,number,number];coneFlash:[number,number,number];
 spinAngle:number;spinOmega:number;spinTouches:number;spinCount:number;
 training:number;dugoutLit:boolean;hold:number;holdTip:number;ejectCool:number;
 mode:PinballMode;modeTime:number;modeProgress:number;modesDone:number;nextMode:number;oneTwo:number;finalPlayed:boolean;
 ballBonus:number;lastBonus:number;lastBonusX:number;
 ballClock:number;quickDrains:number;assist:boolean;
 blocks:number;stars:[number,number,number,number];
 prevLeft:boolean;prevRight:boolean;
 sfx:{sling:number;drop:number;wallDown:number;wallUp:number;flag:number;word:number;lane:number;crest:number;skill:number;cone:number;spin:number;dugout:number;mode:number;modeDone:number;modeEnd:number;block:number;saver:number;final:number};
};
export function createPinballTable():PinballTable{return{
 crest:0,bonusX:1,saverUsed:false,skillBand:5,skillOpen:0,laneCool:[0,0,0],laneFlash:[0,0,0],
 wall:[1,1,1],wallLit:0,wallReset:-1,flags:0,saver:false,
 slingCool:[0,0],slingFlash:[0,0],coneCool:[0,0,0],coneFlash:[0,0,0],
 spinAngle:0,spinOmega:0,spinTouches:0,spinCount:0,
 training:0,dugoutLit:false,hold:0,holdTip:0,ejectCool:0,
 mode:'none',modeTime:0,modeProgress:0,modesDone:0,nextMode:0,oneTwo:0,finalPlayed:false,
 ballBonus:0,lastBonus:0,lastBonusX:1,ballClock:0,quickDrains:0,assist:false,
 blocks:0,stars:[0,0,0,0],prevLeft:false,prevRight:false,
 sfx:{sling:0,drop:0,wallDown:0,wallUp:0,flag:0,word:0,lane:0,crest:0,skill:0,cone:0,spin:0,dugout:0,mode:0,modeDone:0,modeEnd:0,block:0,saver:0,final:0}};}

/** Seconds the goal stays lit after the wall falls, and the pause before the
 * wall re-forms; both tighten gently by division. */
export const wallLitTime=(level:number)=>[10,9,8,7][Math.max(0,Math.min(3,level-1))];
export const wallResetDelay=(level:number)=>[3,2.5,2,1.6][Math.max(0,Math.min(3,level-1))];
export const pinballModeInfo=(t:PinballTable)=>t.mode==='none'||t.mode==='final'?null:PINBALL_MODES.find(m=>m.id===t.mode)!;
export const flagWord=(flags:number)=>FLAG_LETTERS.split('').map((c,i)=>flags&1<<i?c:'_').join(' ');
export const starCount=(bits:number)=>(bits&1)+(bits>>1&1)+(bits>>2&1);
export const pinballStarTotal=(stars:readonly number[])=>stars.reduce((n,b)=>n+starCount(b),0);

function award(s:PinballState,x:number,y:number,points:number,cue:PinballState['cue'],cueTime=1.4){
 s.score+=points;s.table.ballBonus+=Math.round(points*.5);s.flash=Math.max(s.flash,.6);s.hitX=x;s.hitY=y;s.hitId++;s.cue=cue;s.cueTime=cueTime;
}
function addTraining(s:PinballState,n:number){const t=s.table;if(t.dugoutLit||t.mode!=='none')return;t.training=Math.min(TRAINING_GOAL,t.training+n);if(t.training>=TRAINING_GOAL)t.dugoutLit=true;}
/** One-Two: a kickboard opens a 4s window; the next target hit completes a pass. */
function oneTwoTarget(s:PinballState,x:number,y:number){const t=s.table;if(t.mode!=='onetwo'||t.oneTwo<=0)return;t.oneTwo=0;t.modeProgress++;award(s,x,y,300,'onetwo',1.6);if(t.modeProgress>=PINBALL_MODES[1].need)completeMode(s);}
function completeMode(s:PinballState){
 const t=s.table,i=PINBALL_MODES.findIndex(m=>m.id===t.mode);if(i<0)return;
 t.modesDone|=1<<i;t.mode='none';t.modeTime=0;t.modeProgress=0;t.oneTwo=0;t.nextMode=(i+1)%3;t.training=0;
 t.stars[s.level-1]|=4;s.score+=1500;t.ballBonus+=500;s.hitId++;s.hitX=180;s.hitY=300;s.cue='modeDone';s.cueTime=2.2;t.sfx.modeDone++;
 if(t.modesDone===7&&!t.finalPlayed)startFinal(s);
}
function startMode(s:PinballState){
 const t=s.table;let i=t.nextMode;for(let k=0;k<3&&t.modesDone&1<<i;k++)i=(i+1)%3;
 const m=PINBALL_MODES[i];t.mode=m.id;t.modeTime=m.time;t.modeProgress=0;t.oneTwo=0;t.dugoutLit=false;t.training=0;
 if(m.id==='freekick'){t.wallLit=0;t.wallReset=0;}
 // Pinball FX convention: a mode never starts with a cheap drain.
 s.openingRescue=true;s.launchGrace=Math.max(s.launchGrace,3);
 t.sfx.mode++;s.hitId++;s.hitX=180;s.hitY=300;s.cue='mode';s.cueTime=2.6;
}
function startFinal(s:PinballState){const t=s.table;t.mode='final';t.modeTime=CUP_FINAL_TIME;t.modeProgress=0;t.dugoutLit=false;t.sfx.final++;s.moveTime=Math.max(s.moveTime,4);s.openingRescue=true;s.launchGrace=Math.max(s.launchGrace,3);s.hitId++;s.hitX=180;s.hitY=300;s.cue='final';s.cueTime=3;}

/** Skill shot: one rung of the 7-lamp launch ladder is marked; letting go
 * with exactly that rung lit is a PERFECT FIRST TOUCH (a 1/7 power window).
 * The tap launch's rung (4) is never the target, so it always takes a hold. */
export const SKILL_BANDS=[5,2,6,3] as const;
export const ladderRung=(pull:number)=>Math.max(0,Math.ceil(pull*7)-1);
/** New ball off the plunger: judge the skill shot, move the marker on, apply assist once. */
export function tableLaunch(s:PinballState,pull:number){
 const t=s.table;t.hold=0;t.ejectCool=0;t.skillOpen=0;
 if(ladderRung(pull)===t.skillBand){t.sfx.skill++;award(s,354,560-t.skillBand*15,500,'skill',2.2);}
 t.skillBand=SKILL_BANDS[(SKILL_BANDS.indexOf(t.skillBand as 5)+1)%SKILL_BANDS.length];
 if(t.assist){t.assist=false;s.openingRescue=true;s.launchGrace=Math.max(s.launchGrace,6);t.saver=true;}
}
/** Real flipper strike. A strike that returns a defender's counter shot is a
 * GREAT BLOCK: points, a fast break (lit goal) and the goal-line saver. */
export function tableStrike(s:PinballState,wasCounter:boolean){
 const t=s.table;t.skillOpen=0;
 if(!wasCounter)return false;
 t.blocks++;t.stars[s.level-1]|=4;t.sfx.block++;
 s.moveTime=Math.max(s.moveTime,6);
 award(s,s.ball.x,s.ball.y,250,'greatBlock',2);
 if(t.mode==='counter'){t.modeProgress++;if(t.modeProgress>=PINBALL_MODES[2].need)completeMode(s);}
 return true;
}
/** Goal scored: returns extra points; handles Free Kick and the Cup Final. */
export function tableGoal(s:PinballState,lit:boolean){
 const t=s.table;let extra=0;t.quickDrains=0;
 if(t.mode==='final'){extra+=s.lastGoalPoints;t.modeProgress++;}
 if(s.level===1&&lit)t.stars[0]|=2;
 // The wall re-forms for the next ball.
 t.wallLit=0;t.wallReset=0;
 t.ballBonus+=100;
 return extra;
}
/** Division ladder: the division just left earns its "two goals" star. */
/** Two goals in the last division: its star, then the Cup Final (once per run). */
export function tableDivisionCleared(s:PinballState){const t=s.table;t.stars[3]|=1;if(!t.finalPlayed&&t.mode!=='final')startFinal(s);}
export function tableLevelUp(s:PinballState,from:number){s.table.stars[from-1]|=1;}
export function tableChallenge(s:PinballState){s.table.stars[s.level-1]|=2;}
/** A real drain: pays the end-of-ball bonus x crest multiplier, tracks quick
 * drains for the quiet assist, and resets the per-ball lamps. */
export function tableDrain(s:PinballState){
 const t=s.table,bonus=t.ballBonus*t.bonusX;s.score+=bonus;t.lastBonus=bonus;t.lastBonusX=t.bonusX;
 t.quickDrains=t.ballClock<8?t.quickDrains+1:0;if(t.quickDrains>=2){t.assist=true;t.quickDrains=0;}
 t.ballBonus=0;t.bonusX=1;t.crest=0;t.ballClock=0;t.saver=false;t.saverUsed=false;t.oneTwo=0;
 return bonus;
}
/** Cup Final: no ball can be lost while it runs. */
export const tableProtects=(s:PinballState)=>s.table.mode==='final';

function rotate(m:number,dir:number){return dir<0?(m>>1|(m&1)<<2)&7:((m<<1)&7)|m>>2;}

/** Per-substep timers and lane change; call while playing. */
export function tableTimers(s:PinballState,dt:number,left:boolean,right:boolean){
 const t=s.table;
 if(left&&!t.prevLeft)t.crest=rotate(t.crest,-1);if(right&&!t.prevRight)t.crest=rotate(t.crest,1);t.prevLeft=left;t.prevRight=right;
 if(s.ball.x<341){t.ballClock+=dt;t.skillOpen=Math.max(0,t.skillOpen-dt);}
 for(let i=0;i<3;i++){t.laneCool[i]=Math.max(0,t.laneCool[i]-dt);t.laneFlash[i]=Math.max(0,t.laneFlash[i]-dt*2);t.coneCool[i]=Math.max(0,t.coneCool[i]-dt);t.coneFlash[i]=Math.max(0,t.coneFlash[i]-dt*4);}
 for(let i=0;i<2;i++){t.slingCool[i]=Math.max(0,t.slingCool[i]-dt);t.slingFlash[i]=Math.max(0,t.slingFlash[i]-dt*5);}
 t.ejectCool=Math.max(0,t.ejectCool-dt);t.oneTwo=Math.max(0,t.oneTwo-dt);
 // Spinner: free-wheels down; every half turn is one touch.
 if(t.spinOmega!==0){
  const before=Math.floor(t.spinAngle/Math.PI);t.spinAngle+=t.spinOmega*dt;t.spinOmega*=Math.exp(-dt*1.6);if(Math.abs(t.spinOmega)<.4)t.spinOmega=0;
  if(Math.floor(t.spinAngle/Math.PI)!==before){t.spinTouches++;t.spinCount++;s.score+=5;t.ballBonus+=5;if(t.spinTouches%6===0)addTraining(s,1);t.sfx.spin++;}
 }
 if(t.wallLit>0){t.wallLit=Math.max(0,t.wallLit-dt);if(t.wallLit===0&&t.wallReset<0)t.wallReset=wallResetDelay(s.level);}
 if(t.wallReset>0)t.wallReset=Math.max(0,t.wallReset-dt);
 if(t.wallReset===0&&(t.wall[0]+t.wall[1]+t.wall[2])<3){
  // Re-form only when the ball is clear of the line, so it can never trap it.
  const b=s.ball;if(Math.abs(b.y-WALL_Y)>WALL_RAD+b.r+3||b.x<WALL_X[0]-WALL_HALF-WALL_RAD-b.r-3||b.x>WALL_X[2]+WALL_HALF+WALL_RAD+b.r+3){t.wall[0]=t.wall[1]=t.wall[2]=1;t.wallReset=-1;t.sfx.wallUp++;}
 }else if(t.wallReset===0)t.wallReset=-1;
 if(t.mode!=='none'){
  t.modeTime=Math.max(0,t.modeTime-dt);
  if(t.modeTime===0){
   if(t.mode==='final'){t.finalPlayed=true;t.modesDone=0;s.score+=2000;s.hitId++;s.hitX=180;s.hitY=300;s.cue='finalEnd';s.cueTime=3;}
   else{const i=PINBALL_MODES.findIndex(m=>m.id===t.mode);t.nextMode=(i+1)%3;t.training=TRAINING_GOAL/2;s.cue='modeEnd';s.cueTime=2;}
   t.mode='none';t.modeProgress=0;t.sfx.modeEnd++;
  }
 }
}

/** Dugout hold: returns true while the ball is held (the caller skips flight). */
export function tableHold(s:PinballState,dt:number){
 const t=s.table;if(t.hold<=0)return false;
 const b=s.ball;t.hold=Math.max(0,t.hold-dt);b.x=DUGOUT.x;b.y=DUGOUT.y;b.vx=b.vy=b.omega=0;
 if(t.hold===0){
  // A gentle, fixed eject: it drops past the slingshot onto the right inlane,
  // so the next touch is always a readable right-foot strike.
  b.x=DUGOUT.x-6;b.y=DUGOUT.y+11;b.vx=-38;b.vy=45;t.ejectCool=.6;
 }
 return true;
}

/** All static and active feature contacts for one substep. prevY is the ball's
 * y before this substep's move (for the rollover and spinner triggers). */
export function tableContacts(s:PinballState,H:TableHelpers,prevY:number){
 const t=s.table,b=s.ball;let touched=false;
 // Crest lanes: two guide posts plus rollover switches across CREST_LINE.
 if(b.y<CREST_BOT+b.r+4&&b.x<CREST_RIGHT+b.r){
  for(const x of CREST_POSTS){const c=H.contact(b,x,CREST_TOP,x,CREST_BOT,3);if(c){H.resolve(b,c.nx,c.ny,0,0,.55,.12);touched=true;}}
 }
 if(b.x<CREST_RIGHT&&(prevY<CREST_LINE)!==(b.y<CREST_LINE)){
  const i=b.x<CREST_POSTS[0]?0:b.x<CREST_POSTS[1]?1:2;
  if(t.laneCool[i]===0){
   t.laneCool[i]=.3;t.laneFlash[i]=1;t.sfx.lane++;
   if(!(t.crest&1<<i)){t.crest|=1<<i;if(s.cue!=='skill')award(s,CREST_LANES[i],CREST_LINE,30,'lane',1.2);else s.score+=30;}
   else s.score+=10;
   if(t.crest===7){t.crest=0;t.bonusX=Math.min(5,t.bonusX+1);t.sfx.crest++;award(s,CREST_LANES[1],CREST_LINE,250,'crest',2);}
  }
 }
 // Free-kick wall: three drop targets. A real hit knocks a player down.
 if(Math.abs(b.y-WALL_Y)<WALL_RAD+b.r+2&&b.x>WALL_X[0]-WALL_HALF-WALL_RAD-b.r&&b.x<WALL_X[2]+WALL_HALF+WALL_RAD+b.r){
  for(let i=0;i<3;i++){if(!t.wall[i])continue;const x=WALL_X[i],c=H.contact(b,x-WALL_HALF,WALL_Y,x+WALL_HALF,WALL_Y,WALL_RAD);if(!c)continue;touched=true;
   const a=H.resolve(b,c.nx,c.ny,0,0,.5,.15);
   if(a>50){t.wall[i]=0;t.sfx.drop++;addTraining(s,2);oneTwoTarget(s,x,WALL_Y);
    if(t.wall[0]+t.wall[1]+t.wall[2]===0){t.wallLit=wallLitTime(s.level);t.wallReset=-1;s.moveTime=Math.max(s.moveTime,t.wallLit);t.sfx.wallDown++;award(s,180,WALL_Y,300,'wallDown',2.4);if(t.mode==='freekick')completeMode(s);}
    else award(s,x,WALL_Y,30,'drop',1.4);
   }
  }
 }
 // G-O-A-L corner flags on the rails.
 if(b.x<40||b.x>320){
  for(let i=0;i<4;i++){const f=FLAGS[i];if(Math.abs(b.y-f.y)>FLAG_HALF+FLAG_RAD+b.r)continue;const c=H.contact(b,f.x,f.y-FLAG_HALF,f.x,f.y+FLAG_HALF,FLAG_RAD);if(!c)continue;touched=true;
   const a=H.resolve(b,c.nx,c.ny,0,0,.75,.12);
   if(a>40){
    if(a>180)s.banked=true;
    t.sfx.flag++;addTraining(s,2);oneTwoTarget(s,f.x,f.y);
    if(!(t.flags&1<<i)){t.flags|=1<<i;
     if(t.flags===15){t.flags=0;t.sfx.word++;if(!t.saverUsed&&!t.saver){t.saver=true;award(s,180,f.y,400,'goalWord',2.4);}else award(s,180,f.y,400,'goalWordPts',2);}
     else award(s,f.x,f.y,50,'flag',1.6);
    }else s.score+=10;
   }
  }
 }
 // Kickboards: kick face plus dead back/bottom edges.
 if(b.y>380&&b.y<485&&(b.x<90||b.x>270)){
  for(let i=0;i<2;i++){const k=SLINGS[i];
   let c=H.contact(b,k.ax,k.ay,k.cx,k.cy,SLING_RAD);
   if(c){touched=true;const a=H.resolve(b,c.nx,c.ny,0,0,.55,.15);
    if(a>60&&t.slingCool[i]===0){t.slingCool[i]=.14;t.slingFlash[i]=1;b.vx+=c.nx*300;b.vy+=c.ny*300-120;/* a little lift: the kick goes across AND up, never flat into the centre gap */t.sfx.sling++;s.score+=10;t.ballBonus+=5;
     if(t.mode==='onetwo')t.oneTwo=4;if(s.cueTime<.6||s.cue==='sling'){s.cue='sling';s.cueTime=1.2;}}
    continue;}
   c=H.contact(b,k.ax,k.ay,k.bx,k.by,SLING_RAD)??H.contact(b,k.bx,k.by,k.cx,k.cy,SLING_RAD);
   if(c){touched=true;H.resolve(b,c.nx,c.ny,0,0,.45,.18);}
  }
 }
 // Training cones: active pop bumpers.
 if(b.y<160&&b.x>260){
  for(let i=0;i<3;i++){const k=CONES[i],c=H.contact(b,k.x,k.y,k.x,k.y,CONE_R);if(!c)continue;touched=true;
   const a=H.resolve(b,c.nx,c.ny,0,0,.6,.1);
   if(a>15&&t.coneCool[i]===0){t.coneCool[i]=.09;t.coneFlash[i]=1;b.vx+=c.nx*260;b.vy+=c.ny*260;t.sfx.cone++;addTraining(s,1);oneTwoTarget(s,k.x,k.y);award(s,k.x,k.y,10,'cone',1.2);}
  }
 }
 // Dribble gate: a crossing trigger; spin follows the ball's speed through it.
 if(b.x-b.r<SPINNER.x1&&(prevY<SPINNER.y)!==(b.y<SPINNER.y)){
  const w=Math.min(60,Math.abs(b.vy)*.06)*(b.vy<0?1:-1);if(Math.abs(w)>Math.abs(t.spinOmega))t.spinOmega=w;b.vy*=.97;
  if(Math.abs(w)>6&&(s.cueTime<.6||s.cue==='spin')){s.cue='spin';s.cueTime=1.2;}
 }
 // Dugout scoop: a soft ball drops in; a fast one rattles over the lip.
 if(t.hold===0&&t.ejectCool===0){const dx=b.x-DUGOUT.x,dy=b.y-DUGOUT.y;
  if(dx*dx+dy*dy<DUGOUT.r*DUGOUT.r&&b.vx*b.vx+b.vy*b.vy<650*650&&s.possession<0){
   t.hold=1.1;t.sfx.dugout++;b.vx=b.vy=b.omega=0;t.holdTip=(t.holdTip+1)%COACH_TIPS.length;
   oneTwoTarget(s,DUGOUT.x,DUGOUT.y);
   if(t.dugoutLit&&t.mode==='none')startMode(s);else if(s.cue!=='onetwo'&&s.cue!=='modeDone')award(s,DUGOUT.x,DUGOUT.y,100,'dugout',2.2);else s.score+=100;
  }
 }
 // Goal-line saver: one clearance of a centre drain, then it drops.
 if(t.saver&&b.vy>0&&b.y>SAVER.y-10&&b.y<SAVER.y+14&&Math.abs(b.x-SAVER.x)<SAVER.half){
  t.saver=false;t.saverUsed=true;t.sfx.saver++;b.vy=-640;b.vx=(b.x-SAVER.x)*5+(b.x<SAVER.x?-40:40);award(s,SAVER.x,SAVER.y,0,'clear',2.2);
 }
 return touched;
}
/** Counter Attack mode makes defenders win the ball more easily and shoot. */
export const tableCounterMode=(s:PinballState)=>s.table.mode==='counter';

// ---- local mastery stars (kid-safe: no streaks, never lost) -----------------
const STAR_KEY='fi2-pinball-stars-v1';
export function loadPinballStars():[number,number,number,number]{
 try{const raw=JSON.parse(localStorage.getItem(STAR_KEY)||'null');if(Array.isArray(raw)&&raw.length===4)return raw.map(v=>Number(v)&7) as [number,number,number,number];}catch{}
 return[0,0,0,0];
}
export function savePinballStars(run:readonly number[]){
 const best=loadPinballStars();let changed=false;for(let i=0;i<4;i++){const merged=best[i]|(run[i]&7);if(merged!==best[i]){best[i]=merged;changed=true;}}
 if(changed)try{localStorage.setItem(STAR_KEY,JSON.stringify(best));}catch{}
 return best;
}
