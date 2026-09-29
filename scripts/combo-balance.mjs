// Seeded balance + frequency report for the combination plays (lib/town/match/combos.ts, docs/bean-characters/CONTRACT.md
// "Combos lane"). Same stepping as scripts/sim-balance.mjs (1/30 s, 3 simulated minutes, seed = 11 + i·17), plus how
// often each combination happens per game. `--combos off` runs the identical code with the combos switched off
// (the before game), so before/after compare the same tree.
// Usage: node scripts/combo-balance.mjs [--trail1 1.25 --trail2 1.5 --brakeLead1 .5 --brakeLead2 0] [--seeds 96] [--seed-start 24] [--minutes 3] [--format 7v7[,9v9]] [--combos on|off] [--off rebound,box]
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
 const m={exports:{}};cache.set(file,m.exports);
 const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInNewContext(out,{module:m,exports:m.exports,Math,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});
 return m.exports;
}
const {MatchSim}=load(path.join(root,'lib/town/match/matchSim.ts'));
const C=load(path.join(root,'lib/town/match/combos.ts'));
const arg=(n,f)=>{const i=process.argv.indexOf(n);return i>=0?process.argv[i+1]:f;};
const SEED0=+arg('--seed-start',24),SEEDS=+arg('--seeds',96),MIN=+arg('--minutes',3),ON=arg('--combos','on')!=='off';
const formats=(arg('--format','futsal,7v7,9v9,11v11')).split(',');
C.comboSettings.enabled=ON;for(const k of ['trail1','trail2','brakeLead1','brakeLead2']){const v=arg('--'+k,null);if(v!==null)C.comboSettings[k]=+v;}for(const f of (arg('--off','')||'').split(',').filter(Boolean))C.comboSettings.off[f]=true;
const DT=1/30,STEPS=Math.round(MIN*60/DT);
console.log(`combo-balance: combos ${ON?'ON':'OFF'}, ${SEEDS} seeds from #${SEED0} x ${MIN} min at 1/30 s (${new Date().toISOString().slice(0,10)})`);
console.log(['format','goalsPerGame','switchesPerMin','oneSided','shotsPerGame','turnoversPerGame','meanMargin'].join('\t'));
const freq=[];
for(const format of formats){
 let goals=0,switches=0,oneSided=0,margin=0,shots=0,turn=0;const cc=Object.fromEntries(C.COMBO_KEYS.map(k=>[k,0]));
 for(let i=SEED0;i<SEED0+SEEDS;i++){
  const sim=new MatchSim(11+i*17,format);let prev=sim.possession;
  for(let t=0;t<STEPS;t++){sim.step(DT);if(sim.possession!==prev){switches++;prev=sim.possession;}}
  goals+=sim.score.gold+sim.score.blue;margin+=Math.abs(sim.score.gold-sim.score.blue);if(Math.abs(sim.score.gold-sim.score.blue)>=3)oneSided++;
  shots+=sim.stats.shots;turn+=sim.stats.turnovers+sim.stats.interceptions+sim.stats.looseOpp;
  if(sim.combos)for(const k of C.COMBO_KEYS)cc[k]+=sim.combos.counts[k];
 }
 console.log([format,(goals/SEEDS).toFixed(3),(switches/(SEEDS*MIN)).toFixed(2),oneSided,(shots/SEEDS).toFixed(2),(turn/SEEDS).toFixed(1),(margin/SEEDS).toFixed(3)].join('\t'));
 if(ON)freq.push([format,cc]);
}
if(ON){
 console.log('\nper game:\t'+freq.map(f=>f[0]).join('\t'));
 for(const k of C.COMBO_KEYS)if(freq.some(f=>f[1][k]))console.log(k+'\t'+freq.map(f=>(f[1][k]/SEEDS).toFixed(2)).join('\t'));
}
