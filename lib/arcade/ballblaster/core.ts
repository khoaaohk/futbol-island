/**
 * Ball Blaster rules (Nov 17 2026, docs/arcade-aaa/ballblaster-direction.md): a gallery shooter where the ammo is footballs.
 * Pure and deterministic: a seeded RNG (mulberry32) and fixed 1/120 s steps, so the same seed and the same shots give the same run on
 * every device (the Daily Blast). No DOM, no three.js: tests/ballblaster-core.cjs plays it with bots.
 * World: metres. The player kicks from just in front of the goal line (z = 0) up the pitch (-z). Wind-up training robots and other
 * practice machines march down the pitch toward the goal; one that reaches the line costs a heart. Three hearts.
 * The pitch narrows toward the goal (halfW): far away the machines spread wide, close in they funnel to the goal mouth.
 * Balls are real projectiles: gravity, ground bounce, slanted side boards, ricochets off what they hit, a curl that bends them.
 * Chains: a cone tower topples onto what stands behind it, a water barrel bursts and knocks over everything near it.
 * Kid-safe: nothing alive is hurt. Everything breaks into pieces (the view) with comic lettering (the shell).
 * No allocation in a step: every list is a fixed pool made in createBallBlaster.
 */

export const BB={
 step:1/120,hearts:3,
 /** ball rack: how many balls wait at your feet, and the seconds to roll a new one in */
 rack:6,refill:.68,
 g:13,ballR:.22,giantR:.52,
 /** where the ball is kicked from */
 kx:-.35,ky:.22,kz:1.1,
 /** the goal line, where the machines spawn, the far end of the pitch */
 lineZ:0,spawnZ:-42,farZ:-50,
 /** shot speed limits (m/s, along the ground) and how long a curl bends (m/s/s at full curl) */
 vMin:13,vMax:38,curl:22,ballLife:4.2,
 comboWin:1.5,comboStep:.25,comboMax:8,
 trickBonus:150,
 bossEvery:5,
 /** score marks for Bronze, Silver, Gold (from the bots: tests/ballblaster-core.cjs --bots) */
 medals:[8000,30000,100000] as readonly number[],
 /** shots with this much charge (0..1) hit twice as hard */
 powerShot:.9,
 slowFor:6,powerShots:4,
 /** a machine broken this close to the goal line (z above this) is a close call and pays a little extra */
 closeZ:-5,closeBonus:50,stopBonus:110,
 /** machines run on from the far end at least this fast (m/s) until this depth, so the early waves are never an empty pitch */
 runOn:4.6,runOnZ:-27,
 /** target practice after every boss: how long it runs, how many targets pop up, how long each one stays */
 bonusSecs:11.6,bonusN:12,targetLife:2.9,firstBonus:3,
 /** the super shot: the meter fills with breaks (more with a combo); a full-power kick spends it */
 supMachine:.017,supCombo:.004,supProp:.01,supR:.36,supBurst:1.4,
} as const;

export const MEDAL_NAMES=['Bronze','Silver','Gold'] as const;
export function medalFor(score:number){let m=0;for(const t of BB.medals)if(score>=t)m++;return m;}
export function nextMedalLine(score:number):{medal:number;next:string|null;gap:number}{const m=medalFor(score);return m>=BB.medals.length?{medal:m,next:null,gap:0}:{medal:m,next:MEDAL_NAMES[m],gap:BB.medals[m]-score};}
export const ballblasterCoins=(score:number)=>Math.floor(Math.max(0,score)/2000);
export const multFor=(combo:number)=>1+BB.comboStep*Math.min(BB.comboMax,Math.max(0,combo-1));

/** Half the pitch width at depth z (the field narrows toward the goal). */
export const halfW=(z:number)=>2.4+Math.max(0,-z)*.15;
/** the side boards stand this far outside the playing width */
export const BOARD_OUT=1.1;

/** Machines (k < 10) walk; props (k >= 10) stand and break. */
export const K={robot:1,cone:2,dummy:3,drone:4,shield:5,dodger:6,armour:7,boss:8,rocket:9,crate:10,glass:11,tower:12,tyres:13,barrel:14,board:15,target:16} as const;
export const K_NAME:Record<number,string>={1:'robot',2:'cone-bot',3:'dummy',4:'drone',5:'shield-bot',6:'dodge-bot',7:'armour-bot',8:'Mega Mannequin',9:'rocket-bot',10:'crate',11:'glass',12:'cone tower',13:'tyres',14:'barrel',15:'scoreboard',16:'target'};
export const isMachine=(k:number)=>k>0&&k<10;
/** radius, height, hit points, points, speed factor */
export const SPEC:Record<number,{r:number;h:number;hp:number;pts:number;v:number}>={
 1:{r:.48,h:1.5,hp:1,pts:100,v:1},2:{r:.42,h:1,hp:1,pts:80,v:1.55},3:{r:.42,h:1.6,hp:1,pts:120,v:1},4:{r:.55,h:.5,hp:1,pts:150,v:1.1},
 5:{r:.56,h:1.6,hp:1,pts:180,v:.8},6:{r:.44,h:1.4,hp:1,pts:160,v:1.05},7:{r:.56,h:1.7,hp:2,pts:200,v:.82},8:{r:1.15,h:3.4,hp:12,pts:1500,v:.36},9:{r:.5,h:1.35,hp:1,pts:220,v:.95},
 10:{r:.52,h:.9,hp:1,pts:40,v:0},11:{r:.62,h:1.6,hp:1,pts:30,v:0},12:{r:.46,h:2.2,hp:1,pts:60,v:0},13:{r:.56,h:1.1,hp:2,pts:50,v:0},14:{r:.44,h:1,hp:1,pts:70,v:0},15:{r:.95,h:2.4,hp:3,pts:150,v:0},16:{r:.62,h:1.75,hp:1,pts:60,v:0},
};
/** Each machine joins on its own wave (one new kind at a time), with a word on the screen. */
export const UNLOCK:readonly {k:number;wave:number;word:string}[]=[
 {k:K.robot,wave:1,word:'ROBOTS!'},{k:K.cone,wave:2,word:'CONE-BOTS: FAST!'},{k:K.dummy,wave:3,word:'DUMMIES HOP!'},{k:K.armour,wave:4,word:'ARMOUR: HIT TWICE!'},
 {k:K.drone,wave:6,word:'DRONES: AIM HIGH!'},{k:K.shield,wave:7,word:'SHIELDS: CURL IT!'},{k:K.dodger,wave:8,word:'DODGERS!'},{k:K.rocket,wave:9,word:'ROCKET-BOTS: STOP THEM!'},
];
export const PROP_UNLOCK:readonly {k:number;wave:number}[]=[{k:K.crate,wave:1},{k:K.barrel,wave:2},{k:K.tower,wave:3},{k:K.glass,wave:4},{k:K.tyres,wave:5},{k:K.board,wave:6}];
export const P={none:0,multi:1,fire:2,giant:3,slow:4} as const;
export const P_WORD=['','MULTI-BALL!','FIRE BALL!','GIANT BALL!','SLOW-MO!'] as const;

/** The ramp: everything only gets harder with the wave number, and keeps creeping after the early caps. */
export function rampAt(wave:number){
 const n=Math.max(1,wave);
 return {
  count:Math.round(4+n*1.8+Math.max(0,n-10)*.9),
  /** seconds between spawns */
  gap:Math.max(.4,2.4-n*.16-Math.max(0,n-12)*.01),
  /** walking speed m/s */
  speed:1.6*(1+.11*Math.min(n,12)+.04*Math.max(0,n-12)+.06*Math.max(0,n-15)),
  /** chance a spawn comes as a pair (then a trio) */
  group:Math.min(.7,Math.max(0,(n-3)*.06)),
  props:Math.min(8,2+Math.ceil(n/2)),
 };
}
export const isBossWave=(n:number)=>n>0&&n%BB.bossEvery===0;
export const bossHp=(n:number)=>6+Math.round(n*1.2);

export function ballblasterDailySeed(day:string){let h=0x811c9dc5;const s='ballblaster:'+day;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return 1+h%2_000_000_000;}

export type Ent={on:boolean;kind:number;id:number;x:number;y:number;z:number;r:number;h:number;hp:number;max:number;
 /** age, a per-kind phase, a sidestep target, a cooldown, the last ball that touched it, hit flash */
 t:number;ph:number;tx:number;cd:number;lastBall:number;lastAt:number;flash:number;gold:boolean;speed:number;
 /** how fast it is coming right now (m/s): 0 while a rocket-bot winds up, high in its dash (aim leads with this) */v:number;
 /** boss: 0..2 */phase:number;
 /** set when it broke this step (the view keeps the pieces) */dead:boolean};
export type Ball={on:boolean;id:number;x:number;y:number;z:number;vx:number;vy:number;vz:number;ax:number;az:number;r:number;dmg:number;fire:boolean;
 t:number;kills:number;hit:boolean;ric:boolean;bounces:number;curl:boolean;shot:number;
 /** a super shot: goes through everything and bursts what it breaks */sup:boolean};
export type Chain={on:boolean;t:number;kind:number;x:number;z:number;dx:number;dz:number;ball:number};
/** say: 1..3 = the first machine of a set piece (a row, a file, a cone rush) calls its word as it steps on */
export type Spawn={t:number;kind:number;x:number;gold:boolean;say:number};
export const SET_WORD=['','ALL IN A ROW!','ONE BY ONE!','CONE RUSH!'] as const;
export type BlastStats={shots:number;hits:number;breaks:number;machines:number;props:number;tricks:number;bestTrick:number;bestCombo:number;waves:number;bosses:number;powers:number;leaks:number;curls:number;blocks:number;supers:number;close:number;targets:number;heartsBack:number};
export type BlastEventType='shot'|'bounce'|'hit'|'block'|'break'|'boom'|'topple'|'trick'|'power'|'leak'|'wave'|'clear'|'new'|'boss'|'dodge'|'empty'|'over'|'super'|'tell'|'dash'|'shout'|'bonus'|'heart';
/** x,y,z = where; kind = the thing; points = what it paid; a = combo / wave / count / power; b = extra */
export type BlastEvent={type:BlastEventType;x:number;y:number;z:number;kind:number;points:number;a:number;b:number;word:string};
export type BlastState={
 seed:number;daily:boolean;t:number;score:number;hearts:number;over:boolean;
 rack:number;refillT:number;wave:number;
 /** 'intro' before wave 1, 'fight', 'break' between waves */
 /** 'bonus' = target practice after a boss: nothing can cost a heart */
 mode:'intro'|'fight'|'break'|'bonus';modeT:number;bonusT:number;bonusI:number;bonusDue:boolean;bonusHits:number;
 /** the super shot meter 0..1 */sup:number;supReady:boolean;
 spawns:Spawn[];spawnN:number;spawnI:number;waveT:number;waveShots:number;waveHits:number;
 combo:number;comboT:number;power:number;powerN:number;slowT:number;cine:number;
 ents:Ent[];balls:Ball[];chains:Chain[];
 stats:BlastStats;nextId:number;shotN:number;
};
export const POOL={ents:56,balls:24,chains:24,spawns:96,events:96};

function mulberry(seed:number){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}

export type BallBlaster=ReturnType<typeof createBallBlaster>;
export function createBallBlaster(opts:{seed:number;daily?:boolean;startWave?:number}){
 const rnd=mulberry(opts.seed||1);
 const ents:Ent[]=Array.from({length:POOL.ents},()=>({on:false,kind:0,id:0,x:0,y:0,z:0,r:0,h:0,hp:0,max:0,t:0,ph:0,tx:0,cd:0,lastBall:-1,lastAt:0,flash:0,gold:false,speed:0,v:0,phase:0,dead:false}));
 const balls:Ball[]=Array.from({length:POOL.balls},()=>({on:false,id:0,x:0,y:0,z:0,vx:0,vy:0,vz:0,ax:0,az:0,r:BB.ballR,dmg:1,fire:false,t:0,kills:0,hit:false,ric:false,bounces:0,curl:false,shot:0,sup:false}));
 const chains:Chain[]=Array.from({length:POOL.chains},()=>({on:false,t:0,kind:0,x:0,z:0,dx:0,dz:0,ball:-1}));
 const spawns:Spawn[]=Array.from({length:POOL.spawns},()=>({t:0,kind:0,x:0,gold:false,say:0}));
 const events:BlastEvent[]=Array.from({length:POOL.events},()=>({type:'shot' as BlastEventType,x:0,y:0,z:0,kind:0,points:0,a:0,b:0,word:''}));let evN=0;
 const state:BlastState={seed:opts.seed,daily:!!opts.daily,t:0,score:0,hearts:BB.hearts,over:false,rack:BB.rack,refillT:0,wave:Math.max(1,Math.floor(opts.startWave??1))-1,
  mode:'intro',modeT:1.2,bonusT:0,bonusI:0,bonusDue:false,bonusHits:0,sup:0,supReady:false,spawns,spawnN:0,spawnI:0,waveT:0,waveShots:0,waveHits:0,combo:0,comboT:0,power:0,powerN:0,slowT:0,cine:0,ents,balls,chains,
  stats:{shots:0,hits:0,breaks:0,machines:0,props:0,tricks:0,bestTrick:0,bestCombo:0,waves:0,bosses:0,powers:0,leaks:0,curls:0,blocks:0,supers:0,close:0,targets:0,heartsBack:0},nextId:1,shotN:0};
 let clock=0,acc=0;
 const emit=(type:BlastEventType,x:number,y:number,z:number,kind=0,points=0,a=0,b=0,word='')=>{if(evN>=POOL.events)return;const e=events[evN++];e.type=type;e.x=x;e.y=y;e.z=z;e.kind=kind;e.points=points;e.a=a;e.b=b;e.word=word;};

 /* ---- spawning ---- */
 function freeEnt(){for(const e of ents)if(!e.on)return e;return null;}
 function place(kind:number,x:number,z:number,gold:boolean){const e=freeEnt();if(!e)return null;const s=SPEC[kind];
  e.on=true;e.dead=false;e.kind=kind;e.id=state.nextId++;e.x=x;e.y=kind===K.drone?2.1:0;e.z=z;e.r=s.r;e.h=s.h;e.hp=kind===K.boss?bossHp(state.wave):s.hp;e.max=e.hp;
  e.t=0;e.ph=rnd()*6.28;e.tx=x;e.cd=0;e.lastBall=-1;e.lastAt=0;e.flash=0;e.gold=gold;e.phase=0;
  e.speed=s.v*rampAt(state.wave).speed*(kind===K.boss?1:(.92+rnd()*.16));e.v=e.speed;return e;}
 const unlocked=(n:number)=>UNLOCK.filter(u=>u.wave<=n);
 function pickKind(n:number){const list=unlocked(n);let tot=0;for(let i=0;i<list.length;i++)tot+=1+i*.18*Math.min(1,n/12)+(list[i].wave===n?3:0);
  let r=rnd()*tot;for(let i=0;i<list.length;i++){r-=1+i*.18*Math.min(1,n/12)+(list[i].wave===n?3:0);if(r<=0)return list[i].k;}return list[list.length-1].k;}
 function startWave(){
  const n=++state.wave,R=rampAt(n);state.mode='fight';state.waveT=0;state.waveShots=0;state.waveHits=0;state.spawnI=0;
  for(const e of ents)if(e.on&&!isMachine(e.kind))e.on=false;// the old props are swept away
  // props: cover, chain-reaction fuel and gold crates
  const pk=PROP_UNLOCK.filter(p=>p.wave<=n);const nProps=R.props;let goldDone=n<2;
  for(let i=0;i<nProps;i++){const z=-9-rnd()*24,w=halfW(z)-.8,x=(rnd()*2-1)*w;let k=pk[Math.floor(rnd()*pk.length)].k;
   if(i===0&&n>=2)k=K.barrel;
   let clash=false;for(const o of ents)if(o.on&&!isMachine(o.kind)&&Math.hypot(o.x-x,o.z-z)<o.r+SPEC[k].r+.7)clash=true;if(clash)continue;
   const gold=!goldDone&&k===K.crate;if(gold)goldDone=true;place(k,x,z,gold);
   // barrels come in little groups: one shot, a chain
   if(k===K.barrel&&n>=3&&rnd()<.6){const x2=x+(x>0?-1.1:1.1);place(K.barrel,Math.max(-w,Math.min(w,x2)),z-.4,false);}}
  if(!goldDone){const z=-14-rnd()*12,w=halfW(z)-.8;place(K.crate,(rnd()*2-1)*w,z,true);}
  // the march: spawn times along the wave
  let t=.6,c=0;state.spawnN=0;const add=(k:number,x:number,gold=false,say=0,late=0)=>{if(state.spawnN>=POOL.spawns)return;const s=spawns[state.spawnN++];s.t=t+late;s.kind=k;s.x=x;s.gold=gold;s.say=say;};
  const W0=halfW(BB.spawnZ)-1;
  if(isBossWave(n)){add(K.boss,0);t+=3;}
  const count=isBossWave(n)?Math.round(R.count*.55):R.count;
  for(const u of UNLOCK)if(u.wave===n)emit('new',0,0,BB.spawnZ,u.k,0,n,0,u.word);
  // from wave 3 every wave has one set piece half-way: a quiet beat, then a row abreast, a file one behind another, or a cone rush
  let setDone=n<3||isBossWave(n);const cl=(x:number)=>Math.max(-W0,Math.min(W0,x));
  while(c<count){
   if(!setDone&&c>=count*.5&&count-c>=3){setDone=true;t+=1.4;const f=1+Math.floor(rnd()*3),m=Math.min(count-c,3+Math.min(2,(n-3)>>2)),fx=(rnd()*2-1)*W0*.45,k0=f===3?K.cone:n<6?K.robot:pickKind(n);
    for(let j=0;j<m;j++,c++){const side=((j+1)>>1)*(j%2?1:-1);
     if(f===1)add(k0,cl(fx+(j-(m-1)/2)*1.7),false,j===0?1:0);else if(f===2)add(k0,cl(fx),false,j===0?2:0,j*.42);else add(K.cone,cl(fx+side*1.4),false,j===0?3:0,((j+1)>>1)*.3);}
    t+=(f===2?m*.42:.6)+R.gap*1.3+.8;continue;}
   const g=rnd()<R.group?(rnd()<.35?3:2):1,k=pickKind(n),x0=(rnd()*2-1)*W0*.85;
   for(let j=0;j<g&&c<count;j++,c++)add(j===0?k:pickKind(n),Math.max(-W0,Math.min(W0,x0+(j-(g-1)/2)*1.6)),n>=3&&rnd()<.07);
   t+=R.gap*(g>1?1.5:1)*(.8+rnd()*.4);}
  emit('wave',0,0,0,0,0,n,isBossWave(n)?1:0,isBossWave(n)?'BOSS WAVE!':`WAVE ${n}`);
 }

 /* ---- breaking things ---- */
 function addChain(kind:number,x:number,z:number,dx:number,dz:number,ball:number,delay:number){for(const c of chains)if(!c.on){c.on=true;c.kind=kind;c.x=x;c.z=z;c.dx=dx;c.dz=dz;c.ball=ball;c.t=delay;return;}}
 function ballById(id:number){if(id<0)return null;for(const b of balls)if(b.on&&b.id===id)return b;return null;}
 function damage(e:Ent,amt:number,ball:number,dx:number,dz:number){
  if(!e.on||e.dead)return;e.hp-=amt;e.flash=.18;
  if(e.kind===K.boss){const ph=e.hp>e.max*2/3?0:e.hp>e.max/3?1:2;if(ph!==e.phase&&e.hp>0){e.phase=ph;emit('boss',e.x,e.h*.6,e.z,e.kind,0,ph,0,ph===1?'IT CALLS FOR HELP!':'IT DODGES NOW!');}
   if(e.hp>0){const pts=50*multFor(state.combo);state.score+=Math.round(pts);emit('hit',e.x,e.h*.7,e.z,e.kind,Math.round(pts),e.hp,e.max);return;}}
  if(e.hp>0){emit('hit',e.x,e.y+e.h*.6,e.z,e.kind,0,e.hp,e.max);return;}
  // broken
  e.dead=true;e.on=false;const s=SPEC[e.kind];
  state.combo=state.t-state.comboT<=BB.comboWin?state.combo+1:1;state.comboT=state.t;state.stats.bestCombo=Math.max(state.stats.bestCombo,state.combo);
  const pts=Math.round(s.pts*multFor(state.combo)*(e.gold?2:1));state.score+=pts;state.stats.breaks++;if(isMachine(e.kind))state.stats.machines++;else state.stats.props++;
  const b=ballById(ball);if(b)b.kills++;
  emit('break',e.x,e.y+e.h*.5,e.z,e.kind,pts,state.combo,e.gold?1:0,'');
  if(e.kind===K.target){state.stats.targets++;state.bonusHits++;}
  // a rocket-bot stopped while it winds up, and any machine broken right on the goal line, pay a little extra
  if(e.kind===K.rocket&&e.phase===1){state.score+=BB.stopBonus;emit('shout',e.x,e.h+.5,e.z,e.kind,BB.stopBonus,0,0,'STOPPED!');}
  else if(isMachine(e.kind)&&e.kind!==K.boss&&e.z>BB.closeZ){state.score+=BB.closeBonus;state.stats.close++;emit('shout',e.x,e.h+.5,e.z,e.kind,BB.closeBonus,0,0,'CLOSE CALL!');}
  // the super shot meter
  if(!state.supReady){state.sup=Math.min(1,state.sup+(isMachine(e.kind)?BB.supMachine+BB.supCombo*Math.min(BB.comboMax,state.combo):BB.supProp));if(state.sup>=1){state.supReady=true;emit('super',BB.kx,1.4,BB.kz,0,0,0,0,'SUPER SHOT READY!');}}
  if(e.kind===K.boss){state.stats.bosses++;state.cine=1.4;}
  if(e.kind===K.tower){const l=Math.hypot(dx,dz)||1;emit('topple',e.x,0,e.z,e.kind,0,0,0,'');addChain(1,e.x,e.z,dx/l,dz/l,ball,.22);}
  if(e.kind===K.barrel){addChain(2,e.x,e.z,0,0,ball,.12);}
  if(e.gold&&e.kind===K.target&&state.hearts<BB.hearts){state.hearts++;state.stats.heartsBack++;emit('heart',e.x,e.h,e.z,e.kind,0,state.hearts,0,'HEART BACK!');}
  else if(e.gold){const p=1+Math.floor(rnd()*4);state.power=p;state.powerN=p===P.slow?0:BB.powerShots;if(p===P.slow)state.slowT=BB.slowFor;state.stats.powers++;emit('power',e.x,e.h,e.z,0,0,p,0,P_WORD[p]);}
 }
 function runChain(c:Chain){
  if(c.kind===1){// the tower falls 2.6 m along its direction: everything it lands on takes a knock
   emit('topple',c.x+c.dx*1.3,0,c.z+c.dz*1.3,K.tower,0,1,0,'');
   for(const e of ents){if(!e.on||e.dead)continue;const ox=e.x-c.x,oz=e.z-c.z,along=ox*c.dx+oz*c.dz,side=Math.abs(ox*c.dz-oz*c.dx);if(along>0&&along<2.8+e.r&&side<.7+e.r)damage(e,1,c.ball,c.dx,c.dz);}
  }else if(c.kind===3){emit('boom',c.x,.6,c.z,0,0,1,0,'');// a super shot's burst: smaller than a barrel
   for(const e of ents){if(!e.on||e.dead)continue;const d=Math.hypot(e.x-c.x,e.z-c.z);if(d<BB.supBurst+e.r)damage(e,1,c.ball,e.x-c.x,e.z-c.z);}
  }else{emit('boom',c.x,.6,c.z,K.barrel,0,0,0,'');
   for(const e of ents){if(!e.on||e.dead)continue;const d=Math.hypot(e.x-c.x,e.z-c.z);if(d<2.7+e.r)damage(e,e.kind===K.boss?2:1,c.ball,e.x-c.x,e.z-c.z);}}
 }
 function endBall(b:Ball){if(!b.on)return;b.on=false;
  if(b.kills>=2){const pts=BB.trickBonus*(b.kills-1);state.score+=pts;state.stats.tricks++;state.stats.bestTrick=Math.max(state.stats.bestTrick,b.kills);emit('trick',b.x,b.y,b.z,0,pts,b.kills,0,b.kills>=4?'MEGA TRICK!':'TRICK SHOT!');}}

 /* ---- one fixed step ---- */
 function step(){
  const dt=BB.step;state.t+=dt;if(state.over)return;
  const cine=state.cine>0?.3:1,edt=dt*cine*(state.slowT>0?.4:1),bdt=dt*cine;
  if(state.cine>0)state.cine-=dt;if(state.slowT>0){state.slowT-=dt;if(state.slowT<=0&&state.power===P.slow)state.power=0;}
  // the rack rolls a new ball in
  if(state.rack<BB.rack){state.refillT+=dt;if(state.refillT>=BB.refill){state.refillT-=BB.refill;state.rack++;}}else state.refillT=0;
  // waves
  state.modeT-=dt;
  if(state.mode==='intro'||state.mode==='break'){if(state.modeT<=0){
    if(state.bonusDue){state.bonusDue=false;state.mode='bonus';state.bonusT=0;state.bonusI=0;state.bonusHits=0;for(const e of ents)if(e.on&&!isMachine(e.kind))e.on=false;emit('bonus',0,0,0,0,0,1,0,'TARGET PRACTICE!');}
    else startWave();}}
  else if(state.mode==='bonus'){// targets pop up one after another; none can cost a heart; the sixth is gold (a heart back, or a power-up)
   state.bonusT+=dt;
   while(state.bonusI<BB.bonusN&&state.bonusT>=.6+state.bonusI*.72){const i=state.bonusI++,z=-10-rnd()*17,w=halfW(z)-1;let x=(rnd()*2-1)*w;for(const o of ents)if(o.on&&o.kind===K.target&&Math.hypot(o.x-x,o.z-z)<1.8)x=-x;const e=place(K.target,x,z,i===5);if(e)e.cd=BB.targetLife;}
   if(state.bonusT>=BB.bonusSecs){for(const e of ents)if(e.on&&e.kind===K.target)e.on=false;state.mode='break';state.modeT=1.8;emit('bonus',0,0,0,0,0,0,state.bonusHits,'');}}
  else{state.waveT+=edt;
   while(state.spawnI<state.spawnN&&spawns[state.spawnI].t<=state.waveT){const s=spawns[state.spawnI++];place(s.kind,s.x,BB.spawnZ,s.gold);if(s.say)emit('shout',s.x,2.4,BB.spawnZ+4,s.kind,0,s.say,0,SET_WORD[s.say]);}
   let alive=false;for(const e of ents)if(e.on&&isMachine(e.kind)){alive=true;break;}
   if(!alive&&state.spawnI>=state.spawnN){const shots=state.waveShots,acc=shots?state.waveHits/shots:0,bonus=Math.round(acc*acc*400*(1+state.wave*.1)/10)*10;
    state.score+=bonus;state.stats.waves++;emit('clear',0,0,0,0,bonus,state.wave,Math.round(acc*100),'');state.mode='break';state.modeT=2.6;state.bonusDue=isBossWave(state.wave)||state.wave===BB.firstBonus;}}
  // machines march
  for(const e of ents){if(!e.on)continue;e.t+=edt;if(e.flash>0)e.flash-=dt;if(e.kind===K.target&&e.t>e.cd){e.on=false;continue;}if(!isMachine(e.kind))continue;
   // they hurry on from the far end, then settle into their march
   let v=e.z<BB.runOnZ&&e.kind!==K.boss?Math.max(e.speed,BB.runOn):e.speed;
   // a rocket-bot stops, winds up (the tell: about a second), then dashes; after the dash it walks
   if(e.kind===K.rocket){if(e.phase===0&&e.z>-25+e.ph){e.phase=1;e.cd=1.15;emit('tell',e.x,e.h,e.z,e.kind);}
    if(e.phase===1){v=0;e.cd-=edt;if(e.cd<=0){e.phase=2;e.cd=1.15;emit('dash',e.x,e.h,e.z,e.kind);}}else if(e.phase===2){v=9.5;e.cd-=edt;if(e.cd<=0)e.phase=3;}}
   if(e.kind===K.dummy)e.y=Math.abs(Math.sin(e.t*2.6+e.ph))*1.1;
   if(e.kind===K.drone){e.y=2+Math.sin(e.t*2.2+e.ph)*.35;e.tx=Math.sin(e.t*.9+e.ph)*halfW(e.z)*.7;}
   if(e.kind===K.dodger||e.kind===K.boss&&e.phase===2){e.cd-=edt;
    if(e.cd<=0)for(const b of balls){if(!b.on||b.vz>=0)continue;const ahead=b.z-e.z;if(ahead>0&&ahead<9&&Math.abs(b.x-e.x)<1.6+e.r){const w=halfW(e.z)-e.r;e.tx=e.x+(e.x>0?-1:1)*(e.kind===K.boss?2.6:1.9);if(Math.abs(e.tx)>w)e.tx=e.x+(e.tx>e.x?-1:1)*1.9;e.cd=e.kind===K.boss?2.2:1.6;emit('dodge',e.x,e.h,e.z,e.kind);break;}}}
   if(e.kind===K.boss){if(e.phase>=1){e.ph+=edt;if(e.ph>3.6){e.ph=0;for(const s of [-1,1]){const c=place(K.cone,Math.max(-halfW(e.z)+.5,Math.min(halfW(e.z)-.5,e.x+s*1.6)),e.z+.5,false);if(c)c.speed=SPEC[K.cone].v*rampAt(state.wave).speed;}}}if(e.phase===2)v*=1.6;}
   // walk around props in the way
   for(const o of ents){if(!o.on||isMachine(o.kind))continue;const dz=o.z-e.z,dx=e.x-o.x;if(dz>-.2&&dz<o.r+e.r+.8&&Math.abs(dx)<o.r+e.r+.15){e.tx=e.x+(dx>=0?1:-1)*.5;}}
   const w=halfW(e.z)-e.r*.8;e.tx=Math.max(-w,Math.min(w,e.tx));
   const sx=e.kind===K.boss?3:e.kind===K.dodger?7:2.2;e.x+=Math.max(-sx*edt,Math.min(sx*edt,e.tx-e.x));
   e.v=v;e.z+=v*edt;
   if(e.z>=BB.lineZ){// through: a heart
    state.hearts=Math.max(0,state.hearts-1);if(e.kind===K.boss)e.z=BB.spawnZ+6;else e.on=false;
    state.stats.leaks++;state.combo=0;emit('leak',e.x,1,BB.lineZ,e.kind,0,state.hearts,0,'');
    if(state.hearts<=0){state.over=true;for(const b of balls)b.on=false;emit('over',0,0,0,0,state.score,state.wave);return;}}}
  // balls fly
  for(const b of balls){if(!b.on)continue;b.t+=bdt;
   if(b.curl){b.vx+=b.ax*bdt;b.vz+=b.az*bdt;}
   b.vy-=BB.g*bdt;b.x+=b.vx*bdt;b.y+=b.vy*bdt;b.z+=b.vz*bdt;
   if(b.y<b.r){b.y=b.r;if(b.vy<-1.2){b.bounces++;if(b.bounces<4)emit('bounce',b.x,0,b.z,0,0,-b.vy);}b.vy=-b.vy*.52;b.vx*=.84;b.vz*=.84;b.curl=false;}
   // slanted side boards: x = ±(halfW(z)+BOARD_OUT); halfW grows .15 per metre up the pitch
   const lim=halfW(b.z)+BOARD_OUT-b.r;
   if(Math.abs(b.x)>lim&&b.z<BB.lineZ+.5){const s=Math.sign(b.x),nx=s,nz=.15,l=Math.hypot(nx,nz),ux=nx/l,uz=nz/l,dot=b.vx*ux+b.vz*uz;
    if(dot>0){b.vx-=1.75*dot*ux;b.vz-=1.75*dot*uz;b.ric=true;b.curl=false;emit('bounce',b.x,b.y,b.z,1,0,dot);}b.x=s*lim;}
   // what it meets
   for(const e of ents){if(!e.on||e.dead)continue;const top=e.y+e.h,cy=b.y<e.y?e.y:b.y>top?top:b.y,dx=b.x-e.x,dy=b.y-cy,dz=b.z-e.z,rr=e.r+b.r;
    if(dx*dx+dy*dy+dz*dz>rr*rr)continue;if(e.lastBall===b.id&&state.t-e.lastAt<.25)continue;e.lastBall=b.id;e.lastAt=state.t;
    const l=Math.hypot(dx,dy,dz)||1,nx=dx/l,ny=dy/l,nz=dz/l;
    if(!b.hit){b.hit=true;state.waveHits++;state.stats.hits++;}
    if(e.kind===K.glass){damage(e,1,b.id,b.vx,b.vz);continue;}
    if(e.kind===K.shield&&!b.fire&&!b.sup&&nz>.25&&Math.abs(b.vx)<.3*Math.abs(b.vz)&&!b.ric){
     // the shield faces the goal: a straight shot bounces off, a curl or a ricochet gets round it
     state.stats.blocks++;emit('block',b.x,b.y,b.z,e.kind);const d=b.vx*nx+b.vy*ny+b.vz*nz;if(d<0){b.vx-=1.6*d*nx;b.vy-=1.6*d*ny;b.vz-=1.6*d*nz;}b.ric=true;b.curl=false;continue;}
    const amt=e.kind===K.boss&&b.sup?2:b.dmg+(b.fire&&e.kind!==K.boss?1:0);damage(e,amt,b.id,b.vx,b.vz);
    if(b.sup){if(!e.on)addChain(3,e.x,e.z,0,0,b.id,.06);continue;}// a super shot goes through and bursts what it breaks
    if(b.fire)continue;// a fire ball goes through
    const bounce=e.kind===K.tyres?1.9:1.45,d=b.vx*nx+b.vy*ny+b.vz*nz;if(d<0){b.vx-=bounce*d*nx;b.vy-=bounce*d*ny;b.vz-=bounce*d*nz;}
    const k=e.kind===K.tyres?1.05:.8;b.vx*=k;b.vz*=k;b.ric=true;b.curl=false;b.x=e.x+nx*(rr+.01);b.z=e.z+nz*(rr+.01);if(b.y<e.y+e.h)b.y=Math.max(b.y,e.y+ny*(rr+.01));}
   const sp=Math.abs(b.vx)+Math.abs(b.vz)+Math.abs(b.vy);
   if(b.t>BB.ballLife||b.z<BB.farZ||b.z>BB.kz+3||(b.y<=b.r+.01&&sp<1.5))endBall(b);}
  // chains
  for(const c of chains){if(!c.on)continue;c.t-=edt;if(c.t<=0){c.on=false;runChain(c);}}
 }

 /* ---- the kick ---- */
 /** The launch for a shot at (tx,ty,tz) with charge 0..1 and curl -1..1, written into out [x,y,z,vx,vy,vz,ax,az]. */
 function launch(tx:number,ty:number,tz:number,power:number,curl:number,out:Float64Array|number[]){
  const x0=BB.kx,y0=BB.ky,z0=BB.kz;tz=Math.min(-1.5,Math.max(BB.farZ+2,tz));tx=Math.max(-halfW(tz)-.6,Math.min(halfW(tz)+.6,tx));ty=Math.max(.2,Math.min(4,ty));
  const dx=tx-x0,dz=tz-z0,d=Math.hypot(dx,dz)||1,p=Math.max(0,Math.min(1,power));
  const v=Math.max(BB.vMin,Math.min(BB.vMax,(BB.vMin+(BB.vMax-BB.vMin)*p)*(.55+.45*Math.min(1,d/28)))),T=d/v;
  const ux=dx/d,uz=dz/d,c=Math.max(-1,Math.min(1,curl)),a=c*BB.curl,px=-uz,pz=ux;// perpendicular (to the right of the line)
  // a curl starts out wide and bends back onto the aim point: it arrives from the side
  out[0]=x0;out[1]=y0;out[2]=z0;out[3]=ux*v-px*a*T*.5;out[4]=(ty-y0+.5*BB.g*T*T)/T;out[5]=uz*v-pz*a*T*.5;out[6]=px*a;out[7]=pz*a;
 }
 const L=[0,0,0,0,0,0,0,0];
 function fire(tx:number,ty:number,tz:number,power:number,curl:number,spread:number,sup=false){
  const b=balls.find(x=>!x.on);if(!b)return;launch(tx,ty,tz,power,curl,L);
  const cs=Math.cos(spread),sn=Math.sin(spread);
  b.on=true;b.id=state.nextId++;b.x=L[0];b.y=L[1];b.z=L[2];b.vx=L[3]*cs-L[5]*sn;b.vy=L[4];b.vz=L[3]*sn+L[5]*cs;b.ax=L[6];b.az=L[7];b.curl=Math.abs(curl)>.05;
  b.t=0;b.kills=0;b.hit=false;b.ric=false;b.bounces=0;b.shot=state.shotN;
  b.fire=state.power===P.fire;b.r=state.power===P.giant?BB.giantR:BB.ballR;b.dmg=(power>=BB.powerShot||state.power===P.giant?2:1);
  b.sup=sup;if(sup){b.r=Math.max(b.r,BB.supR);b.dmg=3;b.y=Math.max(b.y,b.r);}// a super ball starts on the turf, not in it, so it keeps its arc
  emit('shot',b.x,b.y,b.z,sup?4:b.fire?2:b.r>BB.ballR?3:0,0,power,curl);
 }
 function shoot(tx:number,ty:number,tz:number,power:number,curl=0){
  if(state.over)return false;if(state.rack<=0){emit('empty',BB.kx,BB.ky,BB.kz);return false;}
  state.rack--;state.shotN++;state.stats.shots++;state.waveShots++;if(Math.abs(curl)>.05)state.stats.curls++;
  const sup=state.supReady&&power>=BB.powerShot;if(sup){state.supReady=false;state.sup=0;state.stats.supers++;emit('super',BB.kx,1,BB.kz,0,0,1,0,'SUPER SHOT!');}
  if(state.power===P.multi){for(const s of [-.11,0,.11])fire(tx,ty,tz,power,curl,s,sup&&s===0);}else fire(tx,ty,tz,power,curl,0,sup);
  if(state.power&&state.power!==P.slow&&--state.powerN<=0)state.power=0;
  return true;
 }
 /** The flight with no collisions (the aim arc): writes up to n points (x,y,z) into out, returns how many. */
 function predict(tx:number,ty:number,tz:number,power:number,curl:number,out:Float32Array,n:number){
  launch(tx,ty,tz,power,curl,L);let x=L[0],y=L[1],z=L[2],vx=L[3],vy=L[4],vz=L[5];const ax=L[6],az=L[7],h=1/60;let i=0,k=0,bent=true;
  while(i<n&&k<400){k++;if(bent){vx+=ax*h;vz+=az*h;}vy-=BB.g*h;x+=vx*h;y+=vy*h;z+=vz*h;if(y<BB.ballR){y=BB.ballR;vy=-vy*.52;bent=false;if(i>n*.6)break;}
   if(k%2===0){out[i*3]=x;out[i*3+1]=y;out[i*3+2]=z;i++;}if(z<BB.farZ)break;}
  return i;
 }
 return {state,get clock(){return clock;},
  advance(dt:number){if(!(dt>0))return;clock+=dt;acc+=dt;while(acc>=BB.step-1e-9){acc-=BB.step;step();}},
  drain(fn:(e:BlastEvent)=>void){for(let i=0;i<evN;i++)fn(events[i]);evN=0;},
  shoot,predict,launch,
  /** for tests and bots: a copy of the run */
  snapshot(){return JSON.stringify({state:{...state,ents:undefined,balls:undefined,chains:undefined,spawns:undefined},ents,balls,chains,spawns,clock,acc});},
 };
}
