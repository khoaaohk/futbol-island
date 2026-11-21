/**
 * Safe Hands core (Nov 21 2026, docs/arcade-aaa/safehands-direction.md): you are the goalkeeper. Pure rules, seeded, fixed 1/120 s steps,
 * no DOM (tests/safehands-core.cjs and tests/safehands-bots.cjs run it in node). Drawing: view.ts. Shell: components/games/SafeHandsGame.tsx.
 *
 * One attack: SET your position (left-right along the line, and off the line to narrow the angle) -> the striker's RUN-UP shows real
 * tells (approach, a glance, hips, the planted foot, the lean, the wind-up) -> ONE action (dive low / high to a side, tip over, dive at
 * feet, or stay and catch) -> the ball is saved where the keeper's reach covers it when it arrives. Reach grows with the time since
 * the action, so an early correct read reaches the corner and a late one does not.
 * Units: metres and seconds. x: + is the keeper's right (screen right, seen from behind the goal). z: distance out from the goal line.
 * Honest tells (always true): the planted foot (side) and the lean (height). The glance follows each striker's habit (some look away).
 * Teaches (AGENTS.md): set position, narrow the angle, stay big, read the striker's body, catch vs parry vs punch, command your
 * area on crosses, the wall.
 */
export const SH={
 step:1/120,goalHalf:3.66,goalH:2.44,lives:3,shotsPerTier:6,dailyShots:5,
 /** keeper movement while setting (m/s) */moveX:4.2,moveD:5,
 /** reach: half body width, extra reach per second of dive, the most a dive adds, push-off time */body:.75,reachV:6.5,reachMax:2.6,push:.08,
 /** the last part of the reach is a fingertip save (m) */tip:.35,
 /** stay-and-catch holds shots up to this power (dry / wet ball) */hold:.72,holdWet:.5,
 /** a distance shot chips a keeper further out than this; a 1v1 striker rounds a keeper closer than this (m) */chipDepth:3.6,roundDist:4,
 /** the dive at feet reaches a loose ball this far from the keeper (m) */smother:7,
 resSecs:1.3,goalSecs:1.7,
 medals:[2500,6000,11000] as readonly number[],scoreMax:60_000,
} as const;
export const MEDAL_NAMES=['Bronze','Silver','Gold'] as const;
export const medalFor=(score:number)=>{let m=0;for(const v of SH.medals)if(score>=v)m++;return m;};

export type Kind='pen'|'one'|'far'|'free'|'cross'|'head'|'reb';
/** L / R = dive low, LH / RH = dive high, up = tip over or punch, down = dive at the striker's feet. No action = stay and catch. */
export type Act='L'|'R'|'LH'|'RH'|'up'|'down';
export type Phase='tip'|'wall'|'set'|'run'|'fly'|'cross'|'res'|'over';
export type Decision='claim'|'punch'|'stay';
export const KIND_NAME:Record<Kind,string>={pen:'Penalty',one:'One on one',far:'Long shot',free:'Free kick',cross:'Cross',head:'Header',reb:'Rebound'};

/** The career ladder. plant = how long before the kick the planted foot shows (the tell window); aid 2 = angle cone + tell labels,
 *  1 = cone only, 0 = nothing. Each tier adds a kind of shot. */
export type Tier={id:string;name:string;venue:number;plant:number;speed:number;aid:number;deflect:number;wet:boolean;tricks:number;kinds:readonly Kind[];pool:readonly number[];lesson:string;tip:string};
export const TIERS:readonly Tier[]=[
 {id:'sunday',name:'Sunday league',venue:0,plant:.8,speed:.85,aid:2,deflect:0,wet:false,tricks:0,kinds:['pen','one','pen','one','pen','one'],pool:[0,4,6,7],
  lesson:'Set your position',tip:'Stand between the ball and the middle of your goal. Then watch the foot she plants next to the ball: it points where the shot will go.'},
 {id:'academy',name:'Academy',venue:1,plant:.62,speed:1,aid:1,deflect:0,wet:false,tricks:1,kinds:['pen','one','far','pen','far','one'],pool:[0,4,6,7,1,2],
  lesson:'Narrow the angle',tip:'On a long shot, step off your line. The goal gets smaller for the striker. Not too far, or the ball is chipped over you.'},
 {id:'first',name:'First team',venue:2,plant:.5,speed:1.1,aid:0,deflect:.35,wet:false,tricks:2,kinds:['pen','one','far','free','cross','free'],pool:[0,4,6,7,1,2,3,5,8],
  lesson:'The wall and the cross',tip:'Free kick: the wall guards one side, you guard the other. Cross: catch it if you are free, punch it in a crowd, stay if it is too far.'},
 {id:'cup',name:'Cup final',venue:3,plant:.4,speed:1.2,aid:0,deflect:.45,wet:true,tricks:2,kinds:['one','far','free','cross','pen','pen'],pool:[0,4,6,7,1,2,3,5,8,9],
  lesson:'Wet ball day',tip:'It is raining. A wet ball is hard to hold. Push hard shots wide and only catch the soft ones. Wait for the planted foot.'},
];
/** The Daily Shootout plays with First team settings. */
export const DAILY_TIER=2;

/** Named strikers with habits a keeper can learn (the scouting cards fill in as the habits are seen). Sides are the KEEPER's view.
 *  glance 1 = looks where the shot goes, -1 = looks away from it, 0 = eyes on the ball. fav = after a LONG run-up the shot goes there.
 *  habits: [glance, favourite, power, trick] in card words (trick '' = none). */
export type Striker={id:string;name:string;nick:string;num:number;kit:string;skin:string;top:number;glance:-1|0|1;fav:{side:-1|1;high:boolean}|null;power:number;stutter:boolean;watcher:boolean;habits:readonly [string,string,string,string]};
export const STRIKERS:readonly Striker[]=[
 {id:'rosa',name:'Rosa Vega',nick:'Rocket',num:9,kit:'#f0452e',skin:'#c98a5e',top:4,glance:1,fav:{side:-1,high:false},power:.8,stutter:false,watcher:false,
  habits:['Looks where she shoots.','After a long run-up: low to your left.','Hits it hard. Push it wide.','']},
 {id:'nia',name:'Nia Okoro',nick:'No-Look',num:10,kit:'#19b5a5',skin:'#8a5a3c',top:2,glance:-1,fav:null,power:.5,stutter:false,watcher:false,
  habits:['Looks AWAY from where she shoots.','No favourite corner.','Soft, placed shots. You can catch them.','']},
 {id:'tomas',name:'Tomas Lind',nick:'Stutter',num:7,kit:'#ffc83a',skin:'#f2c9a0',top:1,glance:0,fav:{side:1,high:false},power:.6,stutter:true,watcher:false,
  habits:['Keeps his eyes on the ball.','After a long run-up: low to your right.','Medium power.','Stops in his run-up, then shoots late.']},
 {id:'mei',name:'Mei Tan',nick:'Cool',num:11,kit:'#8f78b8',skin:'#f2b98a',top:4,glance:1,fav:null,power:.5,stutter:false,watcher:true,
  habits:['Looks where she shoots.','No favourite corner.','Soft, placed shots.','Waits for you to move first. Stay still until her foot is planted.']},
 {id:'bruno',name:'Bruno Costa',nick:'Big Boot',num:4,kit:'#ff8a3c',skin:'#e0a070',top:0,glance:1,fav:{side:1,high:true},power:.9,stutter:false,watcher:false,
  habits:['Looks where he shoots.','After a long run-up: high to your right.','The hardest shot of all. Never try to catch it.','']},
 {id:'ada',name:'Ada Reyes',nick:'Ice',num:8,kit:'#4a9fe0',skin:'#b87a52',top:3,glance:-1,fav:null,power:.65,stutter:false,watcher:true,
  habits:['Looks AWAY from where she shoots.','No favourite corner.','Medium power.','Waits for you to move first.']},
 {id:'kofi',name:'Kofi Mensah',nick:'Corner',num:14,kit:'#fff3d6',skin:'#6e4630',top:2,glance:0,fav:{side:1,high:false},power:.6,stutter:false,watcher:false,
  habits:['Keeps his eyes on the ball.','After a long run-up: low to your right.','Medium power.','']},
 {id:'lena',name:'Lena Novak',nick:'Lefty',num:3,kit:'#ffd24a',skin:'#f2c9a0',top:4,glance:1,fav:{side:-1,high:true},power:.7,stutter:false,watcher:false,
  habits:['Looks where she shoots.','After a long run-up: high to your left.','Quite hard.','']},
 {id:'sami',name:'Sami Haddad',nick:'Shimmy',num:17,kit:'#f0452e',skin:'#e0a070',top:1,glance:-1,fav:{side:-1,high:false},power:.6,stutter:true,watcher:false,
  habits:['Looks AWAY from where he shoots.','After a long run-up: low to your left.','Medium power.','Stops in his run-up, then shoots late.']},
 {id:'juno',name:'Juno Park',nick:'Captain',num:6,kit:'#231a2e',skin:'#c98a5e',top:5,glance:0,fav:{side:-1,high:true},power:.85,stutter:true,watcher:true,
  habits:['Keeps her eyes on the ball.','After a long run-up: high to your left.','Hits it hard.','Stops in her run-up AND waits for you to move.']},
];

/** Glove pairs earned by feats (the start screen's shelf). The id list is the hook for a future cross-arcade card system. */
export const SH_FEATS=[
 {id:'first-save',name:'Starter gloves',how:'Make your first save.',color:'#ffc83a'},
 {id:'low-left-3',name:'Low Lefts',how:'Save three low shots to your left without letting a goal in.',color:'#19b5a5'},
 {id:'clean-sheet',name:'Clean Sheets',how:'Finish a round without letting a goal in.',color:'#fff3d6'},
 {id:'faked-pen',name:'Cool Heads',how:'Save a penalty when the taker tries a trick.',color:'#8f78b8'},
 {id:'fingertip',name:'Fingertips',how:'Make a fingertip save.',color:'#f0452e'},
 {id:'safe-hands',name:'Safe Hands',how:'Catch and hold five shots in one run.',color:'#ff8a3c'},
 {id:'early-read',name:'Mind Readers',how:'Read the striker and dive early five times in one run.',color:'#4a9fe0'},
 {id:'wall',name:'Wall Builders',how:'Save a free kick behind the right wall.',color:'#d98a4a'},
 {id:'area',name:'Box Bosses',how:'Make the right call on two crosses in one run.',color:'#19b5a5'},
 {id:'smother',name:'Brave Hearts',how:'Dive on the ball at a striker’s feet.',color:'#f0452e'},
 {id:'daily-5',name:'Shootout Heroes',how:'Save all five in a Daily Shootout.',color:'#ffd24a'},
 {id:'cup',name:'Golden Gloves',how:'Win the Cup final.',color:'#ffc83a'},
] as const;
export type FeatId=typeof SH_FEATS[number]['id'];
export const SH_FEAT_IDS:readonly FeatId[]=SH_FEATS.map(f=>f.id);

export type Shot={kind:Kind;striker:number;bx:number;bz:number;tx:number;ty:number;side:-1|0|1;high:boolean;power:number;speed:number;long:boolean;flight:number;
 setSecs:number;runSecs:number;plant:number;/** a pause in the run-up (s, 0 = none) */stutter:number;watch:boolean;switched:boolean;glance:-1|0|1;approach:-1|0|1;
 arc:number;defl:{at:number;dx:number;k:number;done:boolean}|null;wet:boolean;dmax:number;xmax:number;chip:boolean;
 /** 1v1: where the dribble starts, close control or a heavy touch, when the heavy touch starts (s into the set phase) */fromZ:number;tight:boolean;touchAt:number;
 /** free kick: the wall's side, the right number of beans, the wall picked, the shot goes over the wall */near:-1|1;wallBest:number;wallN:number;over:boolean;
 /** cross: landing spot, a crowd under it, lands inside your six-yard area, time in the air */cx:number;cz:number;crowd:boolean;closeIn:boolean;crossSecs:number;
 /** a trick was tried on this shot (stutter, a lying glance, waiting for the keeper) */fake:boolean};
export type SaveKind='held'|'parry'|'fingertip'|'tip'|'block'|'smother'|'claim'|'punch';
export type GoalWhy='froze'|'wrongway'|'height'|'late'|'position'|'wrongmove'|'chipped'|'rounded'|'stranded'|'early';
export type Result={saved:boolean;kind:SaveKind|'spill'|'goal';why:GoalWhy|'';points:number;x:number;y:number;early:boolean;posOk:boolean;right:boolean};
export type ShStats={shots:number;saves:number;goals:number;held:number;parries:number;fingertips:number;early:number;posOk:number;bestStreak:number;lowLeftRow:number;smothers:number;claims:number;punches:number;crossRight:number;wallRight:number;rebounds:number;tiersClean:number;lastWhy:GoalWhy|'';lastKind:Kind|''};
export type ShEvent={type:'tier'|'attack'|'whistle'|'touch'|'strike'|'commit'|'switch'|'deflect'|'cross'|'save'|'spill'|'goal'|'life'|'clear'|'feat'|'scout'|'wall'|'over';a:number;b:number;word:string;points:number};
/** What the keeper can see right now. plant / lean / wind are null until the foot is planted; hidden = an oversized wall blocks the view. */
export type Tells={approach:-1|0|1;glance:-1|0|1;hips:-1|0|1|null;plant:{side:-1|0|1;high:boolean;power:number}|null;hidden:boolean;paused:boolean};
export type ShState={t:number;phase:Phase;pt:number;daily:boolean;tier:number;shotN:number;lives:number;score:number;streak:number;over:boolean;won:boolean;
 kx:number;kd:number;wantX:number;wantD:number;shot:Shot|null;act:{a:Act;t:number}|null;decision:Decision|'';res:Result|null;strikeT:number;
 dailySaves:number;dailyLog:number[];tierGoals:number;stats:ShStats;feats:FeatId[]};

const clamp=(v:number,a:number,b:number)=>v<a?a:v>b?b:v;
function mulberry(seed:number){let a=seed>>>0||1;return()=>{a=(a+0x6d2b79f5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
/** One penalty shoot-out a day, the same five takers for everyone (the arcade's daily seed: FNV-1a of 'safehands:' + the local day). */
export function safehandsDailySeed(day:string){let h=0x811c9dc5;const s='safehands:'+day;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return 1+h%2_000_000_000;}
/** The day's five takers (indexes into STRIKERS), for the start card. */
export function dailyTakers(seed:number):number[]{const r=mulberry(seed^0x5afe),ix=STRIKERS.map((_,i)=>i);for(let i=ix.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[ix[i],ix[j]]=[ix[j],ix[i]];}return ix.slice(0,SH.dailyShots);}

/** The ball's place u of the way (0 = the kick, 1 = the goal line). */
export function shotPath(sh:Shot,u:number){const z=sh.bz*(1-u);let x=sh.bx+(sh.tx-sh.bx)*u;
 if(sh.defl&&u>sh.defl.at){const xa=sh.bx+(sh.tx-sh.bx)*sh.defl.at;x=xa+(sh.tx+sh.defl.dx-xa)*(u-sh.defl.at)/(1-sh.defl.at);}
 // a struck ball is at its height after the first third of the way
 return {x,y:.11+(sh.ty-.11)*Math.min(1,u/.3)+sh.arc*4*u*(1-u),z};}
/** Where the keeper should stand: x on the line from the ball to the middle of the goal at depth d (a free kick: the middle of the
 *  side the wall leaves open), and the good range of depth. */
export function idealFor(sh:Shot,d:number,strikerZ=sh.bz){
 if(sh.kind==='free')return {x:-sh.near*sh.wallN*.4,d0:0,d1:1};
 const x=sh.bx*d/Math.max(1,strikerZ);
 if(sh.kind==='pen')return {x:0,d0:0,d1:0};
 if(sh.kind==='far')return {x,d0:1.5,d1:3.3};
 if(sh.kind==='one')return {x,d0:sh.bz-8,d1:sh.bz-4.5};
 return {x,d0:0,d1:2};
}
/** How far a dive reaches t seconds after the action. */
export const reachAfter=(t:number)=>SH.body+clamp(SH.reachV*(t-SH.push),0,SH.reachMax);
/** The covered box for an action: [x0,x1,y0,y1]. `big` = out at a 1v1, standing tall and wide. */
export function coverBox(a:Act|null,kx:number,reach:number,big:boolean):[number,number,number,number]{
 if(a==='L'||a==='LH'||a==='R'||a==='RH'){const dir=a[0]==='L'?-1:1,x0=kx-dir*.5,x1=kx+dir*reach,hi=a.length===2;return [Math.min(x0,x1),Math.max(x0,x1),hi?.8:0,hi?2.7:1.3];}
 if(a==='up')return [kx-1,kx+1,1.3,3.1];
 if(a==='down')return [kx-.9,kx+.9,0,.7];
 const w=big?1.15:SH.body;return [kx-w,kx+w,0,2.3];
}
/** The right action for a shot once its honest tells are known (bots, the fairness test, the results card's coach). */
export function bestAct(sh:{side:-1|0|1;high:boolean;power:number;wet:boolean},kx:number,px:number):Act|null{
 const off=px-kx,hard=sh.power>(sh.wet?SH.holdWet:SH.hold);
 if(Math.abs(off)<=SH.body-.1)return hard?(sh.high?'up':off<0?'L':'R'):null;
 return (off<0?'L':'R')+(sh.high?'H':'') as Act;
}

export type SafeHands=ReturnType<typeof createSafeHands>;
export function createSafeHands(opts:{seed:number;daily?:boolean;startTier?:number;/** tests only */lives?:number}){
 const rnd=mulberry(opts.seed),daily=!!opts.daily,events:ShEvent[]=[];
 const takers=daily?dailyTakers(opts.seed):[];
 const stats:ShStats={shots:0,saves:0,goals:0,held:0,parries:0,fingertips:0,early:0,posOk:0,bestStreak:0,lowLeftRow:0,smothers:0,claims:0,punches:0,crossRight:0,wallRight:0,rebounds:0,tiersClean:0,lastWhy:'',lastKind:''};
 const s:ShState={t:0,phase:'tip',pt:0,daily,tier:daily?DAILY_TIER:clamp(Math.floor(opts.startTier??0),0,TIERS.length-1),shotN:0,lives:opts.lives??SH.lives,score:0,streak:0,over:false,won:false,
  kx:0,kd:0,wantX:0,wantD:0,shot:null,act:null,decision:'',res:null,strikeT:0,dailySaves:0,dailyLog:[],tierGoals:0,stats,feats:[]};
 let acc=0,plan:{kind:Kind;striker:number}[]=[],lastStriker=-1,pendingReb=false,resFor=0;
 const emit=(type:ShEvent['type'],a=0,b=0,word='',points=0)=>{events.push({type,a,b,word,points});};
 const feat=(id:FeatId)=>{if(!s.feats.includes(id)){s.feats.push(id);emit('feat',SH_FEAT_IDS.indexOf(id),0,id);}};
 const cfg=()=>TIERS[s.tier];

 function planTier(){const T=cfg(),kinds=[...T.kinds];
  // the order is shuffled, but the round always opens with a penalty or a 1v1 it already knows and (Cup final) ends on a penalty
  const last=s.tier===3?kinds.pop()!:null;for(let i=kinds.length-1;i>1;i--){const j=1+Math.floor(rnd()*i);[kinds[i],kinds[j]]=[kinds[j],kinds[i]];}if(last)kinds.push(last);
  plan=kinds.map((kind,i)=>{let st=T.pool[Math.floor(rnd()*T.pool.length)];if(st===lastStriker)st=T.pool[(T.pool.indexOf(st)+1)%T.pool.length];if(last&&i===kinds.length-1)st=9;lastStriker=st;return {kind,striker:st};});}

 function makeShot(kind:Kind,si:number,from?:{x:number;z:number}):Shot{
  const T=cfg(),st=STRIKERS[si],quick=kind==='head'||kind==='reb',long=!quick&&rnd()<.5;let side:-1|0|1,high:boolean;
  if(st.fav&&long){side=st.fav.side;high=st.fav.high;}else{const r=rnd();side=r<.4?-1:r<.6?0:1;high=rnd()<(kind==='one'||quick?.2:.4);}
  const power=clamp(st.power+(long?.1:0)+(rnd()-.5)*.16-(quick?.15:0),.3,1);
  let tx=side?side*(1.5+rnd()*1.5):(rnd()-.5)*.9;const ty=high?1.45+rnd()*.7:.2+rnd()*.7;
  let bx=0,bz=11,setSecs=2,dmax=0,xmax=2.5,fromZ=0,tight=true,touchAt=0,near:-1|1=1,wallBest=0,cx=0,cz=0,crowd=false,closeIn=false,arc=.08+(1-power)*.2,v=(17+11*power)*T.speed,runSecs=long?2:1.4,plant=T.plant;
  if(kind==='far'){bx=(rnd()*2-1)*11;bz=19+rnd()*7;setSecs=2.6;dmax=5;xmax=3.3;v+=3;}
  else if(kind==='one'){bx=(rnd()*2-1)*5;bz=11+rnd()*2;fromZ=24;setSecs=3.2;dmax=9;xmax=3.3;tight=rnd()<.5;touchAt=1.5;runSecs=.9;plant=Math.min(plant,.6);tx*=.95;}
  else if(kind==='free'){bx=(rnd()*2-1)*13;bz=18+rnd()*5;setSecs=2.4;dmax=1.5;xmax=3.3;near=Math.abs(bx)<1?(rnd()<.5?-1:1):bx<0?-1:1;wallBest=Math.abs(bx)<5?4:Math.abs(bx)<9.5?3:2;}
  else if(kind==='cross'){bx=(rnd()<.5?-1:1)*(17+rnd()*5);bz=4+rnd()*9;setSecs=2;dmax=3;xmax=3.3;closeIn=rnd()<.55;cx=(rnd()*2-1)*3.5;cz=closeIn?2.5+rnd()*2.5:7.5+rnd()*3.5;crowd=closeIn&&rnd()<.5;}
  else if(kind==='head'){dmax=9;xmax=3.5;bx=from!.x;bz=from!.z;setSecs=0;runSecs=.6;plant=Math.min(.45,T.plant);v=(12+4*power)*Math.min(1.1,T.speed);arc=.15;}
  else if(kind==='reb'){dmax=9;xmax=3.5;bx=from!.x;bz=from!.z;setSecs=.5;runSecs=.75;plant=Math.min(.5,T.plant+.05);v=(14+5*power)*Math.min(1.1,T.speed);}
  const tricky=T.tricks>0&&!quick&&kind!=='cross',stutter=tricky&&st.stutter&&rnd()<.7?.45:0,watch=tricky&&T.tricks>1&&st.watcher&&kind!=='free';
  const glance:-1|0|1=st.glance===0?0:side===0?(rnd()<.5?-1:1):(st.glance*side) as -1|1,approach:-1|0|1=rnd()<.7?side:0;
  const defl:Shot['defl']=(kind==='far'||kind==='free')&&rnd()<T.deflect?{at:.45+rnd()*.1,dx:0,k:rnd(),done:false}:null;
  // a header or a rebound is aimed past the keeper where he stands now, so its tell is the way to dive
  if(quick){const f=clamp((bz-s.kd)/bz,.3,1),want=s.kx+(side?side*(1+rnd()*1.7):(rnd()-.5)*.6);tx=clamp(bx+(want-bx)/f,-3.3,3.3);const off=bx+(tx-bx)*f-s.kx;side=Math.abs(off)<.6?0:off<0?-1:1;}
  tx=clamp(tx,-3.3,3.3);
  const sh:Shot={kind,striker:si,bx,bz,tx,ty,side,high,power,speed:v,long,flight:Math.hypot(tx-bx,bz)/v,setSecs,runSecs,plant:stutter?plant*.85:plant,stutter,watch,switched:false,glance,approach,arc,defl,wet:T.wet,dmax,xmax,chip:false,
   fromZ,tight,touchAt,near,wallBest,wallN:wallBest,over:false,cx,cz,crowd,closeIn,crossSecs:1.9-s.tier*.1,fake:stutter>0||(st.glance===-1&&side!==0)};
  if(kind!=='free')setDefl(sh);return sh;
 }
 /** A deflection off a defender: only on shots to a side, never further than the corner, and it never changes the side. */
 function setDefl(sh:Shot){const d=sh.defl;if(!d)return;if(sh.side===0||sh.over){sh.defl=null;return;}d.dx=sh.side*(d.k*.9-.6);sh.tx=clamp(sh.tx,-3.3+Math.max(0,-d.dx),3.3-Math.max(0,d.dx));if(Math.sign(sh.tx+d.dx)!==sh.side)d.dx=0;sh.flight=Math.hypot(sh.tx-sh.bx,sh.bz)/sh.speed;}
 /** A free kick's target depends on the wall: the open side, or up and over the wall. A wall that is too small leaves the near post free. */
 function aimFree(sh:Shot,n:number){sh.wallN=n;const edge=sh.near*(SH.goalHalf-n*.8),ideal=-sh.near*n*.4;
  if(n<sh.wallBest){sh.over=false;sh.side=sh.near;sh.high=false;sh.tx=clamp(edge-sh.near*.35,-3.3,3.3);sh.ty=.3+rnd()*.5;}
  else if(rnd()<.4){sh.over=true;sh.side=sh.near;sh.high=true;sh.tx=sh.near*Math.min(Math.abs(edge)+.3+rnd()*.8,3.1-n*.4);sh.ty=1.6+rnd()*.5;sh.speed*=.8;sh.arc=1.5;}
  else{sh.over=false;const sd=rnd()<.25?0:rnd()<.5?-1:1,room=Math.abs(edge-sh.near*.3-ideal);
   sh.tx=clamp(sd===0?ideal+(rnd()-.5)*.8:sd===sh.near?ideal+sh.near*Math.min(room,1.2+rnd()):ideal-sh.near*(1.2+rnd()*.9),-3.3,3.3);}
  // sides are told from where the keeper should stand
  if(!sh.over&&n>=sh.wallBest){const off=sh.tx-ideal;sh.side=Math.abs(off)<.6?0:off<0?-1:1;}
  const st=STRIKERS[sh.striker];sh.glance=st.glance===0?0:sh.side===0?sh.glance:(st.glance*sh.side) as -1|1;sh.approach=sh.side;sh.fake=sh.stutter>0||(st.glance===-1&&sh.side!==0);
  sh.flight=Math.hypot(sh.tx-sh.bx,sh.bz)/sh.speed;setDefl(sh);}

 function begin(sh:Shot){s.shot=sh;s.act=null;s.decision='';s.res=null;s.pt=0;stats.lastKind=sh.kind;
  if(sh.kind==='head'||sh.kind==='reb'){s.phase=sh.setSecs>0?'set':'run';}
  if(sh.kind==='reb'){s.wantX=s.kx;s.wantD=s.kd;}
  if(sh.kind!=='head'&&sh.kind!=='reb'){s.kx=0;s.kd=0;s.wantX=0;s.wantD=0;s.phase=sh.kind==='free'?'wall':'set';stats.shots++;}
  emit('attack',sh.striker,0,sh.kind);}
 function nextAttack(){
  if(daily){if(s.shotN>=SH.dailyShots){finish(true);return;}begin(makeShot('pen',takers[s.shotN]));return;}
  if(s.shotN>=plan.length){// the round is cleared
   const clean=s.tierGoals===0,bonus=300*(s.tier+1)+(clean?200:0);s.score+=bonus;emit('clear',s.tier,clean?1:0,TIERS[s.tier].name,bonus);
   if(clean){stats.tiersClean++;feat('clean-sheet');if(s.lives<SH.lives){s.lives++;emit('life',s.lives,1);}}
   if(s.tier>=TIERS.length-1){const win=1000+300*s.lives;s.score+=win;feat('cup');s.won=true;finish(true,win);return;}
   s.tier++;s.shotN=0;s.tierGoals=0;s.shot=null;s.phase='tip';s.pt=0;planTier();emit('tier',s.tier,0,TIERS[s.tier].name);return;}
  const p=plan[s.shotN];begin(makeShot(p.kind,p.striker));}
 function finish(done:boolean,points=0){s.over=true;s.phase='over';s.pt=0;if(daily&&s.dailySaves>=SH.dailyShots)feat('daily-5');emit('over',done?1:0,s.won?1:0,'',points);}

 /* ---- scoring ---- */
 function saved(kind:SaveKind,x:number,y:number,o:{early?:boolean;posOk?:boolean;right?:boolean;earlyK?:number}={}){
  const sh=s.shot!,mult=(1+.25*s.tier)*(1+.1*Math.min(10,s.streak));
  let pts=100+(kind==='held'||kind==='claim'?40:kind==='fingertip'?60:0)+(o.early?Math.round(80*(o.earlyK??1)):0)+(o.posOk?40:0)+(o.right?60:0)+(sh.kind==='reb'?50:0);pts=Math.round(pts*mult/5)*5;
  s.score+=pts;s.streak++;stats.saves++;stats.bestStreak=Math.max(stats.bestStreak,s.streak);if(o.early)stats.early++;if(o.posOk)stats.posOk++;
  if(kind==='held'||kind==='claim')stats.held++;else if(kind==='fingertip'){stats.fingertips++;feat('fingertip');}else stats.parries++;
  if(kind==='smother'){stats.smothers++;feat('smother');}if(kind==='claim')stats.claims++;if(kind==='punch')stats.punches++;
  if(s.act?.a==='L'&&kind!=='smother'){if(++stats.lowLeftRow>=3)feat('low-left-3');}
  feat('first-save');if(stats.held>=5)feat('safe-hands');if(stats.early>=5)feat('early-read');
  if(sh.kind==='pen'&&(sh.fake||sh.watch))feat('faked-pen');
  if(sh.kind==='free'&&sh.wallN===sh.wallBest){stats.wallRight++;feat('wall');}
  if((kind==='claim'||kind==='punch')&&o.right){if(++stats.crossRight>=2)feat('area');}
  if(daily){s.dailySaves++;s.dailyLog.push(1);}
  s.res={saved:true,kind,why:'',points:pts,x,y,early:!!o.early,posOk:!!o.posOk,right:!!o.right};s.phase='res';s.pt=0;resFor=SH.resSecs;pendingReb=false;
  emit('save',SAVE_KINDS.indexOf(kind),s.streak,kind,pts);scout(sh);}
 function goal(why:GoalWhy,x:number,y:number){const sh=s.shot!;s.streak=0;stats.goals++;stats.lowLeftRow=0;stats.lastWhy=why;s.tierGoals++;
  if(daily)s.dailyLog.push(0);else{s.lives--;emit('life',s.lives,0);}
  s.res={saved:false,kind:'goal',why,points:0,x,y,early:false,posOk:false,right:false};s.phase='res';s.pt=0;resFor=SH.goalSecs;pendingReb=false;emit('goal',GOAL_WHYS.indexOf(why),s.lives,why);scout(sh);}
 function spill(x:number,y:number){s.res={saved:false,kind:'spill',why:'',points:0,x,y,early:false,posOk:false,right:false};s.phase='res';s.pt=0;resFor=.75;pendingReb=true;stats.rebounds++;emit('spill',0,0,'spill');}
 /** which of the striker's habits this shot showed: bit 0 glance, 1 favourite (long run-up), 2 power, 3 trick */
 function scout(sh:Shot){if(sh.kind==='head'||sh.kind==='reb'||sh.kind==='cross')return;const st=STRIKERS[sh.striker];
  emit('scout',sh.striker,(sh.side!==0||st.glance===0?1:0)|(sh.long?2:0)|4|((sh.stutter>0||sh.switched)&&st.habits[3]?8:0),st.id,s.res?.saved?1:0);}

 /* ---- the ball reaches the keeper ---- */
 function resolve(){const sh=s.shot!,f=clamp((sh.bz-s.kd)/sh.bz,0,1),p=shotPath(sh,f),tArr=s.strikeT+sh.flight*f,a=s.act,kx=s.kx;
  const big=sh.kind==='one'&&s.kd>=3,reach=a?reachAfter(tArr-a.t):SH.body,box=coverBox(a?a.a:null,kx,reach,big),inBox=p.x>=box[0]&&p.x<=box[1]&&p.y>=box[2]&&p.y<=box[3];
  const id=idealFor(sh,s.kd),posOk=sh.kind!=='head'&&sh.kind!=='reb'&&Math.abs(kx-id.x)<=.6&&s.kd>=id.d0-.3&&s.kd<=id.d1+.3;
  const off=Math.abs(p.x-kx),early=!!a&&a.t<s.strikeT,earlyK=a?clamp((s.strikeT-a.t)/.4,.25,1):0,hard=sh.power>(sh.wet?SH.holdWet:SH.hold);
  if(sh.chip){goal('chipped',p.x,p.y);return;}
  if(inBox){
   if(!a){if(big)saved('block',p.x,p.y,{posOk});else if(hard){if(daily)saved('parry',p.x,p.y,{posOk});/* a shoot-out kick is over once it is stopped: no rebounds */else spill(p.x,p.y);}else saved('held',p.x,p.y,{posOk});return;}
   if(a.a==='up'){saved('tip',p.x,p.y,{early,earlyK,posOk});return;}
   if(a.a==='down'){saved('parry',p.x,p.y,{posOk});return;}
   if(off>reach-SH.tip&&off>SH.body+.2)saved('fingertip',p.x,p.y,{early,earlyK,posOk});else if(!hard&&off<1.4)saved('held',p.x,p.y,{early,earlyK,posOk});else saved('parry',p.x,p.y,{early,earlyK,posOk});return;}
  let why:GoalWhy='froze';
  if(a){const dir=a.a[0]==='L'?-1:a.a[0]==='R'?1:0,hi=a.a.length===2;
   if(!dir)why='wrongmove';else if(Math.sign(p.x-kx)!==dir&&off>.5)why=sh.switched?'early':'wrongway';else if(hi?p.y<.8:p.y>1.3)why='height';else why=off<=SH.body+SH.reachMax?'late':'position';}
  else if(off>SH.body+SH.reachMax)why='position';
  goal(why,p.x,p.y);}

 /* ---- inputs ---- */
 /** Where the keeper wants to stand (set phase only: the feet are set once the run-up starts). */
 function move(x:number,d:number){const sh=s.shot;if(!sh||(s.phase!=='set'&&s.phase!=='wall'&&s.phase!=='cross'))return;s.wantX=clamp(x,-sh.xmax,sh.xmax);s.wantD=clamp(d,0,sh.dmax);}
 function nudge(dx:number,dd:number){move(s.wantX+dx,s.wantD+dd);}
 /** The one action of an attack. Returns false when it cannot be used now. */
 function act(a:Act):boolean{const sh=s.shot;if(!sh||s.over)return false;
  if(s.phase==='set'&&sh.kind==='one'){if(a!=='down')return false;const loose=looseBall();
   s.act={a,t:s.t};emit('commit',0,0,a);
   if(loose&&loose.z-s.kd<=SH.smother&&Math.abs(loose.x-s.kx)<=2.5)saved('smother',loose.x,.2,{right:true});else goal('rounded',sh.bx,.2);return true;}
  if(s.phase!=='run'&&s.phase!=='fly')return false;if(s.act)return false;
  s.act={a,t:s.t};emit('commit',0,0,a);
  // a striker who waits for the keeper: move before the foot is planted and the shot goes the other way
  if(s.phase==='run'&&sh.watch&&s.pt<sh.runSecs+sh.stutter-sh.plant&&(a[0]==='L'||a[0]==='R')){const dir=a[0]==='L'?-1:1;sh.side=-dir as -1|1;sh.tx=-dir*Math.max(1.7,Math.abs(sh.tx));sh.switched=true;sh.fake=true;sh.flight=Math.hypot(sh.tx-sh.bx,sh.bz)/sh.speed;emit('switch');}
  return true;}
 /** Free kick: how many beans in the wall (2-4). */
 function wall(n:number){const sh=s.shot;if(!sh||s.phase!=='wall')return false;n=clamp(Math.round(n),2,4);aimFree(sh,n);s.phase='set';s.pt=0;emit('wall',n,n===sh.wallBest?1:0);return true;}
 /** Cross: claim it, punch it or stay on your line. */
 function choose(d:Decision){const sh=s.shot;if(!sh||s.phase!=='cross'||s.decision)return false;s.decision=d;emit('commit',0,0,d);return true;}
 /** The round's tip card was read. */
 function ack(){if(s.phase!=='tip'||s.over)return false;if(!plan.length&&!daily)planTier();nextAttack();return true;}

 /** 1v1: where the striker is and whether the ball has run away from her (a heavy touch). */
 function strikerZ(){const sh=s.shot;if(!sh)return 0;if(sh.kind!=='one'||s.phase!=='set')return sh.bz;return sh.fromZ+(sh.bz-sh.fromZ)*clamp(s.pt/sh.setSecs,0,1);}
 function looseBall(){const sh=s.shot;if(!sh||sh.kind!=='one'||sh.tight||s.phase!=='set')return null;const k=(s.pt-sh.touchAt)/.9;if(k<=0||k>=1)return null;return {x:sh.bx,z:strikerZ()-4.2*Math.sin(Math.PI*k),k};}

 function tells():Tells{const sh=s.shot,none:Tells={approach:0,glance:0,hips:null,plant:null,hidden:false,paused:false};if(!sh||(s.phase!=='run'&&s.phase!=='fly'))return none;
  const total=sh.runSecs+sh.stutter,pt=s.phase==='fly'?total:s.pt,hidden=sh.kind==='free'&&sh.wallN>sh.wallBest,pAt=total-sh.plant;
  const g0=.25*sh.runSecs;return {approach:sh.approach,glance:pt>=g0&&pt<g0+.6?sh.glance:0,hips:pt>=pAt-.3?sh.side:null,plant:!hidden&&pt>=pAt?{side:sh.side,high:sh.high,power:sh.power}:null,hidden,
   paused:sh.stutter>0&&pt>=sh.runSecs*.45&&pt<sh.runSecs*.45+sh.stutter};}
 /** The ball right now, for the view (world metres). */
 function ball(){const sh=s.shot;if(!sh)return {x:0,y:.11,z:11};
  if(s.phase==='cross'){const k=clamp(s.pt/sh.crossSecs,0,1);return {x:sh.bx+(sh.cx-sh.bx)*k,y:.11+(2.3-.11)*k+5*4*k*(1-k)*.5,z:sh.bz+(sh.cz-sh.bz)*k};}
  if(s.phase==='fly'||(s.phase==='res'&&s.strikeT>0)){const u=clamp((s.t-s.strikeT)/sh.flight,0,s.phase==='res'?(sh.bz-s.kd)/sh.bz:1);return shotPath(sh,u);}
  if(sh.kind==='one'&&s.phase==='set'){const l=looseBall();return {x:sh.bx,y:.11,z:l?l.z:strikerZ()-.5};}
  if(sh.kind==='head')return {x:sh.bx,y:2.1,z:sh.bz};
  return {x:sh.bx,y:.11,z:sh.bz-(sh.kind==='one'?.5:0)};}

 function stepOnce(){const h=SH.step,sh=s.shot;s.t+=h;s.pt+=h;
  if(sh&&(s.phase==='set'||s.phase==='wall'||s.phase==='cross')){const dx=s.wantX-s.kx,dd=s.wantD-s.kd;s.kx+=clamp(dx,-SH.moveX*h,SH.moveX*h);s.kd+=clamp(dd,-SH.moveD*h,SH.moveD*h);}
  switch(s.phase){
   case 'wall':if(s.pt>=7)wall(3);break;// no choice in seven seconds: three in the wall
   case 'set':{if(!sh)break;
    if(sh.kind==='one'&&!sh.tight&&s.pt>=sh.touchAt&&s.pt-h<sh.touchAt)emit('touch');
    if(s.pt>=sh.setSecs){
     if(sh.kind==='cross'){s.phase='cross';s.pt=0;emit('cross',sh.closeIn?1:0,sh.crowd?1:0);}
     else{s.phase='run';s.pt=0;emit('whistle',sh.striker,0,sh.kind);}}
    break;}
   case 'run':{if(!sh)break;if(s.pt>=sh.runSecs+sh.stutter){
     if(sh.kind==='one'&&sh.bz-s.kd<SH.roundDist){s.strikeT=0;goal('rounded',sh.bx,.2);break;}
     if(sh.kind==='far'&&s.kd>SH.chipDepth){sh.chip=true;sh.ty=2.2;sh.arc=4.5;sh.tx*=.5;sh.speed*=.75;sh.flight=Math.hypot(sh.tx-sh.bx,sh.bz)/sh.speed;}
     s.phase='fly';s.pt=0;s.strikeT=s.t;emit('strike',Math.round(sh.power*100),0,sh.kind);}
    break;}
   case 'fly':{if(!sh)break;const u=(s.t-s.strikeT)/sh.flight;
    if(sh.defl&&!sh.defl.done&&u>=sh.defl.at){sh.defl.done=true;emit('deflect');}
    if(u>=(sh.bz-s.kd)/sh.bz)resolve();break;}
   case 'cross':{if(!sh)break;if(s.pt>=sh.crossSecs){const d=s.decision||'stay';s.strikeT=0;
     if(d==='stay'){const head=makeShot('head',sh.striker,{x:sh.cx,z:sh.cz});if(sh.closeIn){head.speed*=1.15;head.plant=Math.min(head.plant,.3);head.flight=Math.hypot(head.tx-head.bx,head.bz)/head.speed;}head.closeIn=sh.closeIn;begin(head);emit('whistle',head.striker,0,'head');}
     else if(!sh.closeIn)goal('stranded',sh.cx,1.5);
     else if(d==='claim'){if(sh.crowd){spill(sh.cx,1.2);}else saved('claim',sh.cx,2.2,{right:true});}
     else saved('punch',sh.cx,2.2,{right:sh.crowd});}
    break;}
   case 'res':{if(s.pt<resFor)break;
    if(pendingReb&&sh){pendingReb=false;const from=sh.kind==='cross'?{x:sh.cx,z:Math.max(4.5,sh.cz)}:{x:clamp(s.kx+(rnd()*2-1)*2.5,-4,4),z:s.kd+5+rnd()*2};
     let st=cfg().pool[Math.floor(rnd()*cfg().pool.length)];if(st===sh.striker)st=cfg().pool[(cfg().pool.indexOf(st)+1)%cfg().pool.length];begin(makeShot('reb',st,from));break;}
    s.strikeT=0;if(!daily&&s.lives<=0){finish(false);break;}s.shotN++;nextAttack();break;}
  }}
 return {
  state:s,strikers:STRIKERS,takers,
  advance(dt:number){if(s.over||s.phase==='tip')return;acc+=Math.min(.25,dt);while(acc>=SH.step){acc-=SH.step;stepOnce();if(s.over||(s.phase as Phase)==='tip'){acc=0;break;}}},
  drain(cb:(e:ShEvent)=>void){while(events.length)cb(events.shift()!);},
  move,nudge,act,wall,choose,ack,tells,ball,strikerZ,looseBall,
  /** the ideal standing spot for the cone and the coach */ideal(){const sh=s.shot;return sh?idealFor(sh,s.kd,strikerZ()):{x:0,d0:0,d1:0};},
 };
}
export const SAVE_KINDS:readonly SaveKind[]=['held','parry','fingertip','tip','block','smother','claim','punch'];
export const GOAL_WHYS:readonly GoalWhy[]=['froze','wrongway','height','late','position','wrongmove','chipped','rounded','stranded','early'];
export const safehandsCoins=(score:number)=>Math.floor(Math.max(0,score)/1000);
