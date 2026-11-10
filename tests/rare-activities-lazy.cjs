// Load-time pass (Nov 10 2026, docs/performance-guide.md "Rare activities load on demand"): the dive room, the fishing host and the
// easel's tray are not in the island boot chunk, the light fishing spots carry no species data, and each lazy part fails soft.
// usage: node -r ./scripts/test-ts-cache.cjs tests/rare-activities-lazy.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const EXTS=['.ts','.tsx','.js','/index.ts','/index.tsx'];
function resolve(from,spec){let p;if(spec.startsWith('@/'))p=path.join(ROOT,spec.slice(2));else if(spec.startsWith('.'))p=path.resolve(path.dirname(from),spec);else return null;
 if(fs.existsSync(p)&&fs.statSync(p).isFile())return p;for(const e of EXTS)if(fs.existsSync(p+e))return p+e;return null;}
/** Static, value (non-type) imports and re-exports of a file. Dynamic import() is not followed: that is the point. */
function deps(file){const src=fs.readFileSync(file,'utf8'),out=[];
 const re=/(?:^|[;\s])import\s+(type\s+)?([^'";]*?)\s*from\s*['"]([^'"]+)['"]|(?:^|[;\s])import\s+['"]([^'"]+)['"]|export\s+(type\s+)?(?:\*|\{[^}]*\})\s*from\s*['"]([^'"]+)['"]/gm;let m;
 while((m=re.exec(src))){if(m[1]||m[5])continue;const names=m[2]&&/^\{[^}]*\}$/.test(m[2].trim())?m[2].trim().slice(1,-1).split(',').map(s=>s.trim()).filter(Boolean):null;
  if(names&&names.length&&names.every(n=>n.startsWith('type ')))continue;const r=resolve(file,m[3]||m[4]||m[6]);if(r)out.push(r);}
 return out;}
function reach(entry){const seen=new Set([path.join(ROOT,entry)]),q=[...seen];while(q.length){for(const d of deps(q.shift()))if(!seen.has(d)){seen.add(d);q.push(d);}}return [...seen].map(f=>path.relative(ROOT,f));}
let passed=0;const ok=(name,fn)=>{try{fn();passed++;console.log('ok  ',name);}catch(e){console.error('FAIL',name);throw e;}};

const boot=reach('components/Town.tsx');
ok('the island boot graph has no dive room, fishing host, catch UI or easel tray',()=>{
 for(const f of ['lib/graphics/diveRoom.ts','lib/town/fishing/fishModels.ts','components/FishingHost.tsx','components/FishingLureButton.tsx','components/FishingTutorial.tsx','components/PaintEaselStudio.tsx'])
  assert(!boot.includes(f),`${f} is not statically reachable from Town`);
 // what stays: the light triggers and markers
 for(const f of ['components/FishingHostLazy.tsx','components/PaintEasel.tsx','lib/town/fishing/fishSpots.ts','lib/graphics/diveWreck.ts','lib/town/water/diveRuntime.ts'])
  assert(boot.includes(f),`${f} stays in the boot graph`);
});
ok('fishSpots.ts (spots, market stand) carries no species data; fishCatalog re-exports it',()=>{
 const spots=read('lib/town/fishing/fishSpots.ts');
 for(const m of ['fishCatalog','fishSpecials','shoreSignatures','legendary','fishStories','nightFish','deepSeaFish'])assert(!new RegExp(`from '\\./${m}'`).test(spots),`fishSpots does not import ${m}`);
 assert(read('lib/town/fishing/fishCatalog.ts').includes("export * from './fishSpots';"));
 assert.match(read('components/Town.tsx'),/import \{MARKET_STAND\} from '@\/lib\/town\/fishing\/fishSpots';/);
 assert.match(read('lib/multiplayer/presence.ts'),/from '\.\.\/town\/fishing\/fishSpots'/,'presence (remote players at the stand) uses the light spots');
});
ok('the dive room loads by distance and a dive never starts without it',()=>{
 const rt=read('lib/town/water/diveRuntime.ts');
 assert(rt.includes("import type {DiveRoom} from '../../graphics/diveRoom';"));
 assert(rt.includes("import('../../graphics/diveRoom').then(m=>{roomModule=m;},()=>{roomLoading=null;})"),'a failed load is forgotten (retry next tick)');
 assert(/slots\(x:number,z:number\)\{nearestDiveSpots\(x,z,near\);if\(!roomModule&&near\[0\]/.test(rt),'prefetch from the HUD tick near a zone');
 assert(rt.includes('start(){if(!roomModule){void loadDiveRoom();return false;}'),'tap Dive: refused until the room is here');
 assert.equal(rt.split('if(!roomModule){void loadDiveRoom();return false;}').length,3,'tap and edge entry both refused until loaded');
 assert(/want\(\)\{[^}]*roomModule\?/.test(rt),'no Dive focus slot before the room is here');
 assert.match(read('lib/graphics/diveWreckTop.ts'),/from '\.\/diveWreck';/,'the island wreck tops use the light builders');
});
ok('FishingHost mounts near the water, on a cast or on a stand request, and fails soft',()=>{
 const lazy=read('components/FishingHostLazy.tsx');
 assert(lazy.includes("export const loadFishingHost=()=>import('./FishingHost');"));
 assert(/fishingSession\.stop\(\)/.test(lazy)&&/setWant\(false\)/.test(lazy),'a failed load stops a waiting session and retries on the next want');
 assert(/pending\.current=new CustomEvent\(OPEN_MARKET_STAND/.test(lazy)&&/window\.dispatchEvent\(e\)/.test(lazy),'a stand request before the host is here is replayed');
 assert(read('lib/town/fishing/fishingWorld.ts').includes('const loadFishingVisuals=()=>{markFishingNear();'),'the 100 m visuals prefetch also wakes the host');
 assert.match(read('components/IslandJobs.tsx'),/import \{OPEN_MARKET_STAND\} from '@\/lib\/town\/fishing\/fishingSignals';/,'IslandJobs no longer pulls FishingHost in');
 assert.match(read('components/Town.tsx'),/^import FishingHost from '\.\/FishingHostLazy';/m);
});
ok('fishing near fires once',()=>{
 const events=[];global.window={dispatchEvent:e=>events.push(e.type)};
 const S=require(path.join(ROOT,'lib/town/fishing/fishingSignals.ts'));
 assert.equal(S.fishingNearSeen(),false);S.markFishingNear();S.markFishingNear();assert.deepEqual(events,[S.FISHING_NEAR_EVENT]);assert.equal(S.fishingNearSeen(),true);
 delete global.window;
});
ok('the easel tray loads on touch / sit-down; a failed load stands the child up',()=>{
 const shell=read('components/PaintEasel.tsx');
 assert(!/^import [^;]*'\.\/PaintEaselStudio'/m.test(shell));
 assert(shell.includes("export const loadEaselStudio=()=>import('./PaintEaselStudio');"));
 assert(shell.includes('useLazyPart(loadEaselStudio,v.seated,failed)')&&shell.includes('easelActions.exit()'));
 assert(shell.includes('data-easel-open'),'the world prompt stays in the boot chunk');
});
ok('the unused Town hint state is gone',()=>{const town=read('components/Town.tsx');assert(!/\bsetHint\b/.test(town)&&!/\[hint,setHint\]/.test(town));});
console.log(`PASS rare activities load on demand (${passed} checks)`);
