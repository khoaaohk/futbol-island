// Seeded balance harness for lib/town/match/matchSim.ts (see docs/body-mechanics/BODY_MECHANICS.md).
// Runs 24 seeds × 3 simulated minutes per format, stepped at 1/30 s, and prints per format:
// goals per game, possession switches per minute, one-sided games (a team ahead by >= 3),
// mean outfield speed (u/s), plant events per minute and backpedal share of defender time.
// Usage: node scripts/sim-balance.mjs [--seeds 24] [--minutes 3] [--format 7v7] [--seed-start 0]
// (--seed-start 24 --seeds 96 is the larger out-of-gate sample used to separate real shifts from
// seed noise: goals/game on 24 seeds has ~10 % standard error, see balance-after.txt)
// Compare against docs/body-mechanics/balance-before.txt: every number must stay within ±15 %.
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const require=createRequire(import.meta.url);
const ts=require('typescript');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const cache=new Map();
function load(file){
 if(cache.has(file))return cache.get(file);
 const m={exports:{}};
 const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInNewContext(out,{module:m,exports:m.exports,Math,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});
 cache.set(file,m.exports);return m.exports;
}
const {MatchSim}=load(path.join(root,'lib/town/match/matchSim.ts'));
const arg=(name,fallback)=>{const i=process.argv.indexOf(name);return i>=0?process.argv[i+1]:fallback;};
const SEED0=+arg('--seed-start',0),SEEDS=+arg('--seeds',24),MINUTES=+arg('--minutes',3),ONLY=arg('--format',null);
const DT=1/30,STEPS=Math.round(MINUTES*60/DT);
const formats=ONLY?[ONLY]:['futsal','7v7','9v9','11v11'];
const rows=[];
for(const format of formats){
 let goals=0,switches=0,oneSided=0,speedSum=0,speedN=0,plants=0,backSteps=0,defSteps=0,shots=0,passes=0,turnovers=0,crosses=0,fieldSwitches=0,frameHits=0;
 const t0=performance.now();
 for(let i=SEED0;i<SEED0+SEEDS;i++){
  const seed=11+i*17;
  const sim=new MatchSim(seed,format);
  let prevPoss=sim.possession;
  const prevPlant=new Map();
  for(let tick=0;tick<STEPS;tick++){
   sim.step(DT);
   if(sim.possession!==prevPoss){switches++;prevPoss=sim.possession;}
   for(const id of sim.ids){
    const p=sim.players[id];
    if(p.isGK)continue;
    speedSum+=Math.hypot(p.vx,p.vy);speedN++;
    const plant=p.plant??0,was=prevPlant.get(id)??0;
    if(plant>=.5&&was<.5)plants++;
    prevPlant.set(id,plant);
    if(p.role==='def'){defSteps++;if((p.backpedal??0)>.5)backSteps++;}
   }
  }
  goals+=sim.score.gold+sim.score.blue;
  if(Math.abs(sim.score.gold-sim.score.blue)>=3)oneSided++;
  crosses+=sim.stats.crosses;fieldSwitches+=sim.stats.switches;frameHits+=sim.frameContact.serial;shots+=sim.stats.shots;passes+=sim.stats.passes;turnovers+=sim.stats.turnovers+sim.stats.interceptions+sim.stats.looseOpp;
 }
 const minutes=SEEDS*MINUTES;
 rows.push({
  format,
  goalsPerGame:+(goals/SEEDS).toFixed(3),
  switchesPerMin:+(switches/minutes).toFixed(2),
  oneSided,
  meanOutfieldSpeed:+(speedSum/speedN).toFixed(2),
  plantsPerMin:+(plants/minutes).toFixed(2),
  defBackpedalShare:+(backSteps/Math.max(1,defSteps)).toFixed(3),
  shotsPerGame:+(shots/SEEDS).toFixed(2),
  crossesPerGame:+(crosses/SEEDS).toFixed(2),
  fieldSwitchesPerGame:+(fieldSwitches/SEEDS).toFixed(2),
  frameHitsPerGame:+(frameHits/SEEDS).toFixed(2),
  passesPerGame:+(passes/SEEDS).toFixed(1),
  turnoversPerGame:+(turnovers/SEEDS).toFixed(1),
  cpuMs:Math.round(performance.now()-t0),
 });
}
console.log(`sim-balance: ${SEEDS} seeds${SEED0?` (from #${SEED0})`:''} x ${MINUTES} min at 1/30 s per format (${new Date().toISOString().slice(0,10)})`);
const cols=Object.keys(rows[0]);
console.log(cols.join('\t'));
for(const r of rows)console.log(cols.map(c=>r[c]).join('\t'));
