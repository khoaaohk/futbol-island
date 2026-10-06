// Pass Puzzle scenarios (lane D): schema, reading level and solvability with the real engine.
// Run: node tests/pass-puzzle-scenarios.cjs
// For every scenario: (a) the stored solution succeeds, (b) the naive direct option is cut out,
// blocked or saved (and the threat preview warns about it), (c) the solution survives a sloppy
// finger (small aim/power errors), and (d) a replay of the winning attempt is identical.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),Module=require('node:module');
require.extensions['.ts']=(m,file)=>{const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020},fileName:file}).outputText;m._compile(out,file);};
const origResolve=Module._resolveFilename;
Module._resolveFilename=function(req,parent,...rest){try{return origResolve.call(this,req,parent,...rest);}catch(e){if(req.startsWith('.'))return origResolve.call(this,req+'.ts',parent,...rest);throw e;}};
const P=require(path.join(__dirname,'..','lib','passPuzzle','index.ts'));
const {SCENARIOS,SCENARIO_SOLUTIONS,PACKS,scenarioById,scenariosInPack}=require(path.join(__dirname,'..','lib','passPuzzle','scenarios.ts'));

const FORMATS=['7v7','9v9','11v11'];
const at=(sc,m)=>`${sc.id}: ${m}`;

/* ───────── 1. schema ───────── */
assert(SCENARIOS.length>=18&&SCENARIOS.length<=24,'18–24 scenarios, got '+SCENARIOS.length);
assert.equal(PACKS.length,4,'four packs');
assert.deepEqual(PACKS.map(p=>p.order),[1,2,3,4]);
const ids=new Set(),titles=new Set(),concepts=new Set();
for(const sc of SCENARIOS){
  assert(/^[a-z0-9-]+$/.test(sc.id),at(sc,'id is kebab-case'));
  assert(!ids.has(sc.id),at(sc,'duplicate id'));ids.add(sc.id);
  assert(!titles.has(sc.title),at(sc,'duplicate title'));titles.add(sc.title);
  assert(sc.title.length>0&&sc.title.length<=24,at(sc,'title length'));
  assert(typeof sc.concept==='string'&&sc.concept.length>0,at(sc,'concept'));
  assert(!concepts.has(sc.concept),at(sc,'each scenario teaches its own concept'));concepts.add(sc.concept);
  assert(PACKS.some(p=>p.id===sc.pack),at(sc,'unknown pack '+sc.pack));
  for(const f of FORMATS){
    assert(typeof sc.brief[f]==='string'&&sc.brief[f].trim().length>0,at(sc,'brief '+f));
    assert(typeof sc.hint[f]==='string'&&sc.hint[f].trim().length>0,at(sc,'hint '+f));
  }
  assert.deepEqual(Object.keys(sc.brief).sort(),[...FORMATS].sort(),at(sc,'brief keys'));
  assert.deepEqual(Object.keys(sc.hint).sort(),[...FORMATS].sort(),at(sc,'hint keys'));
  assert(new Set(FORMATS.map(f=>sc.brief[f])).size===3,at(sc,'three different brief wordings'));
  assert(new Set(FORMATS.map(f=>sc.hint[f])).size===3,at(sc,'three different hint wordings'));
  assert.equal(sc.attempts,3,at(sc,'attempts'));
  assert(Number.isInteger(sc.require.minPasses)&&sc.require.minPasses>=0&&sc.require.minPasses<=3,at(sc,'minPasses'));
  assert(['goal','reach-zone'].includes(sc.require.finish),at(sc,'finish'));
  if(sc.require.finish==='reach-zone'){const z=sc.require.zone;assert(z&&z.r>0,at(sc,'reach-zone needs a zone'));assert(sc.require.minPasses>=1,at(sc,'reach-zone needs a pass'));}
  assert(typeof sc.lesson==='string'&&sc.lesson.length>=20&&sc.lesson.length<=110,at(sc,'lesson length'));
  const {halfWidth:hw,length:L,goalWidth:gw}=sc.pitch;
  assert(hw>=15&&L>=40&&gw>=5&&gw<=7.32,at(sc,'pitch'));
  const inside=p=>Math.abs(p.x)<=hw-0.4&&Math.abs(p.z)<=L/2-0.4; // the corner spot counts
  assert(Number.isInteger(sc.carrier)&&sc.attackers[sc.carrier],at(sc,'carrier'));
  sc.attackers.forEach((a,i)=>{assert(inside(a),at(sc,'attacker '+i+' on the pitch'));(a.run?.path||[]).forEach(p=>assert(inside(p),at(sc,'run point on the pitch')));});
  sc.defenders.forEach((d,j)=>{assert(inside(d),at(sc,'defender '+j+' on the pitch'));if(d.mark!=null)assert(sc.attackers[d.mark],at(sc,'mark index'));});
  if(sc.keeper)assert(inside(sc.keeper)&&sc.keeper.z>L/2-3,at(sc,'keeper on the goal line'));
  if(sc.require.finish==='goal')assert(sc.keeper,at(sc,'a goal puzzle has a keeper'));
  if(sc.bonus){
    assert(['curl','chip','header','first-time','scorer','placement'].includes(sc.bonus.kind),at(sc,'bonus kind'));
    assert(sc.bonus.label.length>0&&sc.bonus.label.length<=28,at(sc,'bonus label'));
    if(sc.bonus.kind==='scorer')assert(sc.attackers[sc.bonus.scorer],at(sc,'bonus scorer'));
  }
  const all=[...FORMATS.flatMap(f=>[sc.brief[f],sc.hint[f]]),sc.title,sc.lesson,sc.bonus?.label||''].join(' ');
  assert(!/flicco/i.test(all),at(sc,'no borrowed names'));
}
for(const p of PACKS){const n=scenariosInPack(p.id).length;assert(n>=4&&n<=6,`pack ${p.id} has 4–6 scenarios (got ${n})`);}
// packs run in order in the list, and difficulty (passes needed) never drops pack to pack
const packIdx=sc=>PACKS.find(p=>p.id===sc.pack).order;
for(let i=1;i<SCENARIOS.length;i++)assert(packIdx(SCENARIOS[i])>=packIdx(SCENARIOS[i-1]),'scenarios grouped by pack order');
const avgPasses=PACKS.map(p=>{const l=scenariosInPack(p.id);return l.reduce((s,x)=>s+x.require.minPasses,0)/l.length;});
assert(avgPasses[0]<avgPasses[1]&&avgPasses[1]<=avgPasses[2]+0.01,'packs 1→3 ask for more passes: '+avgPasses.map(v=>v.toFixed(2)));
assert.equal(scenarioById(SCENARIOS[3].id),SCENARIOS[3]);
console.log(`PASS schema: ${SCENARIOS.length} scenarios in ${PACKS.length} packs (${PACKS.map(p=>scenariosInPack(p.id).length).join('/')}), avg passes ${avgPasses.map(v=>v.toFixed(1)).join(' → ')}`);

/* ───────── 2. reading level (quiz-design.md §5, scaled for briefs) ───────── */
const LIMITS={'7v7':{sentence:12,total:24},'9v9':{sentence:18,total:30},'11v11':{sentence:22,total:34}};
const JARGON=/\b(goal-side|half-space|overload\w*|third[- ]man|channel|press trigger|centre-back|full-back|lay-off|recycle|point of attack|between the lines|in stride|weight)\b/i;
const words=s=>s.split(/\s+/).filter(w=>/[A-Za-z0-9]/.test(w));
const sentences=s=>s.split(/(?<=[.!?:;])\s+/).map(x=>x.trim()).filter(Boolean);
const avgWordLen=s=>{const w=words(s).map(x=>x.replace(/[^A-Za-z]/g,''));return w.reduce((a,x)=>a+x.length,0)/w.length;};
const byFormat={'7v7':[],'9v9':[],'11v11':[]};
for(const sc of SCENARIOS){
  for(const f of FORMATS)for(const key of ['brief','hint']){
    const text=sc[key][f],lim=LIMITS[f];
    byFormat[f].push(text);
    assert(words(text).length<=lim.total,at(sc,`${key} ${f} is ${words(text).length} words (max ${lim.total})`));
    for(const s of sentences(text))assert(words(s).length<=lim.sentence,at(sc,`${key} ${f} sentence too long (${words(s).length} > ${lim.sentence}): "${s}"`));
    const jargon=f==='7v7'&&text.match(JARGON);
    assert(!jargon,at(sc,`7v7 ${key} uses jargon: "${jargon&&jargon[0]}"`));
    assert(!/[<>{}\[\]]/.test(text),at(sc,'plain text only'));
  }
  for(const s of sentences(sc.lesson))assert(words(s).length<=16,at(sc,'lesson sentence ≤16 words'));
}
const w7=avgWordLen(byFormat['7v7'].join(' ')),w11=avgWordLen(byFormat['11v11'].join(' '));
const n7=byFormat['7v7'].reduce((a,t)=>a+words(t).length,0)/byFormat['7v7'].length,n11=byFormat['11v11'].reduce((a,t)=>a+words(t).length,0)/byFormat['11v11'].length;
assert(w7<w11,'7v7 uses shorter words than 11v11');assert(n7<n11,'7v7 lines are shorter than 11v11');
console.log(`PASS reading level: 7v7 ${n7.toFixed(1)} words/line (${w7.toFixed(2)} letters/word) → 11v11 ${n11.toFixed(1)} (${w11.toFixed(2)})`);

/* ───────── 3. solvability with the engine ───────── */
const STOP=new Set(['intercept','deflect','save','parry','goal','receive','heavy_touch','out']);
// A real finger stroke for a stored kick, as lane E's canvas sends it: it starts at the ball and
// ends on the receiver (feet/header), on the target grass (space) or 2 m past the goal line (shot).
// Holding still at the end gives loft and bowing the line gives curl (the readStroke rules).
function strokeFor(w,k,{dx=0,dz=0,dl=0}={}){
  const s=w.state,b=s.ball.p,g=w.scenario.pitch,goalZ=g.length/2,hg=g.goalWidth/2-0.25;
  let end;
  if(k.kind==='shot')end={x:Math.max(-hg,Math.min(hg,k.target.x+dx)),z:goalZ+2};
  else if((k.kind==='pass-feet'||k.kind==='header')&&k.receiver!=null){const a=s.attackers[k.receiver].p;end={x:a.x+dx,z:a.z+dz};}
  else end={x:k.target.x+dx,z:k.target.z+dz};
  const DX=end.x-b.x,DZ=end.z-b.z,L=Math.hypot(DX,DZ),nx=DZ/L,nz=-DX/L;
  const bow=k.curl?Math.sign(k.curl)*(Math.abs(k.curl)*0.22*L+0.4):0;
  const loft=k.loft>0?Math.min(1,Math.max(0.16,k.loft+dl)):0;
  const hold=loft>0?0.25+(loft-0.15)*0.45/0.85+0.002:0;
  const pts=[],n=Math.max(3,Math.min(24,Math.floor(L/0.5))),dur=0.4;
  for(let i=0;i<=n;i++){const u=i/n,o=Math.sin(Math.PI*u)*bow;pts.push({x:b.x+DX*u+nx*o,z:b.z+DZ*u+nz*o,t:u*dur});}
  if(hold>0){for(let t=0.05;t<hold;t+=0.05)pts.push({x:end.x+0.02,z:end.z,t:dur+t});pts.push({x:end.x,z:end.z,t:dur+hold});}
  return pts;
}
// drawn=true: every kick goes through readStroke(strokeFor(...)), so it proves a child can draw it
function play(sc,kicks,{drawn=false,...slop}={}){
  const w=P.createPuzzle(sc),ev=[],sent=[];w.on(e=>ev.push(e));let used=0;
  for(let g=0;g<120*40;g++){
    const ph=w.state.phase;if(ph==='success'||ph==='fail')break;
    if(ph==='aiming'){
      if(used>=kicks.length)break;let k=kicks[used];
      if(drawn){const d=P.readStroke(strokeFor(w,k,slop),w);
        if(!Object.keys(slop).length){assert.equal(d.kind,k.kind,at(sc,`kick ${used} draws as ${d.kind}, stored as ${k.kind}`));
          if(k.kind!=='pass-space'&&k.receiver!=null)assert.equal(d.receiver,k.receiver,at(sc,`kick ${used} snaps to the right teammate`));
          assert(Math.abs(d.power-k.power)<=0.03,at(sc,`kick ${used} stored power ${k.power} is what the stroke gives (${d.power.toFixed(2)})`));
          assert(Math.abs(d.loft-k.loft)<=0.03&&Math.abs(d.curl-k.curl)<=0.03,at(sc,`kick ${used} stored loft/curl match the stroke`));}
        k=d;}
      assert(w.kick(k),at(sc,'kick accepted'));sent.push(k);used++;
    }
    w.step(1/120);
  }
  return {w,state:w.state,ev,used,sent};
}
const trace=r=>r.ev.map(e=>e.type+(e.attacker!=null?'@a'+e.attacker:'')+(e.defender!=null?'@d'+e.defender:'')+(e.keeper?'@gk':'')).join(' → ');
assert.deepEqual(Object.keys(SCENARIO_SOLUTIONS).sort(),[...ids].sort(),'one solution per scenario');
let robustTotal=0,robustOk=0;
for(const sc of SCENARIOS){
  const {solution,naive}=SCENARIO_SOLUTIONS[sc.id];
  const need=sc.require.minPasses+(sc.require.finish==='goal'?1:0);
  assert.equal(solution.length,need,at(sc,`solution is the minimum ${need} kicks`));
  for(const k of [...solution,naive])assert(k.power>=0.1&&k.power<=1&&k.loft>=0&&k.loft<=1&&Math.abs(k.curl)<=1,at(sc,'kick values in range'));
  // (a) the taught solution works: as stored (the game's dev hook) and as drawn strokes
  for(const drawn of [false,true]){
    const r=play(sc,solution,{drawn});
    const how=drawn?'drawn':'stored';
    assert.equal(r.state.phase,'success',at(sc,`${how} solution fails (${r.state.result?.reason||r.state.phase}): ${trace(r)}`));
    assert.equal(r.used,solution.length,at(sc,`every ${how} solution kick is used`));
    assert(r.state.result.passes>=sc.require.minPasses,at(sc,'passes counted'));
    if(sc.require.finish==='goal')assert(r.ev.some(e=>e.type==='goal'),at(sc,'goal scored'));
    if(sc.bonus&&sc.bonus.kind!=='curl'&&sc.bonus.kind!=='chip')assert(r.state.result.bonus,at(sc,'the taught solution also earns the bonus'));
    if(sc.pack==='in-the-air')assert(solution.some(k=>k.kind==='header')&&r.ev.some(e=>e.type==='receive'&&e.touch==='header'),at(sc,'air puzzles use a header'));
    // (d) a replay of the winning attempt is identical
    const rp=P.replay(r.w.attemptStart(),r.w.inputs()).run();
    assert.deepEqual(rp.map(e=>[e.type,e.tick]),r.ev.map(e=>[e.type,e.tick]),at(sc,'replay matches'));
  }
  // (b) the naive direct option is cut out, blocked or saved, and the threat preview warns
  let stopType='';
  for(const drawn of [false,true]){
    const n=play(sc,[naive],{drawn});
    const stop=n.ev.find(e=>STOP.has(e.type));
    assert(stop&&['intercept','deflect','save','parry'].includes(stop.type),at(sc,`naive option should be stopped, got: ${trace(n)}`));
    // a block can bounce loose to a teammate, but it is never a clean pass or a goal
    assert(!n.ev.some(e=>e.type==='goal'),at(sc,'naive option must not score'));
    assert.equal(n.state.passes,0,at(sc,'naive option must not count as a completed pass'));
    stopType=stop.type;
  }
  const pr=P.predict(P.createPuzzle(sc),naive);
  assert(pr.end==='intercept'||pr.threats.length>0||pr.keeperThreat,at(sc,'threat preview flags the naive option'));
  // (c) a sloppy finger: the stroke ends 0.4 m off in each direction, and holds 0.04 s longer/shorter
  const variants=[{dx:0.4},{dx:-0.4},{dz:0.4},{dz:-0.4}];
  if(solution.some(k=>k.loft>0))variants.push({dl:0.08},{dl:-0.08});
  let ok=0;
  for(const v of variants)if(play(sc,solution,{drawn:true,...v}).state.phase==='success')ok++;
  robustTotal+=variants.length;robustOk+=ok;
  assert(ok>=variants.length-1,at(sc,`solution too knife-edge: ${ok}/${variants.length} sloppy strokes succeed`));
  const r=play(sc,solution,{drawn:true});
  console.log(`  ok ${sc.id.padEnd(22)} ${sc.concept.padEnd(19)} ${trace(r)}  | naive: ${stopType}  | sloppy ${ok}/${variants.length}`);
}
console.log(`PASS solvability: ${SCENARIOS.length}/${SCENARIOS.length} solutions succeed (stored and drawn), every naive option is stopped, sloppy strokes ${robustOk}/${robustTotal}`);
console.log('PASS_PUZZLE_SCENARIOS_PASS');
