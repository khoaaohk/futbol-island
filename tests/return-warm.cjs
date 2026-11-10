// Nov 10 2026 heat pass (docs/performance-guide.md "Room trips: warm return, Town cleanup"): the room-trip return builds the island
// in budgeted slices behind its loading screen and compiles the shaders before Town mounts; Town's unmount frees textures and the
// WebGL context; a warm renderer taken mid-compile loses its context only after the compile settles.
// Run: node -r ./scripts/test-ts-cache.cjs tests/return-warm.cjs
const assert=require('assert'),fs=require('fs');
const read=f=>fs.readFileSync(f,'utf8');
const ok=(name,fn)=>{fn();console.log('ok  ',name);};
ok('the return page mounts the warm wrapper, which hands Town the built island',()=>{
 assert.match(read('app/island-return/page.tsx'),/<IslandReturnWarm\/>/);assert(!/<Town /.test(read('app/island-return/page.tsx')));
 const w=read('components/IslandReturnWarm.tsx');
 assert(w.includes('warmIslandSteps()'),'reuses the title warm-up');assert(w.includes('<Town returningFromArcade/>')&&w.includes('<IslandReturnLoading/>'));
 assert(w.includes('new MessageChannel()')&&!/setTimeout\(resolve/.test(w),'no clamped timers between slices');
 assert(/performance\.now\(\)-t0<RETURN_SLICE_MS/.test(w),'slices batched to a time budget');
 assert(!/requestAnimationFrame/.test(w.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'')),'no rAF');assert(w.includes('document.hidden'),'no work in a hidden tab');
 assert(/setTimeout\(done,RETURN_WARM_MAX_MS\)/.test(w),'fallback: Town mounts anyway');assert(w.includes("get('returnWarm')==='0'"),'A/B escape');
 assert(/if\(!taken\)disposeWarmIsland\(\)/.test(w),'an untaken warm island is released');
 assert(/html\[data-return-warm\]\) \.signpost\{animation:none\}/.test(read('components/IslandReturnLoading.module.css')),'the sign does not replay on the hand-off');
});
ok('Town cleanup: textures, shadow-pass materials and the context',()=>{
 // Nov 10 2026 split: the sweep lives in lib/town/townCleanup.ts and runs after every registered disposer, before the renderer.
 const t=read('components/Town.tsx'),c=read('lib/town/townCleanup.ts'),i=t.indexOf('return()=>{disposers.runAll();disposeTownSceneResources(scene);'),tail=t.slice(i,t.indexOf('};',t.indexOf('renderer.domElement.remove();',i))+2);
 const sweep=c.slice(c.indexOf('export function disposeTownSceneResources('));
 assert(i>0);assert(t.includes('disposers.add(()=>{swimClear.dispose();clearWin.dispose();});'));assert(sweep.includes('textures.forEach(t=>t.dispose());'));assert(sweep.includes('object.customDepthMaterial,object.customDistanceMaterial'));
 assert(/for\(let i=list\.length-1;i>=0;i--\)list\[i\]\(\)/.test(c),'disposers run newest first');
 assert(/renderer\.dispose\(\);renderer\.forceContextLoss\(\);renderer\.domElement\.remove\(\);/.test(tail));
});
ok('a warm renderer taken mid-compile: dispose and context loss wait for the compile (three polls its programs)',()=>{
 const s=read('lib/town/islandWarm.ts');assert(s.includes('r.forceContextLoss=()=>{void job.then(lose);};'));assert(s.includes('r.dispose=()=>{void job.then(dispose);};'));
});
console.log('RETURN_WARM_PASS sliced warm return, Town frees textures and its context');
