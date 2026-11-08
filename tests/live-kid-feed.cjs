// Tier 1 kid touch rate (Nov 7 2026; matchSim SOFT_FEED): the soft receiver, the starved caller, idle-human cover, the
// human + AI presser double, real-second restarts, quick beach period kick-offs and the quick reset on joining. Every change
// is gated on a human being joined: the AI-only fixture stays byte-identical and the sim stays seeded (no new rng draws).
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),ts=require('typescript');
const cache=new Map();function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,Math,Number,Set,Map,Infinity,NaN,console,require:id=>id.startsWith('.')?(id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):load(path.resolve(path.dirname(file),id+'.ts'))):require(id)});return m.exports;}
const {MatchSim,SOFT_FEED}=load('lib/town/match/matchSim.ts');
const {settlePace}=load('lib/town/match/matchMotion.ts');
const DT=1/30;
const outfield=(sim,team)=>sim.ids.filter(id=>sim.players[id].team===team&&!sim.players[id].isGK);
const put=(sim,id,x,y,vx=0,vy=0)=>{const p=sim.players[id];p.x=x;p.y=y;p.vx=vx;p.vy=vy;};
/** Park everyone far from the action (foes deep in their own half, mates on the far side). */
function clear(sim){for(const id of sim.ids){const p=sim.players[id];if(p.isGK)continue;put(sim,id,p.team==='gold'?250:20,p.team==='gold'?380:20);}}

// ---- 1. AI-only: the seeded fixture is unchanged and no Tier 1 state is ever written ----
{const S=require('./fixtures/live-match-summary.cjs'),expected=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/live-match-summary.json'),'utf8'));
 assert.deepEqual(S.all(MatchSim),expected,'AI-only matches stay byte-identical');
 const sim=new MatchSim(5,'7v7');sim.windupScale=.32;for(let i=0;i<1800;i++)sim.step(DT*.32);
 assert.equal(sim.hIdle.size+sim.hBallAt.size,0,'no idle / starve clocks without a human');
 assert.deepEqual({...sim.feedCool},{gold:0,blue:0},'no soft-feed cap without a human');}

// ---- 2. Soft receiver: an open, onside human in range is the pick; capped at one AI pass in SOFT_FEED.every ----
{const sim=new MatchSim(9,'9v9');const [c,me,mate]=outfield(sim,'gold');clear(sim);
 put(sim,c,135,260);put(sim,me,135,190);put(sim,mate,175,200);sim.ball.owner=c;sim.possession='gold';sim.lastFrom=null;
 assert.equal(sim.softFeed(c,5),null,'AI-only: never');
 sim.lockHuman(me);
 assert.equal(sim.bestPass(c),me,'bestPass: the open human ahead');assert.equal(sim.safePass(c),me,'safePass: the open human');
 sim.feedCool.gold=1;assert.equal(sim.softFeed(c,5),null,'the cap: not twice in a row');sim.feedCool.gold=0;
 // a foe on the lane / on him / offside / out of range / idle each cancels it
 const foe=outfield(sim,'blue')[0];put(sim,foe,135,225);assert.equal(sim.softFeed(c,5),null,'a defender in the lane');
 put(sim,foe,138,186);assert.equal(sim.softFeed(c,5),null,'a defender on him');put(sim,foe,20,20);
 put(sim,me,135,260-SOFT_FEED.maxD-5);assert.equal(sim.softFeed(c,-40),null,'out of range');put(sim,me,135,190);
 assert.equal(sim.softFeed(c,5),me,'open again');
 sim.hIdle.set(me,SOFT_FEED.idle+.1);assert.equal(sim.softFeed(c,5),null,'a parked stick is not asking for it');sim.hIdle.set(me,0);
 put(sim,me,135,280);assert.equal(sim.softFeed(c,5),null,'bestPass keeps forward-only');assert.equal(sim.softFeed(c,-40),me,'safePass may play it back');put(sim,me,135,190);
 // the cap bookkeeping lives in doPass (released kicks): a feed sets it, the next AI pass clears it
 sim.windupScale=0;sim.doPass(c,me,1);assert.equal(sim.feedCool.gold,SOFT_FEED.every-1,'a feed arms the cap');
 sim.ball.owner=c;sim.ball.target=null;sim.doPass(c,mate,1);assert.equal(sim.feedCool.gold,0,'one AI pass elsewhere clears it');}

// ---- 3. Starved: no ball for SOFT_FEED.starve real s makes an open human a soft caller (answered once per `retry`) ----
{const sim=new MatchSim(4,'7v7');const [c,me]=outfield(sim,'gold');clear(sim);put(sim,c,135,260);put(sim,me,100,190);sim.ball.owner=c;
 sim.lockHuman(me);assert.equal(sim.callerFor(c),null,'fresh join: not starved');
 sim.hBallAt.set(me,sim.clock-SOFT_FEED.starve-.1);assert.equal(sim.callerFor(c),me,'starved and open: the carrier answers');
 assert.equal(sim.callerFor(c),null,'answered: not again straight away');}

// ---- 4. Restarts in real seconds with a human (same rng draw); AI-only keeps sim seconds ----
for(const human of [false,true]){const sim=new MatchSim(12,'7v7');sim.windupScale=.32;const [me]=outfield(sim,'gold');if(human)sim.lockHuman(me);
 for(let i=0;i<20;i++)sim.step(DT*.32);
 sim.ball.owner=null;sim.ball.target=null;sim.ball.intBy=null;sim.ballIsShot=false;sim.ball.x=6;sim.ball.y=200;sim.ball.vx=-80;sim.ball.vy=0;sim.lastOwner=null;
 for(let i=0;i<10&&!sim.restart;i++)sim.step(DT*.32);
 assert(sim.restart&&sim.restart.kind==='kickin','the ball went out for a kick-in');
 const lo=human?.3:.98,hi=human?.58:1.8;assert(sim.restart.t>=lo&&sim.restart.t<=hi,(human?'human':'AI-only')+' kick-in beat '+sim.restart.t);}

// ---- 5. Beach periods start with the quick reset when a human is joined; joining mid-celebration / mid-fetch skips the walk ----
{const sim=new MatchSim(3,'beach');sim.windupScale=.48;const [me]=outfield(sim,'gold');sim.lockHuman(me);
 for(let i=0;i<30;i++)sim.step(DT*.48);sim.ballIsShot=false;sim.goalHold=0;sim.periodEnd=sim.clock;sim.step(DT*.48);
 assert.equal(sim.period,2);assert(sim.restart&&sim.restart.quick&&!sim.restart.carry,'period 2: quick kick-off, no fetch');}
{const sim=new MatchSim(3,'beach');for(let i=0;i<30;i++)sim.step(DT);sim.ballIsShot=false;sim.goalHold=0;sim.periodEnd=sim.clock;sim.step(DT);
 assert(sim.restart&&sim.restart.carry==='fetch','AI-only beach keeps the fetch-and-carry');
 sim.lockHuman(outfield(sim,'gold')[0]);assert(sim.restart.quick&&!sim.restart.carry,'a join mid-fetch switches to the quick reset');}
{const sim=new MatchSim(8,'7v7');sim.goalHold=1.2;sim.goalNet='top';sim.goalQuick=false;sim.lockHuman(outfield(sim,'blue')[0]);
 assert.equal(sim.goalHold,0,'a join mid-celebration ends it');assert(sim.restart.quick&&sim.possession==='blue','quick kick-off for the side that conceded');}

// ---- 6. Idle human: left out of the presser / cover picks (control never switched); a closing human takes the press ----
{const sim=new MatchSim(6,'9v9');const [c]=outfield(sim,'gold'),[me,ai]=outfield(sim,'blue');clear(sim);
 put(sim,c,135,200);put(sim,me,135,192);put(sim,ai,150,186);sim.ball.owner=c;sim.possession='gold';sim.lockHuman(me);
 sim.computeTargets(DT);assert.equal(sim.presserId,me,'the nearest (active) human is the presser');
 sim.hIdle.set(me,SOFT_FEED.idle+.1);sim.computeTargets(DT);assert.equal(sim.presserId,ai,'idle: an AI team-mate presses instead');
 assert.notEqual(sim.defenseIntent.cover,me,'idle: not the cover either');assert.equal(sim.isHuman(me),true,'still his player');
 // double: the AI is nearer, the human is closing within doubleD → he presses, the AI covers
 sim.hIdle.set(me,0);put(sim,ai,135,195);put(sim,me,135,200-SOFT_FEED.doubleD+6,0,30);sim.presserId=null;
 sim.computeTargets(DT);assert.equal(sim.presserId,me,'closing human takes the press');assert.equal(sim.defenseIntent.cover,ai,'the AI presser drops to cover');
 put(sim,me,135,200-SOFT_FEED.doubleD+6,0,-30);sim.presserId=null;sim.computeTargets(DT);assert.equal(sim.presserId,ai,'moving away: the AI keeps the press');}

// ---- 7. Determinism + touch-rate band: a scripted kid, seeded twice → identical; touches/min in band, not every pass his ----
function kidRun(format,seed,mins){const SP=format==='futsal'||format==='beach'?.48:.32;const sim=new MatchSim(270+seed*41,format);sim.windupScale=SP;sim.receiveSettle=settlePace(sim.goalVenue.width,SP);
 const me=outfield(sim,'gold').sort((a,b)=>Math.hypot(sim.players[a].x-135,sim.players[a].y-230)-Math.hypot(sim.players[b].x-135,sim.players[b].y-230))[0];sim.lockHuman(me);
 let r=seed*7919+1;const rnd=()=>{r=(r*1103515245+12345)>>>0;return r/4294967296;};
 let touches=0,prev=null,next=0,t=0,feeds=0,aiPasses=0,f={mx:0,my:0};
 const n=Math.round(mins*60/DT);let h=2166136261>>>0;
 for(let i=0;i<n;i++){t+=DT;const p=sim.players[me],b=sim.ball,o=b.owner;
  if(t>=next){next=t+.35*(.7+.6*rnd());const to=(x,y)=>{const a=Math.atan2(y-p.y,x-p.x)+(rnd()*2-1)*.7;return {mx:Math.cos(a),my:Math.sin(a)};};
   if(o===me){f=to(135,8);if(Math.hypot(135-p.x,8-p.y)<150&&rnd()<.6)Object.assign(f,{shoot:true,shootPower:.3});else if(rnd()<.35)f.pass=true;}
   else if(o&&sim.players[o].team==='gold'){f=to(Math.max(30,Math.min(240,p.x+(rnd()-.5)*40)),Math.max(40,sim.players[o].y-70));}
   else if(o){const c=sim.players[o];f=to(c.x,c.y+6);if(Math.hypot(c.x-p.x,c.y-p.y)<22&&rnd()<.45)f.tackle=true;}else f=to(b.x,b.y);}
  sim.humanInput(me,f);delete f.shoot;delete f.pass;delete f.tackle;
  const tgt0=b.target,own0=o;sim.step(DT*SP);
  if(sim.ball.owner===me&&prev!==me)touches++;
  if(own0&&own0!==me&&sim.players[own0].team==='gold'&&sim.ball.owner===null&&sim.ball.target&&sim.ball.target!==tgt0){aiPasses++;if(sim.ball.target===me)feeds++;}
  prev=sim.ball.owner;if(i%30===0){for(const v of [sim.ball.x,sim.ball.y,p.x,p.y]){const s=String(Math.round(v*1e3));for(let k=0;k<s.length;k++)h=Math.imul(h^s.charCodeAt(k),16777619)>>>0;}}}
 return {perMin:touches/mins,share:aiPasses?feeds/aiPasses:0,hash:h};}
{const a=kidRun('9v9',3,1.5),b=kidRun('9v9',3,1.5);assert.equal(a.hash,b.hash,'a joined match is deterministic (seeded, pure geometry)');}
for(const [format,lo] of [['11v11',2.5],['9v9',3.2],['7v7',4],['futsal',5.2]]){let per=0,share=0;const seeds=[1,2,3,4];
 for(const s of seeds){const r=kidRun(format,s,3);per+=r.perMin/seeds.length;share+=r.share/seeds.length;}
 if(process.env.V)console.log(format,per.toFixed(2),share.toFixed(2));assert(per>=lo,`${format}: kid touches/min ${per.toFixed(2)} >= ${lo}`);assert(share<=(format==='7v7'?.75:.7),`${format}: not every AI pass goes to the kid (${(share*100).toFixed(0)}%)`);} // 7v7 .75 (Nov 7 2026, live mechanics): 4 seeds swing .56-.80 with any seeded change; 16 seeds read .74 before the mechanics, .70 after // Tier 2: the give-and-go return (HUMAN_FEED.giveGoFree) counts here: futsal ~64 %

console.log('PASS live kid feed: AI-only unchanged, soft receiver + cap, starved caller, real-second restarts, quick beach periods / join reset, idle cover, press double, deterministic touch band');
