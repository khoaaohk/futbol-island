// Trophy Drop (Nov 17 2026, docs/arcade-aaa/trophydrop-direction.md): the seeded rules and physics, the device save and the wiring.
// Run: node tests/trophydrop-core.cjs   (--bots prints the bot runs for tuning)
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
const K=require('../lib/arcade/trophydrop/core.ts'),S=require('../lib/arcade/trophydrop/save.ts'),L=require('../lib/arcade/leaderboard.ts');
const {arcadeCabinets,ARCADE_ROW,arcadeAnalyticsId}=require('../lib/arcade/arcadeCatalog.ts'),{arcadeCoinTarget}=require('../lib/arcade/arcadeWalletCore.ts'),{ARCADE_COIN_CAPS}=require('../lib/economy.ts');
const {isSyncKey}=require('../lib/saves/snapshot.ts');
const read=p=>fs.readFileSync(p,'utf8'),{TD,TIERS,BEACH}=K;
let n=0;const ok=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL '+name);throw e;}};
const lcg=seed=>{let r=seed>>>0;return()=>{r=(r*1664525+1013904223)>>>0;return r/4294967296;};};
/** Every item stays inside the glass: between the walls, on or above the floor, under the lid, finite. */
function inside(g){const s=g.state;for(const b of s.bodies){const e=.01;if(!(Number.isFinite(b.x)&&Number.isFinite(b.y)))return false;if(b.x<s.left+b.r-e||b.x>s.right-b.r+e||b.y>s.floor-b.r+e||b.y<b.r-e)return false;}return true;}
const value=t=>2**(t===BEACH?K.BEACH_TIER_AFTER:t);
/** A bot. fast: drops whenever the cooldown allows; otherwise waits for a settled cabinet (or 1.3 s), like a careful child.
 *  It aims at the highest landed twin of the held item, else somewhere random. Returns the run's numbers. */
function play(seed,{fast=false,maxSeconds=1500,check,shake=true}={}){
 const g=K.createTrophyDrop({seed}),rnd=lcg(seed*97+5),s=g.state,ev=[];let wait=0,dropped=0,frames=0,escaped=0;
 while(!s.over&&frames<maxSeconds*60){
  if(s.cool<=0&&(fast||s.asleep||(wait+=1/60)>=1.3)){wait=0;let best=null;for(const b of s.bodies)if(b.t===s.cur&&b.landed&&(!best||b.y<best.y))best=b;
   g.aim(best&&rnd()<.85?best.x+(rnd()-.5)*2:s.left+rnd()*(s.right-s.left));const t=s.cur;if(g.drop())dropped+=value(t);}
  if(shake&&s.danger>1&&s.shakes>0)g.shake();// AAA pass (Nov 18 2026): the bot spends its rescue when the clock is half gone
  g.step(1/60);g.drain(e=>ev.push({...e}));frames++;if(!inside(g))escaped++;if(check)check(g,dropped,ev);
 }
 return {g,ev,dropped,frames,escaped,secs:frames/60};
}

ok('tiers: nine, each clearly bigger, points grow; the ramp only gets harder, for ever',()=>{
 assert.equal(TIERS.length,9);assert.deepEqual(TIERS.map(t=>t.key),['ball1','ball3','ball5','boot','glove','medal','shield','cup','trophy']);
 for(let i=1;i<TIERS.length;i++){assert(TIERS[i].r>=TIERS[i-1].r*1.12,'each tier clearly bigger: '+TIERS[i].key);assert(TIERS[i].pts>TIERS[i-1].pts);}
 assert(TIERS[8].r*2<TD.w-2*K.rampFor(99).inset,'the golden trophy always fits the narrowest cabinet');
 assert(TD.vmax*TD.dt<TIERS[0].r,'no tunnelling: one step moves less than the smallest radius');
 const mean=r=>{const w=r.w,sum=w.reduce((a,b)=>a+b,0);return w.reduce((a,x,i)=>a+x*TIERS[i].r,0)/sum;};
 let prev=K.rampFor(1);for(let l=2;l<=60;l++){const r=K.rampFor(l);assert(mean(r)>mean(prev)-1e-9,'drops lean bigger at level '+l);assert(r.beach>=prev.beach&&r.inset>=prev.inset&&r.rise>=prev.rise,'never easier at '+l);prev=r;}
 assert(mean(K.rampFor(10))>mean(K.rampFor(1))*1.2&&K.rampFor(1).beach===0&&K.rampFor(5).beach>0&&K.rampFor(10).inset>K.rampFor(2).inset&&K.rampFor(10).rise>0);
 assert.equal(K.medalFor(0),0);assert.equal(K.medalFor(TD.medals[0]),1);assert.equal(K.medalFor(TD.medals[2]),3);assert.deepEqual(K.nextMedalLine(TD.medals[0]-10),{medal:0,next:'Bronze',gap:10});
});
ok('determinism: one seed and one list of inputs give the same run; the daily seed is one per day',()=>{
 const runOnce=seed=>{const g=K.createTrophyDrop({seed}),rnd=lcg(4242),out=[];for(let i=0;i<60*40;i++){if(i%40===0){g.aim(rnd()*100);g.drop();}g.step(1/60);g.drain(e=>out.push(e.type+e.a+':'+e.b));}
  return JSON.stringify({ev:out,b:g.state.bodies.map(b=>[b.t,b.x,b.y]),score:g.state.score,q:[g.state.cur,g.state.next]});};
 assert.equal(runOnce(77),runOnce(77));assert.notEqual(runOnce(77),runOnce(78));
 // frame rate does not matter: the core runs a fixed step
 const steps=fps=>{const g=K.createTrophyDrop({seed:5});g.aim(40);g.drop();for(let i=0;i<fps*3;i++)g.step(1/fps);return JSON.stringify(g.state.bodies.map(b=>[b.x.toFixed(6),b.y.toFixed(6)]));};
 assert.equal(steps(60),steps(120));
 assert.equal(K.trophyDailySeed('2026-11-17'),K.trophyDailySeed('2026-11-17'));assert.notEqual(K.trophyDailySeed('2026-11-17'),K.trophyDailySeed('2026-11-18'));
 const a=K.createTrophyDrop({seed:K.trophyDailySeed('2026-11-17'),daily:true}),b=K.createTrophyDrop({seed:K.trophyDailySeed('2026-11-17'),daily:true});const qa=[],qb=[];
 for(let i=0;i<30;i++){qa.push(a.state.cur);qb.push(b.state.cur);a.aim(10+i*3);b.aim(80-i*2);a.state.cool=0;b.state.cool=0;a.drop();b.drop();}assert.deepEqual(qa,qb,'the same drop list for everyone, wherever they aim');
 assert.equal(qa[0],0,'the first drop is the smallest ball');
});
ok('merges: two of a tier make the next tier; the tier sum is conserved; the golden double leaves the cabinet',()=>{
 for(const seed of [1,2,3]){const r=play(seed,{fast:true,check:(g,dropped)=>{let v=0;for(const b of g.state.bodies)v+=value(b.t);assert.equal(v+g.state.stats.doubles*2*2**8,dropped,'2^tier is conserved');}});
  for(const e of r.ev.filter(e=>e.type==='merge')){assert(e.a>=1&&e.a<=8);assert.equal(e.b,TIERS[e.a].pts*Math.min(TD.chainCap,e.c),'points = tier points x chain');}
  const s=r.g.state;assert.equal(s.stats.merges,r.ev.filter(e=>e.type==='merge'||e.type==='double').length);assert.equal(s.score,r.ev.reduce((a,e)=>a+(e.type==='merge'||e.type==='double'?e.b:0),0),'every point comes from a merge');}
 // a staged merge: two boots side by side on the floor make one glove
 const g=K.createTrophyDrop({seed:9}),s=g.state;s.cur=3;g.aim(30);g.drop();s.cool=0;s.cur=3;g.aim(30+TIERS[3].r*2+.1);g.drop();const ev=[];for(let i=0;i<180;i++){g.step(1/60);g.drain(e=>ev.push({...e}));}
 assert.equal(s.bodies.length,1);assert.equal(s.bodies[0].t,4);assert.equal(ev.filter(e=>e.type==='merge').length,1);assert.equal(s.score,TIERS[4].pts);
 // two golden trophies: both go, 640 points
 const h=K.createTrophyDrop({seed:10}),t=h.state;t.cur=8;h.aim(30);h.drop();t.cool=0;t.cur=8;h.aim(52);h.drop();const ev2=[];for(let i=0;i<240;i++){h.step(1/60);h.drain(e=>ev2.push({...e}));}
 assert.equal(t.bodies.length,0);assert.equal(t.stats.doubles,1);assert.equal(t.score,TD.doubleBonus);
});
ok('chain: a new item that lands on its twin is a chain (x2); a fresh drop onto a new item is not',()=>{
 const g=K.createTrophyDrop({seed:11}),s=g.state;
 s.cur=1;g.aim(50);g.drop();for(let i=0;i<120;i++)g.step(1/60);// a size-3 ball resting
 s.cur=0;g.aim(20);s.cool=0;g.drop();s.cur=0;s.cool=0;g.aim(20+TIERS[0].r*2);g.drop();// two size-1 balls merge into a size-3 ball, rolling...
 // stage: put the new size-3 ball's twin right next to it as it is born
 const ev=[];for(let i=0;i<240;i++){g.step(1/60);g.drain(e=>ev.push({...e}));const born=s.bodies.find(b=>b.fromMerge&&b.t===1);const rest=s.bodies.find(b=>!b.fromMerge&&b.t===1);if(born&&rest&&i<200){rest.x=born.x+born.tr*2+.2;rest.y=born.y;rest.vx=rest.vy=0;}}
 const merges=ev.filter(e=>e.type==='merge');assert(merges.length>=2);assert.equal(merges[0].c,1);assert.equal(merges[1].a,2);assert.equal(merges[1].c,2,'the second merge is a chain');assert.equal(merges[1].b,TIERS[2].pts*2);
 const h=K.createTrophyDrop({seed:12}),t=h.state;t.cur=0;h.aim(40);h.drop();t.cool=0;t.cur=0;h.aim(40+TIERS[0].r*2);h.drop();for(let i=0;i<30;i++)h.step(1/60);
 const born=t.bodies.find(b=>b.fromMerge);assert(born);t.cool=0;t.cur=1;h.aim(born.x);h.drop();const ev2=[];for(let i=0;i<180;i++){h.step(1/60);h.drain(e=>ev2.push({...e}));}
 assert.equal(ev2.filter(e=>e.type==='merge')[0].c,1,'dropping onto a new item is a plain merge');
});
ok('beach ball: bouncy, cannot merge, two hard hits deflate it into a size-5 ball',()=>{
 const g=K.createTrophyDrop({seed:13}),s=g.state;s.cur=BEACH;g.aim(50);g.drop();s.cool=0;s.cur=BEACH;g.aim(50+K.BEACH_R*2+.5);g.drop();
 let peak=0,landed=false;for(let i=0;i<240;i++){g.step(1/60);g.drain(()=>{});const b=s.bodies[0];if(b.floor||b.y>s.floor-b.r-.5)landed=true;else if(landed)peak=Math.max(peak,s.floor-b.r-b.y);}
 assert(peak>4,'it bounces off the floor ('+peak.toFixed(1)+')');assert.equal(s.bodies.length,2,'two beach balls never merge');assert(s.bodies.every(b=>b.t===BEACH));
 const ev=[];for(let k=0;k<6&&s.bodies.some(b=>b.t===BEACH);k++){s.cool=0;s.cur=3;const tgt=s.bodies.find(b=>b.t===BEACH);g.aim(tgt.x);g.drop();for(let i=0;i<120;i++){g.step(1/60);g.drain(e=>ev.push({...e}));}}
 assert(ev.some(e=>e.type==='hit')&&ev.some(e=>e.type==='pop'),'hits, then the pop');assert(s.stats.pops>=1);const popped=ev.find(e=>e.type==='pop');assert.equal(popped.a,2);
 assert(ev.filter(e=>e.type==='hit'&&e.a===1).length>=1&&ev.filter(e=>e.type==='hit'&&e.a===2).length>=1,'the first and the second hit');
});
ok('solver: stable stacks that go to sleep (no physics on a settled cabinet), never an item outside the glass',()=>{
 const g=K.createTrophyDrop({seed:21}),s=g.state,rnd=lcg(3);
 for(let k=0;k<26;k++){s.cool=0;s.cur=[0,1,2,3][k%4];g.aim(8+rnd()*84);g.drop();for(let i=0;i<70;i++){g.step(1/60);g.drain(()=>{});assert(inside(g));}}
 for(let i=0;i<60*6;i++){g.step(1/60);g.drain(()=>{});}assert(s.asleep,'the pile sleeps');/* Nov 18 2026: 6 s (was 4): a merge now pushes its neighbours */assert(g.idle||s.danger>0);
 const at=JSON.stringify(s.bodies.map(b=>[b.x,b.y])),steps=s.steps;for(let i=0;i<60*5;i++)g.step(1/60);assert.equal(s.steps,steps,'no physics while asleep');assert.equal(JSON.stringify(s.bodies.map(b=>[b.x,b.y])),at,'no drift');
 // a fast item fired at the glass and at a pile stays inside
 s.cool=0;s.cur=0;g.aim(50);g.drop();const b=s.bodies[s.bodies.length-1];b.vx=5000;b.vy=5000;for(let i=0;i<240;i++){g.step(1/60);assert(inside(g),'still inside');}
 // walls closing in push the items, never through
 s.goalLeft=8;s.goalRight=92;s.goalFloor=130;s.asleep=false;for(let i=0;i<60*6;i++){g.step(1/60);g.drain(()=>{});assert(inside(g));}assert.equal(s.left,8);assert.equal(s.floor,130);
});
ok('the top line: a warning first, the run ends only after items stay above it for 2 s',()=>{
 const g=K.createTrophyDrop({seed:31}),s=g.state;s.cur=8;g.aim(50);g.drop();for(let i=0;i<120;i++)g.step(1/60);
 const tr=s.bodies[0];tr.y=TD.line+tr.r-6;tr.age=5;tr.landed=true;s.asleep=true;const ev=[];
 for(let i=0;i<60;i++){g.step(1/60);g.drain(e=>ev.push(e.type));}assert(ev.includes('warn')&&!s.over,'warned, not over after 1 s');
 tr.y=TD.line+tr.r+20;for(let i=0;i<60;i++){g.step(1/60);g.drain(e=>ev.push(e.type));}assert(ev.includes('safe')&&s.danger===0,'back under: safe, the clock resets');
 tr.y=TD.line+tr.r-6;for(let i=0;i<60*2.2;i++){g.step(1/60);g.drain(e=>ev.push(e.type));}assert(s.over&&ev.includes('over'));assert.equal(g.drop(),false,'no drops after the end');
 // a fresh drop above the line is not a danger (grace time)
 const h=K.createTrophyDrop({seed:32});h.aim(50);h.drop();for(let i=0;i<20;i++)h.step(1/60);assert.equal(h.state.danger,0);
});
ok('AAA pass (Nov 18 2026): two-ahead queue, buffered drop, bounce and roll, merge push, touch streak, shake, golden relief',()=>{
 // the queue shows two ahead and the drop list is still one list for everyone
 const q=K.createTrophyDrop({seed:41}),qs=q.state,list=[];for(let i=0;i<40;i++){const n1=qs.next,n2=qs.next2;qs.cool=0;q.aim(50);q.drop();assert.equal(qs.cur,n1);assert.equal(qs.next,n2);list.push(qs.cur);}
 const q2=K.createTrophyDrop({seed:41}),l2=[];for(let i=0;i<40;i++){q2.state.cool=0;q2.aim(10+i);q2.drop();if(i===5)q2.shake();l2.push(q2.state.cur);}assert.deepEqual(list,l2,'aim and shake never change the drop list');
 // a drop asked for during the cooldown is kept and goes when the cooldown ends
 const g=K.createTrophyDrop({seed:42}),s=g.state;g.aim(30);assert.equal(g.drop(),true);g.aim(70);assert.equal(g.drop(),false);assert.equal(s.queued,true);assert(!g.idle);for(let i=0;i<40;i++)g.step(1/60);assert.equal(s.drops,2,'the buffered drop went');assert.equal(s.queued,false);
 assert(Math.abs(s.bodies[1].x-70)<1,'at the aim of the moment it goes');
 // a first landing has one small hop; a ball rolls (angle follows its sideways speed); a big item rocks and stands up again
 const h=K.createTrophyDrop({seed:43}),t=h.state;t.cur=0;h.aim(50);h.drop();let up=0,landed=false;for(let i=0;i<120;i++){h.step(1/60);const b=t.bodies[0];if(b.landed)landed=true;if(landed)up=Math.max(up,t.floor-b.r-b.y);}assert(up>.3&&up<8,'a small hop ('+up.toFixed(2)+')');
 t.bodies[0].vx=40;t.asleep=false;for(let i=0;i<30;i++)h.step(1/60);assert(Math.abs(t.bodies[0].a)>.5,'the ball rolled');
 t.cool=0;t.cur=6;h.aim(20);h.drop();for(let i=0;i<90;i++)h.step(1/60);const big=t.bodies.find(b=>b.t===6);big.vx=60;t.asleep=false;let lean=0;for(let i=0;i<240;i++){h.step(1/60);lean=Math.max(lean,Math.abs(big.a));}assert(lean>.02&&lean<=.5,'it rocks');assert(Math.abs(big.a)<.05,'and stands up again');
 // a merge pushes its neighbours away
 const m=K.createTrophyDrop({seed:44}),ms=m.state;ms.cur=0;m.aim(50);m.drop();for(let i=0;i<120;i++)m.step(1/60);const by=ms.bodies[0];by.x=50+TIERS[1].r-TIERS[2].r-TIERS[0].r-1.5;ms.asleep=false;for(let i=0;i<60;i++)m.step(1/60);const x0=by.x;
 ms.cool=0;ms.cur=1;m.aim(50);m.drop();for(let i=0;i<70;i++)m.step(1/60);ms.cool=0;ms.cur=1;m.aim(50+TIERS[1].r*2);m.drop();let pushed=0;for(let i=0;i<120;i++){m.step(1/60);pushed=Math.max(pushed,x0-by.x);}assert(ms.stats.merges>=1&&pushed>.05,'the bystander moved away ('+pushed.toFixed(2)+')');
 // touch streak: TD.streakNeed merging drops in a row earn ONE shake; a drop that does not merge ends the streak
 const k=K.createTrophyDrop({seed:45}),ks=k.state,ev=[];const pair=()=>{for(const x of [20,20+TIERS[0].r*2]){ks.cool=0;ks.cur=0;k.aim(x);k.drop();}for(let i=0;i<70;i++){k.step(1/60);k.drain(e=>ev.push({...e}));}for(const b of [...ks.bodies])if(b.t>0)ks.bodies.splice(ks.bodies.indexOf(b),1);};
 for(let i=0;i<TD.streakNeed;i++)pair();assert.equal(ks.streak,TD.streakNeed);assert.equal(ks.shakes,1);assert.equal(ev.filter(e=>e.type==='earn').length,1);assert.equal(ks.stats.bestStreak,TD.streakNeed);
 for(let i=0;i<TD.streakNeed;i++)pair();assert.equal(ks.shakes,1,'holds one at a time');
 ks.cool=0;ks.cur=3;k.aim(80);k.drop();for(let i=0;i<150;i++){k.step(1/60);k.drain(e=>ev.push({...e}));}assert.equal(ks.streak,0);assert(ev.some(e=>e.type==='miss'),'a miss ends it');const score=ks.score;
 // the shake: lifts the pile, holds the top-line clock, costs no points, and there are at most TD.shakeMax a run
 const boot=ks.bodies.find(b=>b.t===3);boot.y=TD.line+boot.r-5;boot.age=5;ks.asleep=true;for(let i=0;i<30;i++)k.step(1/60);assert(ks.danger>0);const d0=ks.danger;
 assert.equal(k.shake(),true);assert.equal(ks.shakes,0);assert.equal(k.shake(),false,'one use');for(let i=0;i<30;i++){k.step(1/60);assert(inside(k));}assert(ks.danger<d0,'the clock is held');assert.equal(ks.score,score,'no points from a shake');assert.equal(ks.stats.shakes,1);
 ks.shakesEarned=TD.shakeMax;for(let i=0;i<TD.streakNeed*2;i++)pair();assert.equal(ks.shakes,0,'no more than '+TD.shakeMax+' a run');
 // the golden double opens the cabinet again
 const d=K.createTrophyDrop({seed:46}),ds=d.state;ds.level=8;ds.goalLeft=ds.left=K.rampFor(8).inset;ds.goalRight=ds.right=TD.w-K.rampFor(8).inset;ds.goalFloor=ds.floor=TD.h-K.rampFor(8).rise;
 ds.cur=8;d.aim(32);d.drop();ds.cool=0;ds.cur=8;d.aim(60);d.drop();for(let i=0;i<300;i++)d.step(1/60);assert.equal(ds.stats.doubles,1);assert.equal(ds.left,K.rampFor(8-TD.reliefLevels).inset,'walls step back');assert.equal(ds.floor,TD.h-K.rampFor(8-TD.reliefLevels).rise);
 assert.deepEqual(d.nextWalls,{left:K.rampFor(9-TD.reliefLevels).inset,right:TD.w-K.rampFor(9-TD.reliefLevels).inset,floor:TD.h-K.rampFor(9-TD.reliefLevels).rise});
 // a merged item has a short grace before the top line counts it (the pop must not start the clock)
 assert(TD.mergeGrace>0&&TD.mergeGrace<TD.grace);
});
ok('bots: every run ends on its own, later is harder, nothing escapes; scores sit around the medal marks',()=>{
 const out=[];for(const fast of [true,false])for(let seed=1;seed<=(fast?6:4);seed++){const r=play(seed,{fast});const s=r.g.state;
  assert(s.over,`seed ${seed} ends`);assert.equal(r.escaped,0,'nothing outside the glass');assert(s.level>=3,'the ramp is reached');
  out.push({fast,seed,secs:Math.round(r.secs),drops:s.drops,score:s.score,level:s.level,top:s.stats.bestTier,chain:s.stats.bestChain,pops:s.stats.pops});}
 if(process.argv.includes('--bots'))console.log(out.map(o=>JSON.stringify(o)).join('\n'));const calm=out.filter(o=>!o.fast);assert(calm.every(o=>o.secs>60),'a careful run lasts more than a minute');assert(calm.some(o=>o.score>=TD.medals[0]),'bronze is in reach');const sorted=out.map(o=>o.score).sort((x,y)=>x-y);assert(sorted[Math.floor(sorted.length/2)]<TD.medals[2]*1.5,'gold is a real goal for a good player');
 // later = harder: the space left in the cabinet shrinks with the level, and the drops get bigger
 const area=l=>{const r=K.rampFor(l);return (TD.w-2*r.inset)*(TD.h-r.rise-TD.line);};assert(area(8)<area(1)*.8);
 const plays=Array.from({length:40},(_,i)=>play(100+i,{fast:true,maxSeconds:900}).g.state.drops);assert(plays.every(d=>d<2000),'a run always ends');
 if(process.argv.includes('--bots'))console.log(out,plays);
});
ok('save: best, medal, biggest tier, Daily Drop and the day streak; lines for the results card',()=>{
 const st={drops:40,merges:20,bestTier:5,bestChain:2,doubles:0,made:[0,1,1,1,1,1,0,0,0],beaches:0,pops:0};
 let s=S.emptyTrophySave(),r=S.settleTrophy(s,{score:1600,daily:false,day:'2026-11-16',stats:st});assert(r.newBest&&r.medal===1&&r.newMedal&&r.newTop);s=r.save;assert.equal(s.best,1600);assert.equal(s.top,5);
 r=S.settleTrophy(s,{score:900,daily:true,day:'2026-11-16',stats:st});assert(r.dailyFirst&&!r.newBest&&r.dailyBest===900&&r.streak===1);s=r.save;assert.equal(s.best,1600);
 r=S.settleTrophy(s,{score:1700,daily:true,day:'2026-11-16',stats:st});assert(!r.dailyFirst&&r.newBest&&r.dailyBest===1700&&r.streak===1);s=r.save;
 r=S.settleTrophy(s,{score:10,daily:true,day:'2026-11-17',stats:st});assert.equal(r.streak,2);s=r.save;assert.equal(S.liveStreak(s,'2026-11-18'),2);assert.equal(S.liveStreak(s,'2026-11-20'),0);
 assert.deepEqual(S.sanitizeTrophySave({best:-5,top:99,medal:9,daily:{day:'x',best:1e12}}),{...S.emptyTrophySave(),top:8,medal:3,daily:{day:'',best:S.TROPHY_SCORE_MAX,runs:0}});
 assert.match(S.nearMissLine({score:1100,best:1200,newBest:false,stats:st,daily:false,dailyBest:0}),/100 points from your best/);
 assert.match(S.nearMissLine({score:4900,best:0,newBest:true,stats:st,daily:false,dailyBest:0}),/100 points from Silver/);
 assert.match(S.nearMissLine({score:1500,best:1200,newBest:true,stats:st,daily:false,dailyBest:0}),/New best by 300/);
 for(const f of S.TROPHY_FACTS)assert(f.line.length<140&&!/[–—]/.test(f.line),'short kid copy: '+f.title);
 assert(isSyncKey(S.TROPHY_KEY),'the save travels with the player code');
});
ok('arcade wiring: last cabinet in the back row, one all-time board, coins, sound, room route, attract, SQL',()=>{
 const cab=arcadeCabinets.find(c=>c.id==='trophydrop');assert(cab&&cab.name==='Trophy Drop'&&cab.short==='TROPHY DROP'&&cab.lesson==='Small touches add up to big wins.');
 assert.equal(ARCADE_ROW[ARCADE_ROW.indexOf('lineup')+1],'trophydrop','appended to the row right after Line Up! (Nov 18 2026: Roll It In follows it, tests/rollball-core.cjs)');assert.equal(cab.z,-10);assert.equal(cab.yaw,0);assert(cab.x>0,'east end');assert.equal(arcadeAnalyticsId('trophydrop'),'trophydrop');
 assert(/\$\{ARCADE_GAME_WORD\.toUpperCase\(\)\} GAMES · ALL FOOTBALL/.test(read('lib/arcade/arcadeRoomScene.ts'))&&!/SEVEN GAMES/.test(read('lib/arcade/arcadeRoomScene.ts')),'the back-wall sign counts the catalog (Nov 17 2026: was a typed SEVEN)');
 assert(L.isBoardGame('trophydrop')&&L.HALL_MACHINES.includes('trophydrop'));assert.equal(L.HALL_MACHINES.length,arcadeCabinets.length,'one Hall chip per machine');assert.equal(L.BOARD_TIER_TABS.trophydrop,undefined,'one board');
 assert.equal(L.scorePlausible('trophydrop',3000,120_000),'ok');assert.equal(L.scorePlausible('trophydrop',200_000,60_000),'fast');assert(L.scoreInBounds('trophydrop',2_000_000)&&!L.scoreInBounds('trophydrop',2_000_001));assert.equal(L.BOARD_RULES.trophydrop.max,S.TROPHY_SCORE_MAX);
 assert.equal(arcadeCoinTarget('trophydrop',{points:449}),2);assert.equal(arcadeCoinTarget('trophydrop',{points:1e7}),ARCADE_COIN_CAPS.trophydrop);assert.equal(ARCADE_COIN_CAPS.trophydrop,ARCADE_COIN_CAPS.snake);assert.equal(K.trophyCoins(449),2);
 const room=read('components/ArcadeRoom.tsx');assert(/game==='trophydrop'\?<TrophyDrop onExit=\{back\}\/>/.test(room)&&/trophydrop:\(\)=>import\('\.\/games\/TrophyDropGame'\)/.test(room));
 assert(/trophydrop:trophydrop\.skin/.test(read('components/games/skins/index.ts')));assert(/trophydrop:'TROPHY DROP'/.test(read('lib/arcade/arcadeCabinetAttract.ts'))&&/id==='trophydrop'\)drawTrophy\(time\)/.test(read('lib/arcade/arcadeCabinetAttract.ts')));
 assert(/'airhockey','lineup','trophydrop',('rollball',)?('ballblaster',)?()?('keepyuppy',)?('holdtheline',)?('popup',)?'runner'/.test(read('components/arcade/HighScoreEntry.tsx')),'results first');
 const shell=read('components/games/TrophyDropGame.tsx');assert(/data-game="trophydrop"/.test(shell)&&/beginBoardSession\('trophydrop'\)/.test(shell)&&/saveArcadeRecord\('trophydrop',score\)/.test(shell));
 assert(/data-trophy-again autoFocus>Play again</.test(shell)&&/data-trophy-play autoFocus>Play</.test(shell)&&/data-trophy-daily>Daily Drop/.test(shell),'instant restart; the daily challenge on the game’s own start card');
 assert(!/takeTodayLaunch|noteArcadeToday/.test(shell),'no Today slide-out wiring');
 const ids=require('../lib/analytics/islandIds.ts');assert(ids.ARCADE_GAMES.includes('trophydrop')&&ids.ACTIVITY_IDS.includes('arcade_trophydrop'));assert(require('../lib/analytics/countIds.ts').ENGAGE_ARCADE_GAMES.includes('trophydrop'));
 const sql=read('docs/arcade-aaa/trophydrop-supabase.sql'),code=sql.replace(/--.*$/gm,'');const list=/check \(game in \(([^)]*)\)\)/.exec(code)[1].split(',').map(v=>v.trim().replace(/'/g,''));assert.deepEqual(list,[...L.BOARD_GAMES].filter(g=>list.includes(g)||g==='trophydrop'));
 for(const g of L.BOARD_GAMES.slice(0,L.BOARD_GAMES.indexOf('airhockey')+1))assert(list.includes(g),'the allow-list keeps '+g);assert(list.includes('trophydrop'));
 assert(/score between 1 and 9000000/.test(code)&&/OK, Trophy Drop board installed/.test(sql)&&/NOT INSTALLED: /.test(sql)&&/'arcade_snake','arcade_airhockey','arcade_trophydrop'/.test(code)&&/'west_beach'/.test(code),'idempotent, self-checking, the newest ingest body plus one key');
 const stadium=read('supabase/migrations/20261119_analytics_stadium.sql').replace(/--.*$/gm,'');for(const key of new Set(stadium.match(/'[a-z_0-9-]+'/g)))assert(code.includes(key),'the ingest keeps '+key);
});
ok('sound: one limiter, wired to the output and nowhere else; made on the first tap; no files, no timers',()=>{
 const a=read('lib/arcade/trophydrop/audio.ts');assert.equal((a.match(/createDynamicsCompressor\(\)/g)||[]).length,1);assert(/master\.connect\(limiter\);limiter\.connect\(ctx\.destination\);/.test(a));
 assert.equal((a.match(/limiter\.connect\(/g)||[]).length,1);assert(!/\.connect\(ctx\.destination\)/.test(a.replace('limiter.connect(ctx.destination)','')));assert(!/\.connect\(limiter\)/.test(a.replace('master.connect(limiter)','')));
 assert(!/new Audio\(|\.mp3|\.ogg|\.wav|fetch\(/.test(a));assert(!/setInterval|setTimeout/.test(a));assert(/ctx\.state==='suspended'\)void ctx\.resume\(\)/.test(a));
 for(const cue of ['drop(tier=0)'/* Nov 18 2026: was drop(); the pluck follows the item's size */,'land(tier:number','merge(tier:number,chain:number)','double()','hit(n:number)','pop()','level()','warn(urgency=0)'/* Nov 18 2026: was warn(); the pips climb as the clock runs */,'over()','medal(n:number)','safe(phew=false)','streak(n:number,charge:number)','miss()','earn()','shake()','deny()'])assert(a.includes(cue),cue);
 const C=require('../lib/arcade/trophydrop/audio.ts').CHAIN_STEPS;for(let i=1;i<C.length;i++)assert(C[i]>C[i-1],'a chain climbs: rising pitch per link');
 const T=require('../lib/arcade/trophydrop/audio.ts').TIER_STEPS;for(let i=2;i<T.length;i++)assert(T[i]>T[i-1],'rising pitch per tier');
});
ok('heat: the loop sleeps on a settled cabinet and lives only while playing; DPR cap; pooled effects',()=>{
 const c=read('components/games/TrophyDropGame.tsx'),v=read('lib/arcade/trophydrop/view.ts');
 assert(/if\(phaseRef\.current!=='playing'\|\|!g\|\|!v\)return;/.test(c)&&/else if\(g\.idle&&!busy\.current&&!holding\.current&&!keys\.current\.size\)\{p\.sleeps\+\+;/.test(c)&&/wakeRef\.current\(\);\},3200\+Math\.random\(\)\*3600\);\n    return;\}/.test(c),'sleeps when idle (Nov 18 2026: it books one resting blink first, then returns)');
 assert(/if\(!idle\.current&&!reduced\.current\)idle\.current=setTimeout/.test(c)&&/if\(idle\.current\)\{clearTimeout\(idle\.current\);idle\.current=null;\}/.test(c),'the blink timer is one-shot, off under reduced motion and cleared on pause and exit');
 assert(/const sparks:Spark\[\]=Array\.from\(\{length:48\}/.test(v)&&/if\(st!==stage\|\|s\.stats\.bestTier!==made\)\{stage=st;made=s\.stats\.bestTier;paintScene\(\);\}/.test(v),'pooled sparks; the room is repainted only when the lighting stage or a plaque changes');
 assert(/if\(stopFor\.current>0\)stopFor\.current-=dt;else g\.step\(dt\);/.test(c),'hit-stop holds the rules, never the picture');
 assert(/Math\.min\(2,window\.devicePixelRatio\|\|1\)/.test(c)&&/frameCapSlot\(now,slot\.current,FRAME_MS\)/.test(c)&&/document\.hidden\)pause\(\)/.test(c));
 assert(/const pops:Pop\[\]=Array\.from\(\{length:16\}/.test(v)&&/const bursts:Burst\[\]=Array\.from\(\{length:12\}/.test(v),'pooled');assert(!/requestAnimationFrame|setInterval/.test(v),'the view has no loop of its own');
 assert(!/shadowBlur|createLinearGradient|createRadialGradient/.test(v),'no glow, no gradients: flat comic print');
});
console.log(`trophydrop-core: ${n} checks passed`);
