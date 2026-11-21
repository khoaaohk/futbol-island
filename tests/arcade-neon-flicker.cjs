// Arcade roof neon flicker (Nov 21 2026, lib/town/arcadeNeonFlicker.ts; docs/performance-guide.md "Arcade neon flicker"):
// a seeded step scheduler. Checks the look's timing, the WCAG 2.3.1 flash ceiling, that it idles when off, and the world wiring.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const m={exports:{}};
vm.runInNewContext(ts.transpileModule(read('lib/town/arcadeNeonFlicker.ts'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,Math,Float32Array,Infinity});
const N=m.exports;

// Drive one scheduler at a phone's 30 fps for `minutes`, counting the frames that did any work.
function run(seed,minutes,mode,on=()=>true){
 const f=N.createNeonFlicker(seed),dips=[],levels=[];let changes=0,dueFrames=0,frames=0,minLevel=1;
 for(let t=0;t<minutes*60000;t+=1000/30){frames++;
  if(!f.due(t))continue;dueFrames++;
  const before=f.stats.dips;if(f.step(t,on(t),mode))changes++;
  if(f.stats.dips>before)for(let k=before;k<f.stats.dips;k++)dips.push(f.dipTimes[f.dipTimes.length-(f.stats.dips-k)]);
  for(const v of f.letters)minLevel=Math.min(minLevel,v);levels.push(f.breath);}
 return {f,dips,changes,dueFrames,frames,minLevel,levels};
}

for(const seed of [1,7,42,1234,99991])for(const mode of ['day','sunset','night']){
 const r=run(seed,10,mode);
 // WCAG 2.3.1: never more than 3 flashes in any one-second window (a dip and its return is one flash).
 for(let i=0;i<r.dips.length;i++){let n=0;for(let j=i;j<r.dips.length&&r.dips[j]-r.dips[i]<1000;j++)n++;assert.ok(n<=3,`seed ${seed} ${mode}: ${n} dips within 1 s at ${r.dips[i]|0} ms`);}
 // Events every ~2-6 s: 10 minutes gives ~100-280 events; the mean gap between event starts sits inside the range.
 const ev=r.f.stats.events,gap=600000/ev;
 assert.ok(gap>=2000&&gap<=6500,`seed ${seed} ${mode}: mean event gap ${gap|0} ms`);
 assert.ok(r.dips.length>=ev&&r.dips.length<=ev*2,'each event is one dip or a double flick');
 // A step function: far fewer working frames than rendered frames (breathing ≤ 4 Hz plus the flicker steps).
 assert.ok(r.dueFrames<r.frames/6,`seed ${seed} ${mode}: ${r.dueFrames} working frames of ${r.frames}`);
 assert.ok(r.changes/10<=400,`seed ${seed} ${mode}: ${r.changes/10} changes per minute`);
 // Breathing stays inside its band; dips never black the sign out.
 const s=N.NEON_STRENGTH[mode];for(const b of r.levels)assert.ok(b<=1&&b>=1-2*s.breath-.005,`breath ${b} in band`);
 assert.ok(r.minLevel>=s.dip[0]-1e-6,`${mode}: dips stay at or above ${s.dip[0]}`);
}
// Strength: night dips deeper than day, breathing wider.
assert.ok(N.NEON_STRENGTH.night.dip[1]<N.NEON_STRENGTH.day.dip[0]&&N.NEON_STRENGTH.night.breath>N.NEON_STRENGTH.day.breath,'night reads stronger than day');

// Determinism: the same seed gives the same schedule.
assert.deepEqual(run(5,1,'night').dips,run(5,1,'night').dips,'seeded schedule is deterministic');

// Off (reduced motion, far, hidden, another scene): steady at full brightness, one reset, then a cheap re-check every 500 ms only.
{const r=run(3,5,'night',()=>false);assert.equal(r.changes,0,'never on: no writes at all');assert.equal(r.f.stats.dips,0,'never on: no dips');
 assert.ok(r.dueFrames<=5*60000/N.NEON_IDLE_CHECK_MS+1,`off: ${r.dueFrames} re-checks in 5 min`);
 assert.ok([...r.f.letters].every(v=>v===1)&&r.f.breath===1,'off: steady at full');}
{// Turning off mid-dip restores full brightness in one write and stays idle.
 const f=N.createNeonFlicker(11);let t=0;for(;t<60000;t+=33){if(f.due(t))f.step(t,true,'night');if(f.letters.some(v=>v<1))break;}
 assert.ok(f.letters.some(v=>v<1),'found a dip');t=Math.max(t+33,f.nextAt);assert.ok(f.nextAt-(t-33)<=150,'the next change is at most a dip length away');
 assert.equal(f.step(t,false,'night'),true,'switching off writes once');assert.ok([...f.letters].every(v=>v===1)&&f.breath===1,'restored to full');
 let writes=0;for(let k=0;k<200;k++){t+=33;if(f.due(t)&&f.step(t,false,'night'))writes++;}assert.equal(writes,0,'idle while off');}
{// Back from a hidden tab: no burst of queued changes; the schedule restarts.
 const f=N.createNeonFlicker(2);for(let t=0;t<10000;t+=33)if(f.due(t))f.step(t,true,'night');
 const d=f.stats.dips;f.step(10000+60000,true,'night');assert.ok(f.stats.dips-d<=1,'a long gap does not replay missed flickers');}

// World + loop wiring (source checks): existing material/halo values only, no light, gated on reduced motion and the heat tier.
const world=read('lib/town/world.ts'),town=read('components/Town.tsx');
assert.match(world,/createNeonFlicker\(/,'world owns one flicker scheduler');
assert.match(world,/updateArcade:\(now:number,steady:boolean,camera:T\.Camera\)=>/,'updateArcade takes the steady gate and the camera');
assert.match(world,/if\(!arcadeFlicker\.due\(now\)\)return;/,'nothing runs between scheduled changes');
assert.match(world,/addUpdateRange\(/,'letter dips upload only that letter\'s slice of the colour buffer');
assert.ok(!/arcadeFlicker[^\n]*new T\.(PointLight|SpotLight|Mesh|MeshBasicMaterial|CanvasTexture)/.test(world),'no new light, mesh, material or texture for the flicker');
assert.match(town,/world\.updateArcade\(now,reduced\|\|heat\.staticAmbience\|\|/,'steady under reduced motion and the static-ambience tiers');
console.log('arcade-neon-flicker: ok');
