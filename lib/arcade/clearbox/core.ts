/**
 * Clear the Box (Nov 17 2026, docs/arcade-aaa/clearbox-direction.md): the tap-out cabinet. Pure rules, no DOM, seeded (mulberry32)
 * so a seed always deals the same boxes: the Daily Drill gives everybody the same boxes that day.
 * A crowded penalty box seen from above. Every bean faces up, right, down or left. Tap a bean: if its lane to the edge of the box is
 * empty it runs out and is cleared; if another bean or a defender stands in the lane it bumps (a foul: one of three whistles is
 * lost and the bean stays). Clear every bean before the box clock runs out and the next, more crowded box arrives at once.
 * Boxes are built BACKWARDS from the empty box: each bean is added only where its lane is clear of the beans already placed, so the
 * reverse of the build order always clears the box (tests/clearbox-core.cjs checks it with a solver).
 * Ramp (RAMP, by box): more beans, a bigger box (longer lanes), more tangle (beans placed in other beans' lanes), defenders who never
 * move, a shorter clock, and from box 5 "turners": beans that turn 90 degrees clockwise every time a bean leaves.
 * The run ends on the third foul or when a box clock runs out.
 * Teaches (AGENTS.md): "Time your run. Make the space." A run only works into space; a team-mate moving away makes that space.
 */
export const CB={
 whistles:3,
 /** points: a bean out = beanPts x level factor; a box cleared = boxPts x level factor + secPts a whole second left on the clock;
  *  a clean box (no foul in it) multiplies the box bonus by the clean streak (x1.5, x2 ... up to x4). */
 beanPts:10,boxPts:100,secPts:10,
 streakStep:.5,streakMax:4,levelStep:.1,levelMax:3,
 /** three clean boxes in a row win back a lost whistle (never above three). */
 whistleBack:3,
 /** the clock waits this long when a box arrives (it slides in), so no time is lost to the transition. */
 grace:.45,
 medals:[2500,6000,14000] as readonly number[],
} as const;
export const MEDAL_NAMES=['Bronze','Silver','Gold'] as const;
export function medalFor(score:number){let m=0;for(const t of CB.medals)if(score>=t)m++;return m;}
export function nextMedalLine(score:number):{medal:number;next:string|null;gap:number}{const m=medalFor(score);return m>=CB.medals.length?{medal:m,next:null,gap:0}:{medal:m,next:MEDAL_NAMES[m],gap:CB.medals[m]-score};}
export const clearboxCoins=(score:number)=>Math.floor(Math.max(0,score)/400);
export const levelFactor=(level:number)=>Math.min(CB.levelMax,1+CB.levelStep*(Math.max(1,level)-1));
export const streakFactor=(streak:number)=>Math.min(CB.streakMax,1+CB.streakStep*Math.max(0,streak-1));

/** Ramp by box (index = box - 1). w x h: the box in cells; beans; defs: defenders; turn: turners; tangle: share of beans placed to
 *  block other beans (0 = random, 1 = always the most tangled spot); time: the box clock in seconds. After the table: one more bean
 *  every two boxes (up to 60% of the box) and the clock half a second shorter every box, down to 9 s. */
export const RAMP:readonly {w:number;h:number;beans:number;defs:number;turn:number;tangle:number;time:number}[]=[
 {w:5,h:5,beans:5,defs:0,turn:0,tangle:.2,time:30},
 {w:5,h:6,beans:7,defs:0,turn:0,tangle:.35,time:30},
 {w:6,h:6,beans:9,defs:1,turn:0,tangle:.5,time:29},
 {w:6,h:7,beans:11,defs:1,turn:0,tangle:.6,time:28},
 {w:6,h:7,beans:13,defs:2,turn:1,tangle:.65,time:27},
 {w:7,h:7,beans:15,defs:2,turn:1,tangle:.7,time:26},
 {w:7,h:8,beans:17,defs:3,turn:2,tangle:.75,time:25},
 {w:7,h:8,beans:19,defs:3,turn:2,tangle:.8,time:24},
 {w:7,h:9,beans:21,defs:3,turn:3,tangle:.85,time:23},
 {w:7,h:9,beans:23,defs:4,turn:3,tangle:.9,time:22},
];
export type BoxRule=(typeof RAMP)[number];
export function rampFor(level:number):BoxRule{
 const L=Math.max(1,Math.floor(level)),last=RAMP[RAMP.length-1];if(L<=RAMP.length)return RAMP[L-1];const k=L-RAMP.length;
 return {...last,beans:Math.min(Math.floor(last.w*last.h*.6),last.beans+Math.floor(k/2)),turn:Math.min(6,last.turn+Math.floor(k/4)),time:Math.max(9,last.time-k*.5),tangle:Math.min(.95,last.tangle+k*.01)};
}

/** Directions: 0 up, 1 right, 2 down, 3 left. */
export const DX=[0,1,0,-1] as const,DY=[-1,0,1,0] as const;
export type Bean={id:number;x:number;y:number;dir:number;turner:boolean;kit:number;out:boolean};
export type Box={w:number;h:number;level:number;beans:Bean[];defs:number[];time:number;
 /** the build order reversed: one way to clear the box (tests only; the game never shows it). */plan:number[]};

export function clearboxDailySeed(day:string){let h=0x811c9dc5;const s='clearbox:'+day;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return 1+h%2_000_000_000;}
export function mulberry(seed:number){let a=seed>>>0;return()=>{a=(a+0x6d2b79f5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
/** Kit colours (house comic palette): red, teal, sun, orange, sky, violet. */
export const KIT=['#f0452e','#19b5a5','#ffc83a','#ff8a3c','#4a9fe0','#8f78b8'] as const;
export const KIT_DARK=['#b02a3a','#0f7f86','#d98a1c','#c95f1e','#2c6fb0','#62508f'] as const;

/** The cells a bean at x,y facing dir passes on its way out (nearest first). */
export function laneCells(w:number,h:number,x:number,y:number,dir:number){const out:number[]=[];let X=x+DX[dir],Y=y+DY[dir];while(X>=0&&Y>=0&&X<w&&Y<h){out.push(Y*w+X);X+=DX[dir];Y+=DY[dir];}return out;}

/**
 * Builds one box backwards. Beans are added one by one; bean k (in build order) is the (n-k)th to leave in the plan, so its lane must
 * be clear of the beans already placed and of the defenders at the moment it leaves. A turner leaves facing dirAtExit; it starts
 * facing dirAtExit minus the number of beans that leave before it (it turns once each time a bean leaves).
 */
export function buildBox(rnd:()=>number,level:number):Box{
 const R=rampFor(level),{w,h}=R,N=w*h,occ=new Int16Array(N).fill(-1),defs:number[]=[];
 // defenders: never on the outer ring (a lane always has a way to the edge) and never next to another defender
 const inner:number[]=[];for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++)inner.push(y*w+x);
 for(let k=0;k<R.defs&&inner.length;k++){const j=Math.floor(rnd()*inner.length),i=inner[j];inner.splice(j,1);
  if(defs.some(d=>Math.abs(d%w-i%w)+Math.abs(Math.floor(d/w)-Math.floor(i/w))<=1)){k--;if(inner.length<3)break;continue;}defs.push(i);occ[i]=-2;}
 const n=Math.min(R.beans,N-defs.length-1),placed:{i:number;dirExit:number}[]=[];
 // which build slots become turners: spread through the build so turners leave at different times
 const turnAt=new Set<number>();for(let t=0;t<R.turn&&turnAt.size<n;t++){let k=Math.floor(rnd()*n);while(turnAt.has(k))k=(k+1)%n;turnAt.add(k);}
 for(let k=0;k<n;k++){
  const cands:{i:number;d:number;blocks:number}[]=[];
  for(let i=0;i<N;i++){if(occ[i]!==-1)continue;const x=i%w,y=Math.floor(i/w);
   for(let d=0;d<4;d++){if(laneCells(w,h,x,y,d).some(c=>occ[c]!==-1))continue;
    let blocks=0;for(const p of placed)if(laneCells(w,h,p.i%w,Math.floor(p.i/w),p.dirExit).includes(i))blocks++;cands.push({i,d,blocks});}}
  if(!cands.length)break;
  let pick:{i:number;d:number;blocks:number};
  if(rnd()<R.tangle){const top=Math.max(...cands.map(c=>c.blocks)),best=cands.filter(c=>c.blocks===top);pick=best[Math.floor(rnd()*best.length)];}
  else pick=cands[Math.floor(rnd()*cands.length)];
  occ[pick.i]=k;placed.push({i:pick.i,dirExit:pick.d});
 }
 const m=placed.length,beans:Bean[]=placed.map((p,k)=>{const leavesAt=m-1-k,turner=turnAt.has(k);
  return {id:k,x:p.i%w,y:Math.floor(p.i/w),dir:turner?((p.dirExit-leavesAt)%4+4*m)%4:p.dirExit,turner,kit:Math.floor(rnd()*KIT.length),out:false};});
 return {w,h,level,beans,defs,time:R.time,plan:beans.map(b=>b.id).reverse()};
}

/** The first thing in a bean's lane (a bean index or -2 for a defender, with its cell), or null when the lane is clear. */
export function blockerOf(box:Box,b:Bean){const occ=new Int16Array(box.w*box.h).fill(-1);for(const d of box.defs)occ[d]=-2;box.beans.forEach((o,k)=>{if(!o.out)occ[o.y*box.w+o.x]=k;});
 for(const c of laneCells(box.w,box.h,b.x,b.y,b.dir))if(occ[c]!==-1)return {cell:c,who:occ[c]};return null;}
export const canRun=(box:Box,b:Bean)=>!b.out&&blockerOf(box,b)===null;

export type BoxEventType='run'|'foul'|'turn'|'spin'|'box'|'clean'|'whistleBack'|'reset'|'level'|'over';
/** bean: the bean's index; cell: the bump cell (foul) or the bean's cell (run); points: what the event scored; a: lane length (run),
 *  whistles left (foul), seconds left (box), clean streak (clean), level (level / box); b: why the run ended (over: 0 fouls, 1 clock). */
export type BoxEvent={type:BoxEventType;bean:number;cell:number;dir:number;points:number;a:number;b:number;kit:number};
export type BoxStats={beans:number;boxes:number;fouls:number;cleanBoxes:number;bestClean:number;fastest:number;taps:number;turners:number};
export type BoxState={seed:number;daily:boolean;box:Box;level:number;score:number;whistles:number;clock:number;grace:number;
 /** clean streak (boxes in a row without a foul) and whether this box has had a foul. */clean:number;fouled:boolean;
 over:boolean;overWhy:''|'fouls'|'clock';elapsed:number;stats:BoxStats};
const emptyStats=():BoxStats=>({beans:0,boxes:0,fouls:0,cleanBoxes:0,bestClean:0,fastest:0,taps:0,turners:0});

export type ClearBox=ReturnType<typeof createClearBox>;
/** fixLevel: tests only (every box is built at that level, to measure one step of the ramp). */
export function createClearBox(opts:{seed:number;daily?:boolean;fixLevel?:number}){
 const rnd=mulberry(opts.seed),events:BoxEvent[]=[];
 const make=(level:number)=>buildBox(rnd,opts.fixLevel??level);
 const first=make(1);
 const s:BoxState={seed:opts.seed,daily:!!opts.daily,box:first,level:1,score:0,whistles:CB.whistles,clock:first.time,grace:CB.grace,clean:0,fouled:false,over:false,overWhy:'',elapsed:0,stats:emptyStats()};
 const emit=(type:BoxEventType,o:Partial<BoxEvent>={})=>{events.push({type,bean:o.bean??-1,cell:o.cell??-1,dir:o.dir??0,points:o.points??0,a:o.a??0,b:o.b??0,kit:o.kit??0});};
 function end(why:'fouls'|'clock'){if(s.over)return;s.over=true;s.overWhy=why;emit('over',{b:why==='fouls'?0:1});}
 function nextBox(){s.level++;s.box=make(s.level);s.clock=s.box.time;s.grace=CB.grace;s.fouled=false;emit('level',{a:s.level});}
 /** After a bean leaves: turners turn; if no bean can run, turners keep turning (a spin, free) up to 4 times; still stuck: the box resets. */
 function afterRun(){
  const left=s.box.beans.filter(b=>!b.out);if(!left.length)return;
  for(const b of left)if(b.turner){b.dir=(b.dir+1)%4;emit('turn',{bean:s.box.beans.indexOf(b),dir:b.dir});}
  for(let spin=0;spin<4&&!left.some(b=>canRun(s.box,b));spin++){if(!left.some(b=>b.turner))break;for(const b of left)if(b.turner)b.dir=(b.dir+1)%4;emit('spin');}
  if(!left.some(b=>canRun(s.box,b))){emit('reset');nextBox();}
 }
 function boxDone(){
  const lf=levelFactor(s.level),secs=Math.floor(Math.max(0,s.clock));let bonus=Math.round(CB.boxPts*lf)+secs*CB.secPts;s.stats.boxes++;
  const used=s.box.time-s.clock;if(!s.stats.fastest||used<s.stats.fastest)s.stats.fastest=Math.round(used*10)/10;
  if(!s.fouled){s.clean++;s.stats.cleanBoxes++;s.stats.bestClean=Math.max(s.stats.bestClean,s.clean);bonus=Math.round(bonus*streakFactor(s.clean));
   if(s.clean%CB.whistleBack===0&&s.whistles<CB.whistles){s.whistles++;emit('whistleBack',{a:s.whistles});}}
  s.score+=bonus;emit('box',{points:bonus,a:secs});if(!s.fouled)emit('clean',{a:s.clean});
  nextBox();
 }
 /** Tap bean k. Returns 'run', 'foul' or null (nothing there / run over). */
 function tap(k:number):'run'|'foul'|null{
  const b=s.box.beans[k];if(s.over||!b||b.out)return null;s.stats.taps++;
  const blk=blockerOf(s.box,b);
  if(blk){s.whistles--;s.stats.fouls++;s.fouled=true;s.clean=0;emit('foul',{bean:k,cell:blk.cell,dir:b.dir,a:s.whistles,b:blk.who,kit:b.kit});if(s.whistles<=0)end('fouls');return 'foul';}
  b.out=true;const pts=Math.round(CB.beanPts*levelFactor(s.level));s.score+=pts;s.stats.beans++;if(b.turner)s.stats.turners++;
  emit('run',{bean:k,cell:b.y*s.box.w+b.x,dir:b.dir,points:pts,a:laneCells(s.box.w,s.box.h,b.x,b.y,b.dir).length,kit:b.kit});
  if(s.box.beans.every(o=>o.out))boxDone();else afterRun();
  return 'run';
 }
 /** Advance the clock by dt seconds (the shell calls it with real time while playing; tests with fixed steps). */
 function tick(dt:number){if(s.over||dt<=0)return;s.elapsed+=dt;if(s.grace>0){const g=Math.min(s.grace,dt);s.grace-=g;dt-=g;}if(dt<=0)return;
  s.clock=Math.max(0,s.clock-dt);if(s.clock<=0)end('clock');}
 return {state:s,tap,tick,
  /** Bean index at a cell of the current box, or -1. */
  beanAt(x:number,y:number){return s.box.beans.findIndex(b=>!b.out&&b.x===x&&b.y===y);},
  canRun:(k:number)=>{const b=s.box.beans[k];return !!b&&canRun(s.box,b);},
  drain(fn:(e:BoxEvent)=>void){const list=events.splice(0);for(const e of list)fn(e);},
 };
}
