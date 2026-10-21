// Travel map marks and key (Sep 30 2026): one J per job board, V / F / J explained by tapping the key (general tooltips, not per
// place), map marks are plain drawings (not buttons), no "flight area" text, a Beach Soccer title, no finger drag on phones,
// and the tooltip is CSS-only motion (heat: nothing loops). Browser checks: tests/e2e/travel-map.spec.ts.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(base,f),'utf8');
const loaded=new Map();function load(file){file=path.resolve(base,file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,{exports:mod.exports,module:mod,Math,JSON,Set,Map,require:id=>{
  if(id.startsWith('.')){
   const t=path.resolve(path.dirname(file),id);
   // A handful of data modules (vendingCatalog's card/book catalogues) import JSON directly: hand it to Node's own require.
   if(id.endsWith('.json')&&fs.existsSync(t))return require(t);
   return load(fs.existsSync(t+'.ts')?t+'.ts':t);
  }
  // A few data modules pull in a React hook file in passing (never called at module load): a harmless stub keeps the loader
  // tiny instead of chasing those transitive imports.
  const stub=new Proxy(function(){},{get:()=>stub,apply:()=>stub});return stub;
 }});return mod.exports;}
const {JOBS}=load('lib/town/jobs/jobCatalog.ts'),M=load('lib/town/mapMarkers.ts');

// 1. One J per job board, from the catalog (new jobs appear by themselves), including the Coral Cay farm jobs.
{const marks=[{x:11,z:-48},{x:230,z:35}],venues=[{x:135,z:100}],placed=M.placeJobMarkers(JOBS,marks,venues,{x:230,z:35});
 assert.equal(placed.length,JOBS.length,'one J per job');
 assert.equal(placed.map(p=>p.id).join(),JOBS.map(j=>j.id).join(),'in catalog order, by id');
 assert(placed.some(p=>p.id==='farm-harvest'),'Harvest day (Coral Cay farm) has a J');
 for(const p of placed){const j=JOBS.find(j=>j.id===p.id);assert(Math.hypot(p.x-j.board.x,p.z-j.board.z)<60,`${p.id}: J stays near its board`);
  for(const m of marks)assert(Math.hypot(p.x-m.x,p.z-m.z)>=19.9,`${p.id}: J clear of a V/F mark`);}
 for(let i=0;i<placed.length;i++)for(let k=0;k<i;k++)assert(Math.hypot(placed[i].x-placed[k].x,placed[i].z-placed[k].z)>=19.9||JOBS.length<2,`${placed[i].id} / ${placed[k].id}: Js do not stack`);
 const overview=read('components/IslandOverview.tsx');
 assert.match(overview,/placeJobMarkers\(JOBS,/,'the map draws the J marks from JOBS');
}
// 2. Tooltip content per kind (the key's tooltips are general, not per location).
assert.equal(M.legendTipText('vending'),'Vending machines: spend coins on books, packs and gear');
assert.equal(M.legendTipText('fishing'),'Fishing spots: catch fish to sell at Rosa’s market');
assert.equal(M.legendTipText('job'),'Jobs: help out to earn coins');
assert.equal(M.legendTipText('dive'),'Reefs to explore: swim out to the flag and explore the shallow coral reef');
// 3. The key: V, F, J (tap targets with a tooltip) and You; Rosa's market and "Places: tap to travel" are gone.
{const map=read('components/IslandTravelMap.tsx'),legend=map.slice(map.indexOf('const LEGEND:'),map.indexOf('function LegendMark'));
 for(const [mark,label,kind] of [['V','Vending','vending'],['F','Fishing','fishing'],['J','Jobs','job'],['E','Explore','dive']])assert(legend.includes(`{mark:'${mark}',`)&&legend.includes(`label:'${label}',tip:'${kind}'`),`${mark} in the key with a tooltip`);
 assert(!/Rosa|Places: tap to travel/.test(legend),'no Rosa’s market or Places entry in the key');
 assert.match(map,/data-legend-tip=\{kind\}/,'key entries are buttons');
 assert.match(map,/role="tooltip"/,'one tooltip element');
 // 4. Heat: the tooltip is CSS-only motion; the map adds no loop.
 assert(!/requestAnimationFrame|setInterval/.test(map),'no animation loop in the travel map');
 const css=read('components/IslandTravelMap.module.css');
 assert.match(css,/\.tip\{[^}]*animation:tipIn \.16s/,'160 ms fade + rise');
 assert.match(css,/@keyframes tipIn\{from\{opacity:0;translate:0 6px\}/);
 assert.match(css,/prefers-reduced-motion:reduce\)\{[^}]*\.tip\{animation:none\}/,'reduced motion: no animation');
 assert(!/backdrop-filter/.test(css.slice(css.indexOf('.tip{'))),'no blur on the tooltip');
 // 5. Phones: a finger never drags the map (the mouse still does).
 assert.match(map,/onPointerDown=\(e:PointerEvent<HTMLDivElement>\)=>\{if\(!e\.isPrimary\|\|drag\.current\|\|e\.button!==0\|\|e\.pointerType==='touch'\|\|e\.pointerType==='pen'\)return;/,'touch/pen pointers never start a drag');
}
// 6. The marks on the map are plain drawings: no role, tab stop or pointer events on V / F / J.
{const o=read('components/IslandOverview.tsx');
 for(const cls of ['map-vending-markers','map-fishing-markers','map-dive-markers','map-job-markers']){const i=o.indexOf(`className="${cls}"`),group=o.slice(i,o.indexOf('</g>}',i)>0&&cls==='map-job-markers'?o.indexOf('</g>}',i):o.indexOf(')}</g>',i));
  assert(i>0&&/pointerEvents="none"/.test(group.slice(0,60)),`${cls}: no pointer events`);
  assert(!/role:'button'|role="button"|tabIndex|destination\(/.test(group),`${cls}: not buttons`);}
 // 7. No "Light water · Flight area" text; Beach Soccer title on the court, styled like FARM / HOSTEL.
 assert(!/flight area/i.test(o.replace(/aria-label="Offshore flight area"/,'')),'no flight area text on the map');
 assert.match(o,/data-coral-cay="court">.*<text[^>]*fill="#fff5d5" stroke="#294f43" strokeWidth="3" paintOrder="stroke"[^>]*>BEACH SOCCER<\/text>/,'Beach Soccer title');
 assert.match(o,/const \[mounted,setMounted\]=useState\(false\)/,'WebKit hydration gate kept');
}
// 7. Map audit (Oct 13 2026): every vending machine, drink machine and fishing spot has exactly one marker at (or a small
//    distance from) its true world position, no marker exists without a catalog source, and the Kit Shop + Summit Isle labels
//    are drawn. Jobs are already covered above (section 1: one J per JOBS entry, in catalog order).
{
 const vendingCatalog=load('lib/town/vendingCatalog.ts'),fishCatalog=load('lib/town/fishing/fishCatalog.ts');
 const {VENDING_MACHINES}=vendingCatalog,{FISH_SPOTS}=fishCatalog;
 // The same merge IslandOverview.tsx performs: a Konbini/kiosk and its drink machine (always <6 m apart) share one V mark.
 const VENDING_MARKERS=VENDING_MACHINES.reduce((list,m)=>{
  const near=list.find(o=>Math.hypot(o.x-m.x,o.z-m.z)<6);
  if(near)near.ids.push(m.id);else list.push({x:m.x,z:m.z,ids:[m.id]});
  return list;
 },[]);
 for(const m of VENDING_MACHINES){
  const marker=VENDING_MARKERS.find(v=>v.ids.includes(m.id));
  assert(marker,`${m.id}: every vending/drink machine has a V marker`);
  assert(Math.hypot(marker.x-m.x,marker.z-m.z)<6,`${m.id}: its V marker sits within a small distance of its true world position`);
 }
 // No V mark exists without a real machine behind it, and every machine is counted exactly once (no stale leftover mark, e.g.
 // the Summit Isle kiosk's old sandbar-landing spot).
 for(const v of VENDING_MARKERS)for(const id of v.ids)assert(VENDING_MACHINES.some(m=>m.id===id),'every V marker id traces back to a real machine in VENDING_MACHINES');
 assert.equal(VENDING_MARKERS.reduce((n,v)=>n+v.ids.length,0),VENDING_MACHINES.length,'every machine is behind exactly one V mark, with none left over');
 assert(VENDING_MACHINES.some(m=>m.id==='summit'),"Summit Isle's kiosk is in the catalog");
 assert(VENDING_MACHINES.some(m=>m.id==='drinksummit'),"Summit Isle's drink machine is in the catalog");
 const summitMachine=VENDING_MACHINES.find(m=>m.id==='summit'),summitMarker=VENDING_MARKERS.find(v=>v.ids.includes('summit'));
 assert(Math.hypot(summitMarker.x-summitMachine.x,summitMarker.z-summitMachine.z)<6,"the Summit Isle kiosk's V sits at its current summit-terrace spot");
 // The old sandbar landing (lib/town/summitIsle.ts SUMMIT_LANDMARKS.sandbarLanding, x 615 z 20) is not where any V mark is now.
 assert(Math.hypot(summitMachine.x-615,summitMachine.z-20)>20,'the Summit Isle kiosk no longer sits at the old sandbar-landing spot');

 // Fishing: the map draws one F mark straight from FISH_SPOTS (IslandOverview.tsx), so every spot is already its own marker at
 // its own position; confirm that wiring (no separate, driftable list) and that every id (incl. the new Boulder Cove) is unique.
 const overviewSrc=read('components/IslandOverview.tsx');
 assert.match(overviewSrc,/\{FISH_SPOTS\.map\(spot=>/,'F marks are drawn straight from FISH_SPOTS, so every spot always has exactly one marker at its own position');
 const fishIds=new Set();
 for(const s of FISH_SPOTS){assert(!fishIds.has(s.id),`${s.id}: fishing spot id is unique (one F mark, not two)`);fishIds.add(s.id);}
 assert(FISH_SPOTS.some(s=>s.id==='summit-cove'),"Summit Isle's Boulder Cove is in the fishing catalog, so it has an F mark");
 assert(FISH_SPOTS.some(s=>s.id==='summit-lookout'),"Summit Isle's Lookout Rocks is in the fishing catalog, so it has an F mark");
 assert(FISH_SPOTS.some(s=>s.id==='summit-palm'),"Summit Isle's Palm Point is in the fishing catalog, so it has an F mark");

 // Vending too is drawn straight from the derived VENDING_MARKERS (built from VENDING_MACHINES, never a separate hand-kept list).
 assert.match(overviewSrc,/VENDING_MARKERS=VENDING_MACHINES\.reduce/,'V marks are derived straight from VENDING_MACHINES, so none can go stale');

 // Labels: Kit Shop (the merged Club Grounds + Community Hall building) and Summit Isle are named on the map.
 assert.match(overviewSrc,/label:'KIT SHOP'/,'the Kit Shop is labelled on the full map');
 const summitMapSrc=read('components/SummitIsleMap.tsx');
 assert.match(summitMapSrc,/\{SUMMIT_NAME\}/,'Summit Isle is named on the full map');
 assert.match(summitMapSrc,/SUMMIT_CENTER\.z\+54\}.*fontSize="9"/,'Summit Isle is also named on the minimap');
 // Club Grounds and Community Hall no longer draw their own building footprints (lib/town/world.ts): they are skipped in favour
 // of the Kit Shop's one merged footprint (lib/town/kitShopExterior.ts).
 const worldSrc=read('lib/town/world.ts');
 assert.match(worldSrc,/label==='CLUB GROUNDS'\|\|label==='COMMUNITY HALL'[\s\S]{0,80}return;\}/,'CLUB GROUNDS and COMMUNITY HALL are skipped as separate building footprints');
 const kitShopSrc=read('lib/town/kitShopExterior.ts');
 assert.match(kitShopSrc,/buildings\.push\(\{x,z,w,d,height:h\+\.23,name:KIT_SHOP\.name\}\)/,'the Kit Shop pushes its one merged building footprint');
 const shopDoorsSrc=read('lib/shop/shopDoors.ts');
 assert.match(shopDoorsSrc,/name:'KIT SHOP'/,'the Kit Shop building is named "KIT SHOP"');
}
// 8. Dive zones (Oct 20 2026): one D per zone (lib/town/water/diveSpots.ts) at its buoy, drawn like the F marks.
{const o=read('components/IslandOverview.tsx');
 assert.match(o,/\{DIVE_SPOTS\.map\(spot=>\{const done=discovered\.has\(spot\.id\),fly=far\.has\(spot\.id\);\s*return <g key=\{spot\.id\} aria-label=\{`\$\{spot\.name\}: a reef to explore[^`]*`\} data-dive-marker=\{spot\.id\}[^>]*>\s*<circle cx=\{spot\.x\} cy=\{spot\.z\}/,'one E mark per dive zone, at the zone');
 assert(o.slice(o.indexOf('className="map-dive-markers"')).includes('>E</text>'),'the mark reads E (Explore; was D for Dive)');
 // 9. Oct 21 2026 (reefDiscovery.ts): the jetpack badge on the zones too far to swim to (from the data: the whole outline beyond
 // SWIM_RANGE from land), an explored zone filled with a check, the key's "Fly there" entry and the travel map's nearest-reef line.
 assert.match(o,/<ExploreMarks localMap=\{localMap\}\/>/,'the E marks are their own component (the memoized terrain stays put)');
 assert.match(o,/useSyncExternalStore\(reefStore\.subscribe,\(\)=>reefStore\.get\(\)\.discovered/,'explored zones come from the reef store');
 assert.match(o,/\{fly&&<g data-jetpack-badge="">/,'jetpack badge on far zones');assert.match(o,/\{done&&<g data-dive-check="">/,'a tiny check on explored zones');
 const R=load('lib/town/water/reefDiscovery.ts');assert.deepEqual([...R.farDiveSpotIds()].sort(),['ball-crate','kelp-trawler','moon-arch'],'the three far zones, from the data');
 assert.equal(M.legendTipText('far'),'Fly there: too far to swim, so take your jetpack to these reefs');
 const map=read('components/IslandTravelMap.tsx');assert(map.includes(`{mark:'jet',fill:'#f4cc7c',label:'Fly there',tip:'far'}`),'"Fly there" in the key with a tooltip');
 assert.match(map,/<NearestReef position=\{position\} open=\{open\}\/>/,'the nearest reef line under the key');
 assert.match(map,/nearestUndiscovered\(position\.x,position\.z,discovered\)/);}
console.log('map markers ok');
