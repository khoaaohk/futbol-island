// Breakaway Run renderer release (Oct 9 2026 QA). runnerTrack keeps a module-level `activeRenderer` (its bend shader only runs
// for the current runner renderer); after leaving the game it still pointed at the last runner's WebGLRenderer, keeping that
// context reachable. The track now clears it on dispose (only if it is still this game's renderer), reached through
// runnerFx.dispose -> the arcade runtime's dispose -> ArcadeGame3D's unmount.
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const track=read('lib/arcade/runnerTrack.ts');
assert.match(track,/function dispose\(\)\{if\(activeRenderer===stage\.renderer\)activeRenderer=null;\}/,'track dispose clears its renderer hold when it matches');
assert.match(track,/return\{update,pose,reset,dispose,/,'and is exposed');
assert.match(read('lib/arcade/runnerFx.ts'),/dispose:track\.dispose/,'runnerFx forwards it');
const games=read('lib/arcade/arcadeGames.ts');
assert.match(games,/dispose\(\)\{runnerFx\?\.dispose\(\);stage\.dispose\(\);\}/,'the runtime disposes the runner layer, then the stage');
const comp=read('components/games/ArcadeGame3D.tsx');
assert.match(comp,/release\(\);runtime\.dispose\(\);game\.current=null;/,'ArcadeGame3D tears down through the runtime');
assert.ok(!/runtime\.stage\.dispose\(\)/.test(comp),'not the bare stage');
console.log('PASS runner track dispose: the module no longer pins the last runner renderer');
