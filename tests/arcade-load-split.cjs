// Arcade loading splits (Nov 11 2026, docs/qa/arcade-load-after.md): what a slow phone downloads before a game can start.
// Run: node tests/arcade-load-split.cjs
// Walks the STATIC import graph (import ... from / export ... from; `import type` and import() are not followed) from each game's
// entry and pins: the 2D canvas games never reach three.js; the deep-link path never statically reaches the room scene or the party
// layer; each 3D cabinet entry carries only its own scene factory; the party layer mounts late; a deep link starts its chunk early.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const EXTS=['.ts','.tsx','.js','.mjs','/index.ts','/index.tsx'];
function resolve(from,spec){let p;if(spec.startsWith('@/'))p=path.join(root,spec.slice(2));else if(spec.startsWith('.'))p=path.resolve(path.dirname(from),spec);else return {pkg:spec};
 if(fs.existsSync(p)&&fs.statSync(p).isFile())return {file:p};for(const e of EXTS)if(fs.existsSync(p+e))return {file:p+e};return null;}
function staticDeps(file){if(!/\.(ts|tsx|js|mjs)$/.test(file))return[];const src=fs.readFileSync(file,'utf8').replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:'"`])\/\/[^\n]*/g,'$1');const out=[];
 const re=/(?:^|[;\n}])\s*(?:import|export)\s+(type\s+)?([^'";]*?)\s*from\s*['"]([^'"]+)['"]|(?:^|[;\n])\s*import\s*['"]([^'"]+)['"]/g;let m;
 while((m=re.exec(src))){if(m[1])continue;if(m[2]&&/^\{[^}]*\}$/.test(m[2].trim())){const names=m[2].replace(/[{}]/g,'').split(',').map(x=>x.trim()).filter(Boolean);if(names.length&&names.every(x=>/^type\s/.test(x)))continue;}
  const r=resolve(file,m[3]||m[4]);if(r)out.push(r);}
 return out;}
function graph(entry){const files=new Set(),pkgs=new Set(),q=[path.join(root,entry)];files.add(q[0]);
 while(q.length){const f=q.shift();for(const d of staticDeps(f)){if(d.pkg){pkgs.add(d.pkg);continue;}if(!files.has(d.file)){files.add(d.file);q.push(d.file);}}}
 return {files:new Set([...files].map(f=>path.relative(root,f))),pkgs};}
let n=0;const group=(name,fn)=>{fn();n++;};

group('2D canvas games never load three.js',()=>{
 for(const g of ['KitRushGame','SquadSnakeGame','AirFutbolGame']){const {files,pkgs}=graph(`components/games/${g}.tsx`);
  assert(![...pkgs].some(p=>p==='three'||p.startsWith('three/')),`${g} statically reaches three.js`);
  assert(!files.has('lib/arcade/arcadeRoomScene.ts'),`${g} reaches the room scene`);
  assert(!files.has('lib/arcade/arcadeRoomParty.ts'),`${g} reaches the party layer`);}
});

group('the arcade page never statically loads the room scene, the party layer or a game',()=>{
 const {files,pkgs}=graph('app/arcade/page.tsx');
 for(const f of ['lib/arcade/arcadeRoomScene.ts','lib/arcade/arcadeRoomParty.ts','components/games/ArcadeGame3D.tsx','components/games/KitRushGame.tsx','components/games/PassPuzzleGame.tsx','components/games/SquadSnakeGame.tsx','components/games/AirFutbolGame.tsx'])
  assert(!files.has(f),`/arcade page chunk statically includes ${f}`);
 assert(![...pkgs].some(p=>p==='three'||p.startsWith('three/')),'/arcade page chunk statically reaches three.js');
 const room=read('components/ArcadeRoom.tsx');
 assert(/import type \{[^}]*createArcadeRoomScene[^}]*\} from '@\/lib\/arcade\/arcadeRoomScene'/.test(room),'room scene is a type-only import');
 assert(/if\(!queryReady\|\|game\|\|!canvas\.current\)return;[^\n]*import\('@\/lib\/arcade\/arcadeRoomScene'\)/.test(room),'the room scene loads only when no game is open');
});

group('each 3D cabinet entry carries only its own scene factory',()=>{
 const own={TennisGame3D:'tennisGame',PinballGame3D:'pinballGame',RunnerGame3D:'runnerGame3d'};
 const shell=read('components/games/ArcadeGame3D.tsx');
 assert(/import type \{createArcadeGame[^}]*\} from '@\/lib\/arcade\/arcadeGames'/.test(shell),'ArcadeGame3D imports the dispatcher for its type only');
 assert(!graph('components/games/ArcadeGame3D.tsx').files.has('lib/arcade/arcadeGames.ts'),'the shared 3D shell reaches the all-games dispatcher');
 for(const [entry,factory] of Object.entries(own)){const {files}=graph(`components/games/${entry}.tsx`);
  assert(files.has(`lib/arcade/games/${factory}.ts`),`${entry} loads its factory`);
  for(const other of Object.values(own).filter(f=>f!==factory))assert(!files.has(`lib/arcade/games/${other}.ts`),`${entry} also carries ${other}`);
  assert(!files.has('lib/arcade/arcadeGames.ts'),`${entry} reaches the dispatcher`);}
 const room=read('components/ArcadeRoom.tsx');
 for(const entry of Object.keys(own))assert(room.includes(`import('./games/${entry}')`),`ArcadeRoom loads ${entry}`);
 assert(!room.includes("import('./games/ArcadeGame3D')"),'ArcadeRoom loads the 3D shell directly (all three games)');
});

group('the party layer mounts late and a deep link starts its game chunk early',()=>{
 const room=read('components/ArcadeRoom.tsx'),body=room.slice(room.indexOf('export default function ArcadeRoom'));
 assert(!/useArcadeRoomParty\(\)/.test(body),'ArcadeRoom calls the party hook directly (it would load three.js before a 2D game)');
 assert(/function ArcadePartyLayer\(.*?\)\{const party=useArcadeRoomParty\(\)/.test(room),'the hook lives in ArcadePartyLayer');
 assert(/\{partyOn&&<ArcadePartyLayer onParty=\{takeParty\}\/>\}/.test(body),'the layer is mounted only once partyOn');
 assert(/requestIdleCallback/.test(body)&&/startParty\(true\)/.test(body),'partyOn flips on idle');
 assert(/if\(typeof window!=='undefined'\)\{const raw=new URLSearchParams\(location\.search\)\.get\('game'\)/.test(room),'module-time deep-link read');
 assert(/earlyGame=\{id,chunk:gameChunks\[/.test(room),'module-time deep-link import');
});

group('heavy panels stay lazy',()=>{
 for(const g of ['KitRushGame','SquadSnakeGame','AirFutbolGame','ArcadeGame3D','PassPuzzleGame']){const src=read(`components/games/${g}.tsx`);
  assert(/const HighScoreEntry=dynamic\(\(\)=>import\('\.\.\/arcade\/HighScoreEntry'\)/.test(src),`${g}: high-score entry is lazy`);
  assert(!graph(`components/games/${g}.tsx`).files.has('components/arcade/HighScoreEntry.tsx'),`${g}: high-score entry is static`);}
 const room=read('components/ArcadeRoom.tsx');
 for(const p of ['./arcade/ArcadeBoards','./arcade/ArcadeTodayPanel','./GashaponPanel'])assert(room.includes(`dynamic(()=>import('${p}')`),`${p} is lazy`);
});

console.log(`arcade-load-split: ${n} groups passed`);
