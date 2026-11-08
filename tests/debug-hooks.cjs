// Player-moving play-test hooks (Nov 8 2026): window.__fi2.teleport / location / velocity / rooftop and
// __fi2.emoteTest.location/velocity are left off on a production host (lib/dev/debugHooks.ts); localhost, 127.0.0.1, LAN IPs
// and `next start` builds keep them for the headless checks. The game's own teleport ports (Summit kick, Ball Cannon) stay wired.
const fs=require('fs'),path=require('path'),ts=require('typescript'),assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const m={exports:{}};new Function('exports','module',ts.transpileModule(read('lib/dev/debugHooks.ts'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports,m);
const {debugMoveHooksAllowed:ok,isProductionHost}=m.exports;
for(const h of ['futbolisland.app','www.futbolisland.app','WWW.FutbolIsland.app','futbolisland.app.','futbol-island-git-main-khoa.vercel.app','futbol-island.vercel.app'])
 {assert.equal(ok(h),false,`no move hooks on ${h}`);assert.equal(isProductionHost(h),true);}
for(const h of ['localhost','127.0.0.1','192.168.1.20','10.0.0.5'])assert.equal(ok(h),true,`move hooks kept on ${h}`);
for(const h of ['futbolisland.app.evil.com','notvercel.app'])assert.equal(isProductionHost(h),false,h);
const town=read('components/Town.tsx');
assert.match(town,/import \{debugMoveHooksAllowed\} from '@\/lib\/dev\/debugHooks';/);
assert.match(town,/const debugMove=debugMoveHooksAllowed\(window\.location\.hostname\);/);
assert.match(town,/fieldTravel,\.\.\.\(debugMove\?\{location,velocity,rooftop\}:\{\}\),rideRef/,'__fi2 location/velocity/rooftop gated');
assert.match(town,/if\(debugMove\)\(window as unknown as \{__fi2:Record<string,unknown>\}\)\.__fi2\.teleport=/,'__fi2.teleport gated');
assert.match(town,/\.\.\.\(debugMove\?\{velocity,location\}:\{\}\)\};/,'emoteTest location/velocity gated');
const fi2=town.slice(town.indexOf('.__fi2={summitFun'),town.indexOf('};',town.indexOf('.__fi2={summitFun')));
assert(!/[,{](location|velocity|rooftop)[,}]/.test(fi2),'no ungated mover in the __fi2 literal');
assert.equal((town.match(/__fi2\.teleport=/g)||[]).length,1,'one teleport hook, gated');
assert.match(town,/createSummitActivities\(scene,\{teleport:\(x,z,yaw\)=>\{location\.x=x;/,'Summit kick keeps its teleport port');
assert.match(town,/createBallCannon\(scene,\{teleport:\(x,z,yaw\)=>\{location\.x=x;/,'Ball Cannon keeps its teleport port');
console.log('debug-hooks: ok');
