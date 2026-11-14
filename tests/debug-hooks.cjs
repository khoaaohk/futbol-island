// Player-moving play-test hooks (Nov 8 2026): window.__fi2.teleport / location / velocity / rooftop and
// __fi2.emoteTest.location/velocity are left off on a production host (lib/dev/debugHooks.ts); localhost, 127.0.0.1, LAN IPs
// and `next start` builds keep them for the headless checks. The game's own teleport ports (Summit kick, Ball Cannon) stay wired.
const fs=require('fs'),path=require('path'),ts=require('typescript'),assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const m={exports:{}};new Function('exports','module',ts.transpileModule(read('lib/dev/debugHooks.ts'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports,m);
const {debugMoveHooksAllowed:ok,isProductionHost,countProbeAllowed}=m.exports;
for(const h of ['futbolisland.app','www.futbolisland.app','WWW.FutbolIsland.app','futbolisland.app.','futbol-island-git-main-khoa.vercel.app','futbol-island.vercel.app'])
 {assert.equal(ok(h),false,`no move hooks on ${h}`);assert.equal(isProductionHost(h),true);}
for(const h of ['localhost','127.0.0.1','192.168.1.20','10.0.0.5'])assert.equal(ok(h),true,`move hooks kept on ${h}`);
for(const h of ['futbolisland.app.evil.com','notvercel.app'])assert.equal(isProductionHost(h),false,h);
const town=read('components/Town.tsx');
assert.match(town,/import \{countProbeAllowed,debugMoveHooksAllowed\} from '@\/lib\/dev\/debugHooks';/);
assert.match(town,/const debugMove=debugMoveHooksAllowed\(window\.location\.hostname\);/);
assert.match(town,/fieldTravel,\.\.\.\(debugMove\?\{location,velocity,rooftop\}:\{\}\),rideRef/,'__fi2 location/velocity/rooftop gated');
assert.match(town,/if\(debugMove\)\(window as unknown as \{__fi2:Record<string,unknown>\}\)\.__fi2\.teleport=/,'__fi2.teleport gated');
assert.match(town,/\.\.\.\(debugMove\?\{velocity,location\}:\{\}\)\};/,'emoteTest location/velocity gated');
const fi2=town.slice(town.indexOf('.__fi2={summitFun'),town.indexOf('};',town.indexOf('.__fi2={summitFun')));
assert(!/[,{](location|velocity|rooftop)[,}]/.test(fi2),'no ungated mover in the __fi2 literal');
assert.equal((town.match(/__fi2\.teleport=/g)||[]).length,1,'one teleport hook, gated');
assert.match(town,/createSummitActivities\(scene,\{teleport:\(x,z,yaw\)=>\{location\.x=x;/,'Summit kick keeps its teleport port');
assert.match(town,/createBallCannon\(scene,\{teleport:\(x,z,yaw\)=>\{location\.x=x;/,'Ball Cannon keeps its teleport port');
// Nov 13 2026: the analytics count probe (window.__fi2.counts, scripts/smoke-fishing.mjs) needs an opt-in AND a non-production host.
for(const h of ['futbolisland.app','www.futbolisland.app','futbol-island.vercel.app'])assert.equal(countProbeAllowed(h,true),false,`no count probe on ${h}`);
for(const v of [undefined,false,1,'true',{}])assert.equal(countProbeAllowed('localhost',v),false,`count probe needs a literal true opt-in, not ${String(v)}`);
assert.equal(countProbeAllowed('localhost',true),true);assert.equal(countProbeAllowed('127.0.0.1',true),true);
assert.match(town,/if\(countProbeAllowed\(window\.location\.hostname,\(window as unknown as \{__fiCountProbe\?:unknown\}\)\.__fiCountProbe\)\)\(window as unknown as \{__fi2:Record<string,unknown>\}\)\.__fi2\.counts=startCountProbe\(\);/,'__fi2.counts gated');
assert.equal((town.match(/startCountProbe\(\)/g)||[]).length,1,'one count probe start, gated');
const tracker=read('lib/analytics/tracker.ts');
assert.match(tracker,/if\(probe\)probe\.set\(id,/,'probe tallies inside count()');
assert(tracker.indexOf('if(probe)probe.set(id,')>tracker.indexOf('!isCountId(id))return;'),'probe only sees allowlisted ids');
console.log('debug-hooks: ok');
