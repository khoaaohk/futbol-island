// CPU cost of streetTraffic.update in Node (Nov 18 2026): the same fixture as tests/traffic-junctions.cjs on the island streets,
// timed over simulated minutes with the visitor far away (distant cars defer decisions) and standing at the town crossroads.
// Run it alone (no browser, no dev server busy) and compare before/after on the same machine:  node scripts/traffic-update-bench.cjs
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),T=require('three');
const root=path.join(__dirname,'..'),src=fs.readFileSync(path.join(root,'tests/traffic-junctions.cjs'),'utf8');
process.chdir(root);
const signalsTest=path.join(root,'tests/traffic-signals.cjs');
// After Nov 18 2026 the fixture comes from tests/traffic-signals.cjs, so the lights run too (BENCH_LIGHTS=0 turns them off) and
// 60 townsfolk stand about the town for the people check (BENCH_PEOPLE=0 leaves them out). Before that date neither existed.
const LIGHTS=process.env.BENCH_LIGHTS!=='0',PEOPLE=process.env.BENCH_PEOPLE!=='0';
const fixture=fs.existsSync(signalsTest)?vm.runInNewContext(fs.readFileSync(signalsTest,'utf8').match(/function loader\(\)\{[\s\S]*?\n(?=const far=)/)[0]+';fixture',{require,path,fs,vm,ts,T,Proxy,Map,Math,Float64Array,Int8Array,module:{},exports:{},process,__dirname:path.join(root,'tests')})
 :vm.runInNewContext(`(${src.match(/function fixture\(roads[^)]*\)\{[\s\S]*?\n(?=\/\/ Authored)/)[0].trim()})`,{require,path,fs,vm,ts,T,Proxy,Map,Math,module:{},exports:{},process,__dirname:path.join(root,'tests')});
const people=PEOPLE?Array.from({length:60},(_,i)=>({position:{x:-45+(i*37%260),y:0,z:-155+(i*53%320)}})):undefined;
const island=vm.runInNewContext(src.match(/const island=(\[[^\n]*?\}\]);/)[1]);
const MIN=Number(process.env.BENCH_MINUTES||5),ROUNDS=Number(process.env.BENCH_ROUNDS||5);
for(const [name,player] of [['visitor far away',{x:900,y:40,z:900}],['visitor at the town crossroads',{x:-10.8,y:0,z:-27}]]){
 const best=[];
 for(let r=0;r<ROUNDS;r++){const {traffic:a}=fixture(island,LIGHTS),inter={vx:0,vz:0,reduced:false,onCrash(){},people};
  for(let i=0;i<600;i++)a.update(1/60,player,inter);
  const t0=process.hrtime.bigint();for(let i=0;i<MIN*3600;i++)a.update(1/60,player,inter);const ns=Number(process.hrtime.bigint()-t0);
  best.push(ns/(MIN*3600)/1000);a.dispose();}
 best.sort((x,y)=>x-y);console.log(`${name}: ${best[0].toFixed(2)} us per update (best of ${ROUNDS}; median ${best[ROUNDS>>1].toFixed(2)})`);
}
