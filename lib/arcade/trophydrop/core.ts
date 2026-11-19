/**
 * Trophy Drop (Nov 17 2026, docs/arcade-aaa/trophydrop-direction.md): the rules and the physics, pure and seeded. No DOM, no time of
 * its own: the shell calls step(dt) and the core runs a FIXED 1/120 s step (an accumulator), so one seed and one list of inputs always
 * give the same run (tests/trophydrop-core.cjs). World units: the glass cabinet is TD.w wide and TD.h tall, x right, y DOWN.
 * Physics: a small position-based circle solver. Each step: gravity, move (speed capped so nothing moves more than half the smallest
 * radius in one step: no tunnelling), then TD.iters passes that push overlapping circles apart (heavier ones move less) and clamp every
 * circle inside the walls, floor and lid; velocity is read back from the move (stable stacks, no springs). When everything is slow for
 * TD.calm s the world SLEEPS (no physics until a drop, a merge or a wall move) so a phone stays cool on a settled cabinet.
 * Merge: two touching items of one tier become the next tier (two golden trophies leave together for a big bonus). A merge whose new
 * item merges again within TD.chainWindow s is a CHAIN: points x chain depth (capped). The beach ball is bouncy and cannot merge until
 * two hard hits deflate it into a size-5 ball. The run ends when settled items stay above the top line for TD.overHold s.
 * AAA pass (Nov 18 2026): the queue shows TWO items ahead; a drop asked for during the cooldown is BUFFERED (it goes the moment the
 * cooldown ends, never lost); a first landing has a small bounce (lighter items bounce more) and every item carries a cosmetic angle
 * (balls roll, the big items rock and stand up again); a merge gives its neighbours a small push outward; TOUCH STREAK: a dropped item
 * that merges within TD.streakAge s keeps the streak, TD.streakNeed in a row earn one SHAKE (hold 1, at most TD.shakeMax a run): the
 * player's rescue, a jolt that lifts the pile and stops the top-line clock for TD.shakeGrace s; GOLDEN DOUBLE also opens the cabinet
 * again by TD.reliefLevels levels of wall and floor. No new points anywhere: every point still comes from a merge.
 */
export const TD={
 w:100,h:150,line:30,dropY:16,gravity:420,dt:1/120,iters:7,vmax:260,cool:.42,grace:1,overHold:2,calm:.45,calmSpeed:7,
 grow:70,chainWindow:1,chainCap:5,doubleBonus:640,beachHits:2,beachHitSpeed:45,beachBounce:.62,landSpeed:28,
 perLevel:18,wallSpeed:9,maxEvents:64,maxBodies:90,
 streakAge:1.5,streakNeed:5,shakeMax:3,shakeGrace:1.4,reliefLevels:2,mergeGrace:.35,warnPreview:4,
 medals:[1500,5000,12000] as const,
} as const;
/** The nine tiers, small to big. r = radius in world units, pts = points for MAKING this tier by a merge. */
export const TIERS=[
 {key:'ball1',name:'Size-1 ball',r:4.2,pts:0,color:'#fff3d6'},
 {key:'ball3',name:'Size-3 ball',r:5.6,pts:2,color:'#ffc83a'},
 {key:'ball5',name:'Size-5 ball',r:7.3,pts:5,color:'#ff8a3c'},
 {key:'boot',name:'Boot',r:9.2,pts:10,color:'#f0452e'},
 {key:'glove',name:'Keeper glove',r:11.2,pts:20,color:'#19b5a5'},
 {key:'medal',name:'Medal',r:13.4,pts:40,color:'#8f78b8'},
 {key:'shield',name:'Shield',r:15.9,pts:80,color:'#3f9a5c'},
 {key:'cup',name:'Cup',r:18.8,pts:160,color:'#c0c6d4'},
 {key:'trophy',name:'Golden trophy',r:22,pts:320,color:'#ffd24a'},
] as const;
export const TOP_TIER=TIERS.length-1,BEACH=-1;
/** Beach ball: as big as a size-5 ball; it becomes one when it deflates. */
export const BEACH_R=TIERS[2].r,BEACH_TIER_AFTER=2;
export const MEDAL_NAMES=['Bronze','Silver','Gold'] as const;
export function medalFor(score:number){let m=0;for(const t of TD.medals)if(score>=t)m++;return m;}
export function nextMedalLine(score:number):{medal:number;next:string|null;gap:number}{const m=medalFor(score);return m>=TD.medals.length?{medal:m,next:null,gap:0}:{medal:m,next:MEDAL_NAMES[m],gap:TD.medals[m]-score};}
/** The day's seed: the same drop list for everyone that play day. */
export function trophyDailySeed(day:string){let h=0x811c9dc5;const s='trophydrop:'+day;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return 1+h%2_000_000_000;}
/** Coins: 1 per 150 points, capped by lib/economy ARCADE_COIN_CAPS (the shell goes through arcadeCoinTarget). */
export const trophyCoins=(score:number)=>Math.floor(Math.max(0,score)/150);

/** The ramp. level = 1 + drops / TD.perLevel, for ever. w = drop weights for tiers 0-4 (leaning to the awkward big sizes as the
 *  run goes on), beach = chance a drop is a beach ball, inset = how far each wall has moved in, rise = how far the floor has come up.
 *  Every column only ever gets harder (tests/trophydrop-core.cjs). */
const EARLY=[36,30,22,11,1],LATE=[12,18,26,26,18];
export function rampFor(level:number){
 const L=Math.max(1,Math.floor(level)),f=1-Math.pow(.86,L-1);
 return {level:L,w:EARLY.map((e,i)=>e+(LATE[i]-e)*f),beach:L<3?0:Math.min(.2,.05+.025*(L-3)),inset:Math.min(9,1.2*(L-1)),rise:Math.min(24,2.5*(L-1))};
}

export type Body={id:number;t:number;x:number;y:number;px:number;py:number;vx:number;vy:number;r:number;tr:number;
 /** seconds since it entered the cabinet */age:number;born:number;chain:number;fromMerge:boolean;landed:boolean;hits:number;hitCool:number;
 /** cosmetic: angle (rad) and spin (rad/s); balls roll, tiers 3+ rock and stand up again */a:number;w:number;/** a dropped item still inside its streak window */judge:boolean;
 /** squash 0..1 (the view squashes on landing), and which way */sq:number;floor:boolean;merged:boolean;
 /** beach ball only: the bounce to add after this step */bounce:[number,number]|null};
export type TrophyEventType='drop'|'land'|'merge'|'double'|'hit'|'pop'|'level'|'warn'|'safe'|'over'|'streak'|'miss'|'shake'|'earn';
/** merge: a = new tier, b = points, c = chain; double: b = points, c = chain; land: a = tier, b = impact speed; hit: a = hits so far;
 *  level: a = level; warn: a = seconds left; safe: a = the worst the clock got (tenths of a second); streak: a = merges in a row, b = steps
 *  toward the next shake; miss: a = the streak that ended; shake: a = shakes left; earn: a = shakes held. x, y = where (world units). */
export type TrophyEvent={type:TrophyEventType;x:number;y:number;a:number;b:number;c:number};
export type TrophyStats={drops:number;merges:number;bestTier:number;bestChain:number;doubles:number;made:number[];beaches:number;pops:number;bestStreak:number;shakes:number};

function mulberry(seed:number){let a=seed>>>0;return()=>{a=(a+0x6d2b79f5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}

export type TrophyDrop=ReturnType<typeof createTrophyDrop>;
export function createTrophyDrop(opts:{seed:number;daily?:boolean}){
 const rnd=mulberry(opts.seed),rndShake=mulberry((opts.seed^0x5bd1e995)>>>0);// the shake has its own stream: using it never changes the drop list
 const s={seed:opts.seed,daily:!!opts.daily,time:0,acc:0,bodies:[] as Body[],nextId:1,cur:0,next:0,next2:0,aim:TD.w/2,cool:0,queued:false,streak:0,charge:0,shakes:0,shakesEarned:0,shakeGrace:0,relief:0,peak:0,drops:0,level:1,score:0,
  danger:0,warned:false,near:false,over:false,asleep:false,calmFor:0,left:0,right:TD.w as number,floor:TD.h as number,goalLeft:0,goalRight:TD.w as number,goalFloor:TD.h as number,
  stats:{drops:0,merges:0,bestTier:0,bestChain:0,doubles:0,made:[0,0,0,0,0,0,0,0,0],beaches:0,pops:0,bestStreak:0,shakes:0} as TrophyStats,
  /** physics steps actually run (a sleeping world adds none): tests and the heat probe read it */steps:0};
 const events:TrophyEvent[]=Array.from({length:TD.maxEvents},()=>({type:'drop' as TrophyEventType,x:0,y:0,a:0,b:0,c:0}));let en=0;
 function emit(type:TrophyEventType,x:number,y:number,a=0,b=0,c=0){if(en>=events.length)return;const e=events[en++];e.type=type;e.x=x;e.y=y;e.a=a;e.b=b;e.c=c;}
 /** The next item in the queue: a tier 0-4, or BEACH. */
 function deal(){const r=rampFor(s.level);if(r.beach>0&&rnd()<r.beach)return BEACH;let sum=0;for(const w of r.w)sum+=w;let k=rnd()*sum;for(let i=0;i<r.w.length;i++){k-=r.w[i];if(k<0)return i;}return 0;}
 s.cur=0;s.next=deal();s.next2=deal();// the first drop is always the smallest ball (a kind start, also on the daily)
 const radiusOf=(t:number)=>t===BEACH?BEACH_R:TIERS[t].r;
 function add(t:number,x:number,y:number,vx:number,vy:number,r:number,fromMerge:boolean,chain:number):Body{
  const b:Body={id:s.nextId++,t,x,y,px:x,py:y,vx,vy,r,tr:radiusOf(t),age:fromMerge?TD.grace:0,born:s.time,chain,fromMerge,landed:fromMerge,hits:0,hitCool:0,a:0,w:0,judge:!fromMerge&&t!==BEACH,sq:0,floor:false,merged:false,bounce:null};
  s.bodies.push(b);return b;
 }
 /** Where the held item may hang: inside the walls for its size. */
 const aimRange=(t:number)=>{const r=radiusOf(t);return [s.left+r+.5,s.right-r-.5] as const;};
 function aim(x:number){if(!Number.isFinite(x))return;const [lo,hi]=aimRange(s.cur);s.aim=Math.max(lo,Math.min(hi,x));}
 function drop(){
  if(s.over||s.bodies.length>=TD.maxBodies)return false;
  if(s.cool>0){s.queued=true;return false;}// buffered: fixed() lets it go the moment the cooldown ends
  s.queued=false;
  const t=s.cur,r=radiusOf(t),[lo,hi]=aimRange(t),x=Math.max(lo,Math.min(hi,s.aim));
  add(t,x,Math.max(r+.5,TD.dropY),0,40,r,false,0);if(t===BEACH)s.stats.beaches++;
  s.cur=s.next;s.next=s.next2;s.next2=deal();s.cool=TD.cool;s.drops++;s.stats.drops=s.drops;s.asleep=false;s.calmFor=0;emit('drop',x,TD.dropY,t);
  const lv=1+Math.floor(s.drops/TD.perLevel);if(lv>s.level){s.level=lv;goals();emit('level',TD.w/2,TD.h/2,lv);}
  aim(s.aim);return true;
 }
 /** Where the walls and floor belong: the level's ramp, opened again by TD.reliefLevels levels for every golden double. */
 const wallsFor=(level:number)=>{const R=rampFor(Math.max(1,level-s.relief*TD.reliefLevels));return {left:R.inset,right:TD.w-R.inset,floor:TD.h-R.rise};};
 function goals(){const W=wallsFor(s.level);s.goalLeft=W.left;s.goalRight=W.right;s.goalFloor=W.floor;}
 const toward=(v:number,goal:number,max:number)=>v<goal?Math.min(goal,v+max):Math.max(goal,v-max);
 function physics(){
  const dt=TD.dt,B=s.bodies,n=B.length,cap=TD.vmax;s.steps++;
  // the walls and floor close in slowly after a level up (they push the items; the solver resolves the squeeze)
  const step=TD.wallSpeed*dt;s.left=toward(s.left,s.goalLeft,step);s.right=toward(s.right,s.goalRight,step);s.floor=toward(s.floor,s.goalFloor,step);if(s.left!==s.goalLeft||s.right!==s.goalRight)aim(s.aim);
  for(let i=0;i<n;i++){const b=B[i];b.merged=false;b.floor=false;b.age+=dt;if(b.hitCool>0)b.hitCool-=dt;if(b.sq>0)b.sq=Math.max(0,b.sq-dt*5);
   if(b.r<b.tr)b.r=Math.min(b.tr,b.r+TD.grow*dt);
   b.vy+=TD.gravity*dt;const sp=Math.hypot(b.vx,b.vy);if(sp>cap){b.vx*=cap/sp;b.vy*=cap/sp;}
   b.px=b.x;b.py=b.y;b.x+=b.vx*dt;b.y+=b.vy*dt;}
  for(let it=0;it<TD.iters;it++){
   const last=it===TD.iters-1;
   for(let i=0;i<n;i++){const a=B[i];for(let j=i+1;j<n;j++){const b=B[j],dx=b.x-a.x,dy=b.y-a.y,rr=a.r+b.r;if(dx>rr||dx<-rr||dy>rr||dy<-rr)continue;const d2=dx*dx+dy*dy;if(d2>=rr*rr)continue;
    const d=Math.sqrt(d2)||1e-6,nx=d2>0?dx/d:0,ny=d2>0?dy/d:1,ov=rr-d,ma=a.r*a.r,mb=b.r*b.r,wa=mb/(ma+mb),wb=ma/(ma+mb);
    a.x-=nx*ov*wa;a.y-=ny*ov*wa;b.x+=nx*ov*wb;b.y+=ny*ov*wb;
    if(last)contact(a,b,nx,ny);}}
   for(let i=0;i<n;i++)walls(B[i],last);
  }
  for(let i=0;i<n;i++){const b=B[i],ovy=b.vy;b.vx=(b.x-b.px)/dt;b.vy=(b.y-b.py)/dt;
   if(b.floor){b.vx*=b.t===BEACH?.995:.94;if(b.t===BEACH&&ovy>60)b.vy=-ovy*TD.beachBounce;}
   else{b.vx*=.998;}
   if(b.bounce){b.vx+=b.bounce[0];b.vy=b.t===BEACH?b.vy+b.bounce[1]:b.bounce[1];b.bounce=null;}
   // the cosmetic angle: balls roll with their sideways speed; the big items rock with it and a spring stands them up again
   if(b.t===BEACH||b.t<3){b.w=b.vx/b.r;b.a+=b.w*dt;}else{b.w+=(b.vx*.9/b.r-b.a*60-b.w*9)*dt;b.a+=b.w*dt;if(b.a>.5)b.a=.5;else if(b.a<-.5)b.a=-.5;}}
  merges();
  // sleep: everything slow for a moment and the walls where they belong
  let calm=s.left===s.goalLeft&&s.right===s.goalRight&&s.floor===s.goalFloor;
  if(calm)for(let i=0;i<B.length;i++){const b=B[i];if(b.r<b.tr||b.vx*b.vx+b.vy*b.vy>TD.calmSpeed*TD.calmSpeed){calm=false;break;}}
  if(calm){s.calmFor+=dt;if(s.calmFor>=TD.calm){s.asleep=true;for(const b of B){b.vx=0;b.vy=0;}}}else s.calmFor=0;
 }
 function walls(b:Body,last:boolean){
  const r=b.r;if(b.x<s.left+r)b.x=s.left+r;else if(b.x>s.right-r)b.x=s.right-r;
  if(b.y>s.floor-r){b.y=s.floor-r;b.floor=true;}else if(b.y<r)b.y=r;
  // Nov 18 2026: was inside the clamp above, which only the FIRST pass reaches, so an item landing on the bare floor never landed (no sound, no squash)
  if(last&&b.floor&&!b.landed)land(b,b.vy);
  // a cabinet narrower than the item (cannot happen with these sizes; kept so nothing can ever leave it)
  if(s.right-s.left<2*r)b.x=(s.left+s.right)/2;
 }
 function land(b:Body,speed:number){b.landed=true;if(speed>TD.landSpeed){b.sq=Math.min(1,speed/260);emit('land',b.x,b.y+b.r,b.t,Math.round(speed));
   if(b.t!==BEACH&&!b.bounce)b.bounce=[0,-speed*Math.max(.05,.2-b.t*.02)];}}// one small hop: light items bounce more than heavy ones
 function contact(a:Body,b:Body,nx:number,ny:number){
  // approach speed from the velocities before this step (positive = closing)
  const ap=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;
  if(!a.landed)land(a,Math.max(ap,a.vy));if(!b.landed)land(b,Math.max(-ap,b.vy));
  for(const [p,q,sg] of [[a,b,1],[b,a,-1]] as const){if(p.t!==BEACH)continue;
   if(ap>TD.beachHitSpeed&&p.hitCool<=0&&q.t!==BEACH){p.hitCool=.25;p.hits++;emit('hit',p.x,p.y,p.hits);}
   if(ap>20){const k=ap*TD.beachBounce;p.bounce=[-nx*k*sg*.5,-ny*k*sg*.5];}}
 }
 function merges(){
  const B=s.bodies;let removed=false;
  for(let i=0;i<B.length;i++){const a=B[i];if(a.merged)continue;
   if(a.t===BEACH){if(a.hits>=TD.beachHits){a.t=BEACH_TIER_AFTER;a.tr=TIERS[BEACH_TIER_AFTER].r;a.hits=0;s.stats.pops++;emit('pop',a.x,a.y,BEACH_TIER_AFTER);}continue;}
   for(let j=i+1;j<B.length;j++){const b=B[j];if(b.merged||b.t!==a.t)continue;const dx=b.x-a.x,dy=b.y-a.y,rr=a.r+b.r+.6;if(dx*dx+dy*dy>rr*rr)continue;
    const live=(q:Body)=>q.fromMerge&&s.time-q.born<=TD.chainWindow,fresh=(q:Body)=>!q.fromMerge&&q.age<TD.grace,chain=(live(a)&&!fresh(b))||(live(b)&&!fresh(a))?Math.max(a.chain,b.chain)+1:1,mult=Math.min(TD.chainCap,chain);
    const ma=a.r*a.r,mb=b.r*b.r,x=(a.x*ma+b.x*mb)/(ma+mb),y=(a.y*ma+b.y*mb)/(ma+mb);a.merged=b.merged=true;removed=true;s.stats.merges++;
    if(a.judge||b.judge)touch(x,y);
    if(chain>s.stats.bestChain)s.stats.bestChain=chain;
    if(a.t===TOP_TIER){const pts=TD.doubleBonus*mult;s.score+=pts;s.stats.doubles++;s.relief++;goals();push(x,y,TIERS[TOP_TIER].r*1.4,60);emit('double',x,y,TOP_TIER,pts,chain);}
    else{const t=a.t+1,pts=TIERS[t].pts*mult;s.score+=pts;s.stats.made[t]++;if(t>s.stats.bestTier)s.stats.bestTier=t;
     const nb=add(t,x,y,(a.vx+b.vx)*.3,Math.min(0,(a.vy+b.vy)*.3)-30,Math.max(a.r,b.r),true,chain);nb.age=TD.grace-TD.mergeGrace;nb.a=(a.a+b.a)*.25;push(x,y,TIERS[t].r,16+t*2);emit('merge',x,y,t,pts,chain);}
    break;}
  }
  if(removed){s.bodies=B.filter(b=>!b.merged);s.asleep=false;s.calmFor=0;}
 }
 /** A merge pops: the items around it get a small push away (lighter ones more). */
 function push(x:number,y:number,r:number,power:number){for(const q of s.bodies){if(q.merged)continue;const dx=q.x-x,dy=q.y-y,d=Math.hypot(dx,dy),reach=r+q.r+4;if(d>=reach||d<1e-6)continue;const k=power*(1-d/reach)*Math.min(1,(r*r)/(q.r*q.r));q.vx+=dx/d*k;q.vy+=dy/d*k;}}
 /** Touch streak: a dropped item merged inside its window. Every TD.streakNeed in a row earn one shake. */
 function touch(x:number,y:number){
  s.streak++;if(s.streak>s.stats.bestStreak)s.stats.bestStreak=s.streak;
  if(s.shakes<1&&s.shakesEarned<TD.shakeMax){s.charge++;if(s.charge>=TD.streakNeed){s.charge=0;s.shakes=1;s.shakesEarned++;emit('earn',x,y,s.shakes);}}
  emit('streak',x,y,s.streak,s.charge);
 }
 /** The rescue: a jolt that lifts and loosens the pile (light items jump more) and holds the top-line clock for TD.shakeGrace s. */
 function shake(){
  if(s.over||s.shakes<1)return false;s.shakes--;s.stats.shakes++;s.shakeGrace=TD.shakeGrace;s.asleep=false;s.calmFor=0;
  for(const b of s.bodies){const light=Math.max(.35,1-(b.t===BEACH?2:b.t)*.08);b.vy=-(120+rndShake()*70)*light;b.vx+=(rndShake()*2-1)*70*light;}
  emit('shake',TD.w/2,TD.h/2,s.shakes);return true;
 }
 function danger(dt:number){
  let above=false,near=false;for(const b of s.bodies){if(!b.landed||b.age<TD.grace)continue;const top=b.y-b.r;if(top<TD.line)above=true;else if(top<TD.line+12)near=true;}
  s.near=near||above;if(s.shakeGrace>0){s.shakeGrace=Math.max(0,s.shakeGrace-dt);above=false;}
  if(above){s.danger+=dt;if(s.danger>s.peak)s.peak=s.danger;if(!s.warned){s.warned=true;emit('warn',TD.w/2,TD.line,TD.overHold);}if(s.danger>=TD.overHold){s.over=true;emit('over',TD.w/2,TD.line);}}
  else{s.danger=Math.max(0,s.danger-dt*2);if(s.warned&&s.danger<=0){s.warned=false;emit('safe',TD.w/2,TD.line,Math.round(s.peak*10));s.peak=0;}}
 }
 function fixed(){
  s.time+=TD.dt;if(s.cool>0)s.cool=Math.max(0,s.cool-TD.dt);if(s.queued&&s.cool<=0)drop();
  for(const b of s.bodies){if(s.asleep)b.age+=TD.dt;
   // a dropped item that did not merge in time ends the touch streak (and empties the charge toward the next shake)
   if(b.judge&&b.landed&&b.age>=TD.streakAge){b.judge=false;if(s.streak>0||s.charge>0){emit('miss',b.x,b.y,s.streak);s.streak=0;s.charge=0;}}}
  if(!s.asleep)physics();
  danger(TD.dt);
 }
 return {
  state:s,events,
  aim,drop,shake,
  /** The walls and floor the NEXT level brings (the view draws them as a dashed warning in the last TD.warnPreview drops of a level). */
  get nextWalls(){return wallsFor(s.level+1);},
  /** Drops left before the next level. */
  get dropsToLevel(){return TD.perLevel-s.drops%TD.perLevel;},
  /** True while the world is moving (a sleeping, settled cabinet returns false: the shell may stop drawing). */
  get awake(){return !s.asleep;},
  /** Nothing can change until the player acts: asleep, no cooldown, nothing over the line, no fresh item still in its grace time. */
  get idle(){if(!s.asleep||s.cool>0||s.queued||s.danger>0||s.shakeGrace>0||s.over)return false;for(const b of s.bodies)if(b.age<TD.grace||b.judge)return false;return true;},
  /** Runs fixed steps for dt seconds of play (dt is clamped by the caller). */
  step(dt:number){if(s.over)return;s.acc+=Math.max(0,Math.min(.1,dt));while(s.acc>=TD.dt&&!s.over){s.acc-=TD.dt;fixed();}},
  drain(fn:(e:TrophyEvent)=>void){for(let i=0;i<en;i++)fn(events[i]);en=0;},
  radiusOf,aimRange,
 };
}
