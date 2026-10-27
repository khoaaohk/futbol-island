const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),T=require('three');
const cache=new Map(),ctx=new Proxy({measureText:text=>({width:text.length*20}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>k in o?o[k]:()=>{}});
const document={createElement:()=>({width:0,height:0,getContext:()=>ctx})},window={innerHeight:800,matchMedia:()=>({matches:false}),addEventListener(){},removeEventListener(){}};
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,{module:m,exports:m.exports,Math,Number,document,window,console,performance,require:id=>id.startsWith('.')?(id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):load(path.resolve(path.dirname(file),id+'.ts'))):require(id)});return m.exports;}
// The Sharks Beach court's match clock counts REAL seconds (QA audit 4 #7, Oct 26 2026: it ran ~0.5x wall time, 11.5 s in 24 s,
// because periods and the feed's m:ss read stats.time, the SIM clock, which fieldRuntime steps at liveGameSpeed('beach') = .48 of
// real time). The sim's pace (and so every pitch's play) is unchanged; only the clock is real. Run: node tests/beach-clock.cjs
const {MatchSim,BEACH_PERIOD,BEACH_EXTRA}=load('lib/town/match/matchSim.ts');
const {liveGameSpeed,LIVE_GAME_SPEED}=load('lib/town/fieldRuntime.ts');
const near=(a,b,eps,msg)=>assert(Math.abs(a-b)<=eps,`${msg}: ${a} vs ${b}`);
// The host (fieldRuntime.update): each frame's real dt goes to sim.step as dt × liveGameSpeed(venue).
const host=(sim,format,realSeconds,fps=60)=>{for(let i=Math.round(realSeconds*fps);i>0;i--)sim.step(1/fps*liveGameSpeed(format));return sim;};

{// The sim's playback speed is the host's: the clock divides by the same factor.
 for(const f of ['beach','futsal','7v7','9v9','11v11'])assert.equal(new MatchSim(3,f).windupScale,liveGameSpeed(f),f+': windupScale = liveGameSpeed');
 assert.equal(liveGameSpeed('beach'),.48);assert.equal(LIVE_GAME_SPEED,.32);}

{// The audit's watch: 24 real seconds at the court read 24 s on the clock (it read 11.5 before), at 60 and 30 fps.
 for(const fps of [60,30]){const sim=host(new MatchSim(11,'beach'),'beach',24,fps);
  near(sim.clock,24,.05,`${fps} fps: the clock counts real seconds`);near(sim.matchTime,24,.05,`${fps} fps: 24 s into the game`);
  near(sim.stats.time,24*.48,.05,'the sim itself still plays at the beach pace');}}

{// Periods are 60 REAL seconds: period 2 just after a minute of watching, period 3 after two, a result after ~3 (+ extra time).
 const sim=new MatchSim(11,'beach');host(sim,'beach',BEACH_PERIOD-2);assert.equal(sim.period,1,'still period 1 at 0:58');
 host(sim,'beach',6);assert.equal(sim.period,2,'period 2 at 1:04');host(sim,'beach',BEACH_PERIOD);assert.equal(sim.period,3,'period 3 at 2:04');
 host(sim,'beach',BEACH_PERIOD+BEACH_EXTRA+8);assert.equal(sim.results.length,1,'one game finished within ~3:30 of real time');
 host(sim,'beach',5);assert.equal(sim.period,1,'the 3 s full-time beat is real too: a new game');assert(sim.matchTime<BEACH_EXTRA+BEACH_PERIOD/2&&sim.clock-sim.matchTime>=3*BEACH_PERIOD,`the new game's clock restarted after a 3-period game (${sim.matchTime.toFixed(1)} of ${sim.clock.toFixed(1)})`);}

{// The feed (matchEffects → BeachMatchGuide / FieldTranscript m:ss) stamps events with the match clock, not the sim clock.
 const src=fs.readFileSync('lib/town/matchEffects.ts','utf8');assert(/time:sim\.matchTime/.test(src),'events carry sim.matchTime');assert(!/time:sim\.stats\.time/.test(src));}

{// The other formats: their clock is real seconds too and their play is untouched (stats.time unchanged).
 const sim=host(new MatchSim(5,'7v7'),'7v7',10);near(sim.clock,10,.05,'7v7 clock');near(sim.stats.time,10*LIVE_GAME_SPEED,.05,'7v7 sim pace');
 const t0=new MatchSim(5,'7v7');t0.windupScale=0;t0.step(.5);near(t0.clock,.5,1e-9,'windupScale 0: sim time is real time');}
console.log('PASS beach clock: real seconds on the clock and periods, sim pace unchanged, feed stamped with the match clock');
