// The dead old 2D arcade games are gone (Oct 26 2026, owner): SoccerPinballGame, SoccerTennisGame and BreakawayRun (replaced by the
// 3D cabinet games in ArcadeGame3D / lib/arcade), plus what only they used (components/games/types.ts, runnerRig.ts,
// runnerScenery.ts). The shared libs the live games use stay. Run: node tests/dead-games-removed.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),gone=['SoccerPinballGame.tsx','SoccerPinballGame.module.css','SoccerTennisGame.tsx','SoccerTennisGame.module.css','BreakawayRun.tsx','BreakawayRun.module.css','types.ts','runnerRig.ts','runnerScenery.ts'];
for(const f of gone)assert.ok(!fs.existsSync(path.join(root,'components/games',f)),`components/games/${f} is deleted`);
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):/\.(tsx?|mjs|cjs)$/.test(e.name)?[path.join(d,e.name)]:[]);
const code=['app','components','lib','multiplayer'].filter(d=>fs.existsSync(path.join(root,d))).flatMap(d=>walk(path.join(root,d)));
const dead=/from ['"][^'"]*(SoccerPinballGame|SoccerTennisGame|BreakawayRun|components\/games\/types|runnerRig|runnerScenery)['"]/;
for(const f of code){const s=fs.readFileSync(f,'utf8'),rel=path.relative(root,f);
 assert.ok(!dead.test(s),`${rel} imports a deleted game file`);
 if(rel.startsWith(path.join('components','games')))assert.ok(!/from ['"]\.\/types['"]/.test(s),`${rel} imports the deleted ./types`);}
// The live games' shared libs are kept.
for(const f of ['lib/games/soccerTennis.ts','lib/games/soccerPinball.ts','lib/games/sound.ts','components/games/runnerAudio.ts','components/games/runnerPhysics.ts','components/games/runnerRoute.ts','components/games/ArcadeGame3D.tsx'])
 assert.ok(fs.existsSync(path.join(root,f)),`${f} is still used and kept`);
console.log('dead-games-removed ok');
