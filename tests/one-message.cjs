// One top message at a time (Nov 11 2026, owner: "only show one message at a time. don't show something shimmers and welcome back at the
// same time. welcome back first. the shimmer shows later."). lib/ui/toastLane.ts quiet holds; components/WelcomeBack.tsx holds the lane
// while due or open and leaves a gap; components/ReefHintToast.tsx waits (its stale clock paused) instead of being dropped.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const load=(f,req=()=>({}))=>{const m={exports:{}};new Function('exports','module','require',ts.transpileModule(read(f),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports,m,req);return m.exports;};
(async()=>{
 const {toastLane:L}=load('lib/ui/toastLane.ts',n=>n==='react'?{useSyncExternalStore:()=>false}:{});
 // Arrival: the quiet hold stops every note, then lets go by itself (one timeout).
 L.reset();L.quiet('arrive',40);assert.equal(L.request('reef'),false,'no note in the first moments after arriving');assert(L.held);
 // Welcome back holds the lane while it shows; the reef hint waits.
 L.hold('welcome',true);await new Promise(r=>setTimeout(r,60));assert(L.held,'Welcome back still holds after the arrival quiet');assert.equal(L.request('reef'),false,'the shimmer waits for Welcome back');
 // Welcome back closes: a short gap, then the hint gets its turn.
 L.hold('welcome',false);L.quiet('welcome-gap',40);assert.equal(L.request('reef'),false,'a gap after Welcome back');
 await new Promise(r=>setTimeout(r,60));assert(!L.held,'the gap ends on its own');assert.equal(L.request('reef'),true,'then the shimmer shows');L.release('reef');
 // Calling quiet again restarts it (one timer per id, never stacked).
 L.quiet('x',30);L.quiet('x',80);await new Promise(r=>setTimeout(r,50));assert(L.held,'restarted quiet still holds');await new Promise(r=>setTimeout(r,50));assert(!L.held);
 L.reset();
 const wb=read('components/WelcomeBack.tsx'),reef=read('components/ReefHintToast.tsx'),lane=read('lib/ui/toastLane.ts');
 assert.match(wb,/useEffect\(\(\)=>\{toastLane\.quiet\('arrive',ARRIVE_QUIET_MS\);\},\[\]\);/,'the arrival quiet starts with the island HUD');
 assert.match(wb,/const waiting=due\|\|open;/);assert.match(wb,/toastLane\.hold\('welcome',true\);return\(\)=>\{toastLane\.hold\('welcome',false\);if\(shown\)toastLane\.quiet\('welcome-gap',WELCOME_GAP_MS\);\};\},\[waiting\]\);/,'Welcome back holds the lane, then a gap');
 assert.match(wb,/if\(due&&!blocked&&!laneOwned\)/,'Welcome back never opens over a note already showing');
 assert.match(reef,/if\(toastLane\.held\)\{since\.current=0;toastLane\.want\('reef'\);return;\}/,'the shimmer is delayed, not dropped');
 assert.doesNotMatch(wb+reef+lane,/setInterval|requestAnimationFrame/,'no loops');
 const {ARRIVE_QUIET_MS,WELCOME_GAP_MS}={ARRIVE_QUIET_MS:+/ARRIVE_QUIET_MS=(\d+)/.exec(wb)[1],WELCOME_GAP_MS:+/WELCOME_GAP_MS=(\d+)/.exec(wb)[1]};
 assert(ARRIVE_QUIET_MS>=2000&&ARRIVE_QUIET_MS<=6000&&WELCOME_GAP_MS>=1500&&WELCOME_GAP_MS<=5000,'a few seconds each');
 console.log('one-message ok');
})().catch(e=>{console.error(e);process.exit(1);});
