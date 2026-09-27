// Lane B (docs/pass-puzzle/CONTRACT.md): live-match event → action layer (lib/town/match/choreo.ts),
// the sim's touch events, the called receiver + ready marker and the turn-scaled kick wind-up.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),T=require('three'),cache=new Map();
const ctx=new Proxy({measureText:t=>({width:t.length*20}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]??(()=>{})});
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,Math,window:{matchMedia:()=>({matches:false}),innerHeight:800,addEventListener(){},removeEventListener(){}},document:{createElement:()=>({getContext:()=>ctx})},localStorage:{getItem:()=>null,setItem(){}},require:id=>id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return m.exports;}
const choreo=load('lib/town/match/choreo.ts'),{MatchSim}=load('lib/town/match/matchSim.ts');
const {windupSeconds,windupTurnShare,heightReaction,touchActions,createChoreo,REACTION_SECONDS}=choreo;
const near=(a,b,e=1e-9)=>Math.abs(a-b)<=e;

// ---- wind-up formula: 0.26 + |turn|/π × 0.3 ----
assert(near(windupSeconds(0),.26));assert(near(windupSeconds(Math.PI),.56));assert(near(windupSeconds(Math.PI/2),.41));
assert(near(windupSeconds(-1),windupSeconds(1)),'symmetric in turn direction');assert(near(windupSeconds(10),.56),'never longer than an about-turn');
assert(near(windupTurnShare(0),0),'a square-on kick is all leg swing');assert(windupTurnShare(Math.PI)>.5,'an about-turn spends most of it turning');

// ---- ball height chooses the body part ----
assert.equal(heightReaction(0),undefined);assert.equal(heightReaction(.3),undefined);assert.equal(heightReaction(.5),'thigh');
assert.equal(heightReaction(1),'chest');assert.equal(heightReaction(1.8),'header');

// ---- pure mapping: one touch → actions ----
const mk=(id,team,extra={})=>({id,team,role:'mid',isGK:false,x:0,y:0,vx:0,vy:0,...extra});
const fake={players:{a:mk('a','gold'),b:mk('b','blue',{vx:60}),k:mk('k','blue',{isGK:true,role:'gk'}),c:mk('c','gold')},ids:['a','b','k','c']};
const ev=(kind,id,o={})=>({serial:1,kind,id,other:null,team:fake.players[id].team,height:0,speed:200,heavy:false,time:0,...o});
let out=touchActions(ev('receive','a',{height:1}),fake);assert.equal(out[0].reaction,'chest');assert(out[0].squash<0,'a control squashes down');
out=touchActions(ev('receive','a',{height:.6}),fake);assert.equal(out[0].reaction,'thigh');
out=touchActions(ev('receive','a',{height:1.7}),fake);assert.equal(out[0].reaction,'header');assert(out[0].squash>0,'a header stretches up');
out=touchActions(ev('receive','a',{height:0}),fake);assert.equal(out[0].reaction,undefined,'a ground pass is an ordinary foot touch');
assert(touchActions(ev('receive','a',{heavy:true}),fake)[0].squash<touchActions(ev('receive','a'),fake)[0].squash,'a heavy touch squashes deeper');
out=touchActions(ev('receive','k',{height:1}),fake);assert.equal(out[0].reaction,undefined,'keepers catch with their hands');
out=touchActions(ev('intercept','b',{speed:150}),fake);assert.equal(out[0].reaction,'slide','a running defender slides to cut it out');
out=touchActions(ev('intercept','b',{speed:300}),fake);assert.equal(out[0].reaction,'deflect','a pacey ball is blocked');
out=touchActions(ev('tackle','b',{other:'a'}),fake);assert.equal(JSON.stringify(out.map(a=>[a.id,a.reaction])),JSON.stringify([['b','slide'],['a','stumble']]),'the tackler slides, the carrier stumbles');
assert.equal(touchActions(ev('heavy','a'),fake)[0].reaction,'stumble');assert.equal(touchActions(ev('parry','k'),fake)[0].reaction,'deflect');
out=touchActions(ev('kick','a',{speed:460}),fake);assert(out[0].reaction===undefined&&out[0].squash>3,'a strike stretches');
out=touchActions(ev('goal','a',{team:'gold'}),fake);assert.equal(JSON.stringify(out.map(a=>a.id).sort()),JSON.stringify(['b','k']),'only the conceding side is dejected');
assert(out.every(a=>a.reaction==='dejected'&&a.delay>0)&&new Set(out.map(a=>a.delay)).size===2,'dejection is staggered');
for(const a of touchActions(ev('receive','a',{speed:1e5,height:3}),fake))assert(a.squash>=-3.5&&a.squash<=4,'squash stays in the contract range');

// ---- the choreo bookkeeping over time ----
function fakeSim(){const touches=Array.from({length:8},()=>({serial:0}));let n=0;
 return {players:JSON.parse(JSON.stringify(fake.players)),ids:fake.ids,touches,get touchSerial(){return n;},callFor:null,kickWindup:null,ball:{x:0,y:0},
  emit(e){const slot=touches[n%8];n++;Object.assign(slot,{other:null,height:0,speed:200,heavy:false,time:0,...e,serial:n,team:e.team??this.players[e.id].team});}};}
{const sim=fakeSim(),c=createChoreo(),m={};
 sim.emit({kind:'receive',id:'a',height:1});c.consume(sim,0);c.apply('a',m,0);
 assert.equal(m.reaction,'chest');assert.equal(m.reactionProgress,0);assert.equal(m.squashSerial,1);const sq=m.squash;
 c.consume(sim,REACTION_SECONDS.chest/2);c.apply('a',m,0);assert(near(m.reactionProgress,.5,1e-9),'progress follows real time');assert.equal(m.squashSerial,1,'one impulse per touch, not per frame');assert.equal(m.squash,sq);
 c.consume(sim,REACTION_SECONDS.chest);c.apply('a',m,0);assert.equal(m.reaction,undefined,'the action ends and clears');assert.equal(m.reactionProgress,undefined);
 c.consume(sim,0);c.apply('c',m,0);assert.equal(m.reaction,undefined);assert.equal(m.squashSerial,undefined,'untouched players carry no choreo');
 sim.emit({kind:'kick',id:'a',speed:300});c.consume(sim,0);c.apply('a',m,0);assert.equal(m.squashSerial,2);assert(m.squash>0);
 // The ball's control height is kept for the cushion only (so the view drops it from the chest), and a tackle resets it.
 {const h=createChoreo(),q=fakeSim();q.emit({kind:'receive',id:'a',height:1.1});h.consume(q,0);assert.equal(h.touchHeight('a'),1.1);h.consume(q,2);assert.equal(h.touchHeight('a'),0,'a stale control height never lifts a later touch');
  q.emit({kind:'receive',id:'a',height:1.1});q.emit({kind:'tackle',id:'a',other:'b'});h.consume(q,0);assert.equal(h.touchHeight('a'),0,'a won tackle is a ground touch');}
 // A paused match (dt 0) holds the pose where it is.
 sim.emit({kind:'heavy',id:'a'});c.consume(sim,.1);c.apply('a',m,0);const held=m.reactionProgress;c.consume(sim,0);c.consume(sim,0);c.apply('a',m,0);assert.equal(m.reactionProgress,held,'paused: no progress');
 // Staggered dejection starts after its delay, and only then squashes.
 sim.emit({kind:'goal',id:'a',team:'gold'});c.consume(sim,0);const d={};c.apply('b',d,0);assert.equal(d.reaction,undefined,'dejection waits for its stagger');
 c.consume(sim,.5);c.apply('b',d,0);assert.equal(d.reaction,'dejected');assert.equal(d.squashSerial,1);
 // Ring overflow: a match asleep for more than 8 touches replays only the newest ones.
 for(let i=0;i<20;i++)sim.emit({kind:'kick',id:'c',speed:100});c.consume(sim,0);const k={};c.apply('c',k,0);assert.equal(k.squashSerial,8,'reads at most the ring');
}
// Called receiver + ready marker.
{const sim=fakeSim(),c=createChoreo(),P=sim.players;Object.assign(P.a,{x:0,y:0});Object.assign(P.b,{x:8,y:0,vx:0});Object.assign(P.c,{x:60,y:0});Object.assign(P.k,{x:2,y:0});
 sim.kickWindup={id:'c',to:'a'};sim.callFor='a';c.consume(sim,0);const ma={},mb={},mk={},mc={};c.apply('a',ma,0);c.apply('b',mb,0);c.apply('k',mk,0);c.apply('c',mc,0);
 assert.equal(ma.called,1,'the chosen receiver calls for it during the wind-up');assert(mb.ready>0,'his nearest marker gets ready');assert.equal(mk.ready,0,'keepers are never the marker');assert.equal(mc.called,0);
 c.apply('b',mb,.9);assert.equal(mb.ready,0,'no ready crouch at a sprint');
 sim.kickWindup=null;sim.ball={x:40,y:0};c.consume(sim,0);c.apply('a',ma,0);assert.equal(ma.called,1,'still calling while the ball travels');
 sim.ball={x:10,y:0};c.consume(sim,0);c.apply('a',ma,0);assert.equal(ma.called,0,'the arm drops as the ball arrives');
 P.k.isGK=false;P.k.team='blue';P.k.x=10.5;sim.ball={x:40,y:0};c.consume(sim,0);assert.equal(c.marker,'b','hysteresis keeps the marker against a barely closer defender');
 P.k.x=2;c.consume(sim,0);assert.equal(c.marker,'k','a clearly closer defender takes over');
 sim.callFor=null;c.consume(sim,0);c.apply('a',ma,0);c.apply('k',mk,0);assert.equal(ma.called,0);assert.equal(mk.ready,0);
}

// ---- the real sim: touches, wind-up timing and calls ----
{const kinds={},delays=[],heights=[];let checkedCall=0,flightCalls=0,reactions={};
 for(const seed of [3,8,21]){const s=new MatchSim(seed,'11v11');let seen=0,wind=null,start=0,kicks=s.kicks;const c=createChoreo();
  assert.equal(s.windupScale,.32,'11v11 wind-up runs at the live game speed');
  for(let i=0;i<30*150;i++){s.step(1/30);
   const w=s.kickWindup;if(w&&w!==wind){wind=w;start=s.stats.time-(w.dur-w.t);}
   if(w){assert.equal(s.callFor,w.to,'the wind-up target is the caller');checkedCall++;}
   if(s.kicks!==kicks){kicks=s.kicks;if(wind&&!w){delays.push({took:s.stats.time-start,want:windupSeconds(wind.turn)*.32});}wind=null;}
   if(!w&&s.callFor){flightCalls++;assert(s.ball.owner===null,'a flight call only while the ball travels');}
   for(let n=Math.max(seen+1,s.touchSerial-7);n<=s.touchSerial;n++){const e=s.touches[(n-1)%8];kinds[e.kind]=(kinds[e.kind]||0)+1;if(e.kind==='receive'&&!s.players[e.id].isGK)heights.push(e.height);}
   seen=s.touchSerial;
   c.consume(s,1/30/.32);for(const id of s.ids){const r=c.reactionOf(id);if(r)reactions[r]=(reactions[r]||0)+1;}
  }}
 for(const k of ['receive','kick','tackle','intercept'])assert(kinds[k]>0,`sim emits ${k} touches (${JSON.stringify(kinds)})`);
 assert(delays.length>100,'AI kicks wind up');
 for(const d of delays)assert(d.took>=d.want-1/30-1e-9&&d.took<=d.want+1/30+1e-9,`wind-up lasts windupSeconds(turn) × game speed (${d.took.toFixed(3)} vs ${d.want.toFixed(3)})`);
 const mean=delays.reduce((a,d)=>a+d.took,0)/delays.length;assert(mean>.26*.32&&mean<.56*.32,'mean wind-up is between square-on and about-turn');
 assert(checkedCall>50&&flightCalls>50,'receivers call during wind-ups and flights');
 assert(heights.some(h=>h>=.4),'11v11 lofted balls are controlled above the feet');
 for(const r of ['chest','slide','stumble'])assert(reactions[r]>0,`live play shows ${r} reactions (${JSON.stringify(reactions)})`);
 console.log('CHOREO_SIM',JSON.stringify({kinds,windups:delays.length,meanWindupSim:+mean.toFixed(3),aboveFeet:heights.filter(h=>h>=.4).length,reactions}));
}
// Direct kicks (tests/tools) are immediate; only decisions inside the match wind up. Futsal scales by .48.
{const s=new MatchSim(9,'7v7');s.restart=null;s.ball.owner='lm';const k=s.kicks;s.doPass('lm','cm');assert.equal(s.kicks,k+1,'a direct doPass releases at once');
 assert.equal(new MatchSim(2,'futsal').windupScale,.48,'futsal wind-up uses the futsal game speed');}
// A kick released during a wind-up can be cut short by a tackle: the ball then goes to the tackler, no ghost kick.
{const s=new MatchSim(5,'11v11');for(let i=0;i<30*120;i++){s.step(1/30);const w=s.kickWindup;if(w){const o=s.players[w.id];assert.equal(s.ball.owner,w.id,'only the carrier winds up');assert(!o||!s.restart);}}}

// ---- fieldRuntime glue: reactions, calls, markers and the wind-up pose reach PlayerMotion ----
{const {createFieldRuntime,LIVE_GAME_SPEED}=load('lib/town/fieldRuntime.ts'),{PLAYER_KICK_CONTACT}=load('lib/graphics/player.ts');
 const scene=new T.Scene(),runtime=createFieldRuntime(scene),camera=new T.PerspectiveCamera(60,1,.1,500),e=runtime.entries.find(e=>e.venue.id==='11v11'),v=e.venue;
 camera.position.set(v.x,110,v.z+40);camera.lookAt(v.x,0,v.z);camera.updateMatrixWorld();
 assert.equal(e.sim.windupScale,LIVE_GAME_SPEED,'the runtime sets the sim wind-up scale to the live speed');
 const seen={called:0,ready:0,reaction:{},windupKick:0,squash:0};let maxWind=0;
 for(let i=0;i<30*40;i++){runtime.update(1/30,i/30,camera,null,true,'11v11');
  for(const [id,row] of e.liveFrame.rows){const m=row.motion;if(!m)continue;if(m.called>0)seen.called++;if(m.ready>0)seen.ready++;if(m.reaction)seen.reaction[m.reaction]=(seen.reaction[m.reaction]||0)+1;if(m.squashSerial)seen.squash++;
   const w=e.sim.kickWindup;if(w&&w.id===id&&m.kick>0){seen.windupKick++;maxWind=Math.max(maxWind,m.kick);assert(m.kick<=PLAYER_KICK_CONTACT+1e-9,'the wind-up swing stops at contact');}}
 }
 assert(seen.called>20,'a called receiver shows in live play');assert(seen.ready>20,'a ready marker shows in live play');
 assert(seen.windupKick>5,'the kicker swings through the wind-up');assert(Object.keys(seen.reaction).length>=1,'reactions reach the rig');assert(seen.squash>0,'squash impulses reach the rig');
 console.log('CHOREO_RUNTIME',JSON.stringify({...seen,maxWind:+maxWind.toFixed(3)}));
}
console.log('PASS choreo: wind-up formula, touch → reaction/squash mapping, timed bookkeeping, called receiver + ready marker, sim touches + wind-up timing, runtime glue');
