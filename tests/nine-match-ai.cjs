// 9v9 live-match AI (Club Grounds, 3-2-3; Oct 10 2026): the per-format rules and habits in lib/town/match/formatAI.ts
// as the shared engine (lib/town/match/matchSim.ts) plays them. Covers: the 9v9 knobs (other formats keep their own
// rows), throw-ins, no offside from a restart, onside discipline and the timed run, a misread pass whistled offside,
// the sweeper keeper, the keeper as a pressured outlet, the alloc-free offside line, and a seeded balance band.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,{module:m,exports:m.exports,Math,Number,console,performance,require:id=>id.startsWith('.')?(id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):load(path.resolve(path.dirname(file),id+'.ts'))):require(id)});return m.exports;}
const {MatchSim}=load('lib/town/match/matchSim.ts');
const FA=load('lib/town/match/formatAI.ts');
const DT=1/30;
// A quiet open-play board: gold on the ball, everyone else parked out of the way.
function board(seed=5){const s=new MatchSim(seed,'9v9');s.restart=null;s.goalHold=0;s.possession='gold';s.windupScale=0;
 for(const id of s.ids){const p=s.players[id];Object.assign(p,{x:p.hx,y:p.hy,vx:0,vy:0});}
 for(const id of s.ids)s.brain[id].lapse=0;return s;}

// ---- 1. The 9v9 row of the shared knobs ----
{const ai=FA.formatAI('9v9');
 assert.equal(ai.touchline,'Throw-in','9v9 restarts the touchline with a throw-in (Law 15), not a futsal kick-in');
 assert(ai.onsideHold>0&&ai.offsideMisread>0&&ai.offsideMisread<.5&&ai.restartOffsideFree&&ai.sweeper>0&&ai.keeperOutlet>0&&ai.teach);
 assert.equal(FA.formatAI('futsal').touchline,'Kick-in','futsal keeps the kick-in');assert.equal(FA.formatAI('beach').sweeper,0,'beach keeps its own keeper');
 assert.equal(new MatchSim(3,'9v9').ai.sweeper,ai.sweeper,'the sim reads its format row');
 // helpers: the keeper only steps up with the ball far away, and never closer than 24 u behind his own back line
 assert.equal(FA.sweeperOffset(46,120,200),0);assert.equal(FA.sweeperOffset(46,300,200),46);assert.equal(FA.sweeperOffset(46,300,50),26);assert.equal(FA.sweeperOffset(0,300,200),0);
 assert.equal(FA.onsideDepth(260,240,3),257);assert.equal(FA.onsideDepth(150,120,3),200,'anywhere in his own half is onside');assert.equal(FA.onsideDepth(250,300,3),297,'level with the ball counts');}

// ---- 2. Offside line: the alloc-free scan picks the second-deepest opponent ----
{const s=board(),rnd=(()=>{let k=7;return()=>(k=(k*16807)%2147483647)/2147483647;})();
 for(let n=0;n<200;n++){for(const id of s.blueIds)s.players[id].y=8+rnd()*384;
  const ds=s.blueIds.map(id=>s.depth('gold',s.players[id].y)).sort((a,b)=>b-a);assert.equal(s.offsideLine('gold'),ds[1]);}}

// ---- 3. Throw-in: a ball over the touchline is a throw-in, explained once in the feed ----
{const s=board();const st=s.goldIds.find(id=>s.players[id].role==='fwd');s.ball.owner=null;Object.assign(s.ball,{x:261,y:200,vx:200,vy:0});s.possession='gold';s.ballFlight=0;
 s.ballLogic(DT);assert.equal(s.restart?.kind,'kickin');assert.equal(s.msg,'Throw-in');assert.match(s.note.text,/^Throw-in for Blue/);void st;
 const f=new MatchSim(5,'futsal');f.restart=null;f.goalHold=0;f.ball.owner=null;Object.assign(f.ball,{x:261,y:200,vx:200,vy:0});f.ballFlight=0;f.ballLogic(DT);assert.equal(f.msg,'Kick-in','futsal unchanged');}

// ---- 4. No offside from a throw-in / goal kick / corner: the taker's first pass is free; any kick ends it ----
{const s=board();const st='st';Object.assign(s.players[st],{x:135,y:36});// beyond blue's back line
 s.ball.owner='lcm';s.ball.x=s.players.lcm.x;s.ball.y=s.players.lcm.y;assert(s.isOffside('gold',s.players[st].y),'beyond the line in open play');
 s.restart={kind:'kickin',t:0,x:s.players.lcm.x,y:s.players.lcm.y,taker:'lcm'};s.restartLogic(DT);
 assert.equal(s.ball.owner,'lcm');assert(!s.isOffside('gold',s.players[st].y),'a throw-in cannot be offside (Law 11)');
 s.doPass('lcm','rcm');assert.equal(s.offsideFree,null,'the exemption ends with the first kick');
 const k=board();k.ball.owner='lcm';k.restart={kind:'kickoff',t:0,x:135,y:200,taker:'lcm'};for(const id of k.ids){const p=k.players[id];if(id!=='lcm')p.y=p.team==='gold'?Math.max(p.y,215):Math.min(p.y,185);}k.restartLogic(DT);assert.equal(k.offsideFree,null,'a kick-off is not exempt');}

// ---- 5. Onside discipline: off-ball attackers hold level with the last defender; the shaped-for runner times his run ----
{const s=board();for(const id of s.blueIds){const p=s.players[id];if(!p.isGK)p.y=Math.max(p.y,170);}// blue holds a high line
 s.ball.owner='lcm';Object.assign(s.players.lcm,{x:96,y:200});s.ball.x=96;s.ball.y=200;
 Object.assign(s.players.st,{x:135,y:70});Object.assign(s.players.lw,{x:50,y:70});// both parked offside
 for(let i=0;i<20;i++){s.computeTargets(DT);}
 const cap=FA.onsideDepth(s.offsideLine('gold'),s.depth('gold',s.ball.y),s.ai.onsideHold);
 for(const id of ['lw','rw']){const p=s.players[id];if(s.combos?.runTarget(id))continue;assert(s.depth('gold',s.targets[id].y)<=cap+.5,id+' holds onside, level with the line: '+s.depth('gold',s.targets[id].y)+' vs '+cap);}
 // the ball-watching lapse is the organic error: that forward is left where his run takes him
 const lapse=board();for(const id of lapse.blueIds){const p=lapse.players[id];if(!p.isGK)p.y=Math.max(p.y,170);}lapse.ball.owner='lcm';Object.assign(lapse.players.lcm,{x:96,y:200});lapse.ball.x=96;lapse.ball.y=200;
 const neutral=board();Object.assign(neutral,{ai:{...FA.FORMAT_AI_NEUTRAL}});for(const id of neutral.blueIds){const p=neutral.players[id];if(!p.isGK)p.y=Math.max(p.y,170);}neutral.ball.owner='lcm';Object.assign(neutral.players.lcm,{x:96,y:200});neutral.ball.x=96;neutral.ball.y=200;
 neutral.computeTargets(DT);const free=Math.max(...['lw','st','rw'].map(id=>neutral.depth('gold',neutral.targets[id].y)));
 assert(free>cap+4,'without the 9v9 knob forwards stand beyond the line (the old habit the knob fixes): '+free);
 // timed run: the man a pass is being shaped for may arrive LEVEL as it is struck, never clearly beyond
 const t=board();for(const id of t.blueIds){const p=t.players[id];if(!p.isGK)p.y=Math.max(p.y,170);}t.ball.owner='lcm';Object.assign(t.players.lcm,{x:96,y:200});t.ball.x=96;t.ball.y=200;
 t.windup={id:'lcm',kind:'pass',to:'rw',firm:1,loftKind:'through',t:.2,dur:.2,tx:0,ty:0,turn:0};t.computeTargets(DT);
 const tcap=FA.onsideDepth(t.offsideLine('gold'),t.depth('gold',t.ball.y),t.ai.onsideHold)+t.ai.onsideHold+4;
 assert(t.depth('gold',t.targets.rw.y)<=tcap+.5&&tcap<t.offsideLine('gold')+6,'timed run stays inside the +6 benefit of the doubt');}

// ---- 6. A misread pass to a forward standing offside is whistled when he receives it ----
{const s=board();for(const id of s.blueIds){const p=s.players[id];if(!p.isGK)Object.assign(p,{x:p.x<135?40:230,y:110});}
 Object.assign(s.players.lcm,{x:135,y:230});s.ball.owner='lcm';s.ball.x=135;s.ball.y=230;Object.assign(s.players.st,{x:135,y:80,vx:0,vy:0});
 assert(s.isOffside('gold',80));s.rng=()=>.99;// no lane interception, no misplacement
 s.doPass('lcm','st');assert.equal(s.offsidePass?.id,'st','the pass to an offside receiver is flagged at release');
 let called=false;for(let i=0;i<90&&!called;i++){s.ballLogic(DT);s.computeTargets(DT);s.integrate(DT);called=s.stats.offsideCalls===1;}
 assert(called,'offside is called on reception');assert.equal(s.possession,'blue','free kick to the defence');assert.equal(s.msg,'Offside!');assert.equal(s.note.text,'Offside!');
 assert(s.blueIds.includes(s.ball.owner)&&!s.players[s.ball.owner].isGK);
 // an onside pass is never flagged, and other formats never call it
 const ok=board();ok.rng=()=>.99;Object.assign(ok.players.lcm,{x:135,y:230});ok.ball.owner='lcm';ok.ball.x=135;ok.ball.y=230;ok.doPass('lcm','rcm');assert.equal(ok.offsidePass,null);
 const f=new MatchSim(5,'futsal');assert.equal(f.ai.offsideMisread,0,'futsal has no offside to call');}

// ---- 7. Sweeper keeper: steps up behind a high line, back on the angle line when play comes back ----
{const s=board();const gk=s.players.gk;s.shape.gold.line=170;s.ball.owner='rw';Object.assign(s.players.rw,{x:200,y:90});s.ball.x=200;s.ball.y=90;
 for(let i=0;i<90;i++)s.computeTargets(DT);const high=Math.abs(s.targets.gk.y-392);assert(high>=40&&high<=67,'sweeper keeper ~8-12 m off his line, inside his 13 m box: '+high);
 s.possession='blue';s.ball.owner='dst';Object.assign(s.players.dst,{x:150,y:330});s.ball.x=150;s.ball.y=330;s.shape.gold.line=50;
 for(let i=0;i<90;i++)s.computeTargets(DT);assert(Math.abs(s.targets.gk.y-392)<=14,'set on the angle line when the danger is near');void gk;
 const n=board();Object.assign(n,{ai:{...FA.FORMAT_AI_NEUTRAL}});n.shape.gold.line=170;n.ball.owner='rw';Object.assign(n.players.rw,{x:200,y:90});n.ball.x=200;n.ball.y=90;n.computeTargets(DT);
 assert(Math.abs(n.targets.gk.y-392)<12,'(the old keeper stayed on his line)');}

// ---- 8. The keeper is the free player for a pressed defender in his own half with nothing on ahead ----
// (team-mates only half-open, every forward option behind a marker: the old AI forced it into the half-open man)
function pressed(neutral){const s=board();if(neutral)Object.assign(s,{ai:{...FA.FORMAT_AI_NEUTRAL}});s.rng=()=>.5;
 for(const id of s.blueIds){const p=s.players[id];if(!p.isGK)Object.assign(p,{x:240,y:120});}
 for(const id of s.goldIds){const p=s.players[id];if(!p.isGK)Object.assign(p,{x:240,y:140});}
 Object.assign(s.players.lcb,{x:70,y:330});Object.assign(s.players.dst,{x:76,y:322});// presser on him
 Object.assign(s.players.cb,{x:150,y:345});Object.assign(s.players.dlw,{x:150,y:327});// the nearest mate, 18 u from his marker
 s.ball.owner='lcb';return s.safePass('lcb');}
assert.equal(pressed(false),'gk','9v9: back to the keeper');assert.equal(pressed(true),'cb','(the old AI forced it into the half-marked man)');
// ---- 9. Seeded matches: offside is rare and honest, the shape stays onside, the balance holds ----
{let goals=0,calls=0,offF=0,possF=0,oob=0;const N=6,SEC=180;
 for(let k=0;k<N;k++){const s=new MatchSim(11+k*17,'9v9');
  for(let i=0;i<SEC/DT;i++){s.step(DT);if(s.restart||s.goalHold>0||!s.ball.owner)continue;possF++;
   for(const id of s.mates(s.possession)){const p=s.players[id];if(!p.isGK&&s.isOffside(s.possession,p.y)){offF++;break;}}
   for(const id of s.ids){const p=s.players[id];if(p.x<0||p.x>270||p.y<0||p.y>400)oob++;}}
  goals+=s.score.gold+s.score.blue;calls+=s.stats.offsideCalls;}
 assert.equal(oob,0,'nobody leaves the pitch');
 assert(offF/possF<.05,'attackers rarely loiter offside: '+(offF/possF*100).toFixed(1)+'% (was ~16% before the 9v9 knobs)');
 assert(calls/N<=2.5,'offside is called about once a game, not a whistle-fest: '+calls/N);
 assert(goals/N>=1.5&&goals/N<=5.5,'goals per 3-minute game in the watchable band: '+goals/N);}
console.log('NINE_MATCH_AI_PASS');
