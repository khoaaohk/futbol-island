// Travel map marks and key (Sep 30 2026): one J per job board, V / F / J explained by tapping the key (general tooltips, not per
// place), map marks are plain drawings (not buttons), no "flight area" text, a Beach Soccer title, no finger drag on phones,
// and the tooltip is CSS-only motion (heat: nothing loops). Browser checks: tests/e2e/travel-map.spec.ts.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(base,f),'utf8');
const loaded=new Map();function load(file){file=path.resolve(base,file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,JSON,require:id=>{if(id.startsWith('.')){const t=path.resolve(path.dirname(file),id);return load(fs.existsSync(t+'.ts')?t+'.ts':t);}throw Error('unexpected import '+id);}});return mod.exports;}
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
// 3. The key: V, F, J (tap targets with a tooltip) and You; Rosa's market and "Places: tap to travel" are gone.
{const map=read('components/IslandTravelMap.tsx'),legend=map.slice(map.indexOf('const LEGEND:'),map.indexOf('function LegendMark'));
 for(const [mark,label,kind] of [['V','Vending','vending'],['F','Fishing','fishing'],['J','Jobs','job']])assert(legend.includes(`{mark:'${mark}',`)&&legend.includes(`label:'${label}',tip:'${kind}'`),`${mark} in the key with a tooltip`);
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
 for(const cls of ['map-vending-markers','map-fishing-markers','map-job-markers']){const i=o.indexOf(`className="${cls}"`),group=o.slice(i,o.indexOf('</g>}',i)>0&&cls==='map-job-markers'?o.indexOf('</g>}',i):o.indexOf(')}</g>',i));
  assert(i>0&&/pointerEvents="none"/.test(group.slice(0,60)),`${cls}: no pointer events`);
  assert(!/role:'button'|role="button"|tabIndex|destination\(/.test(group),`${cls}: not buttons`);}
 // 7. No "Light water · Flight area" text; Beach Soccer title on the court, styled like FARM / HOSTEL.
 assert(!/flight area/i.test(o.replace(/aria-label="Offshore flight area"/,'')),'no flight area text on the map');
 assert.match(o,/data-coral-cay="court">.*<text[^>]*fill="#fff5d5" stroke="#294f43" strokeWidth="3" paintOrder="stroke"[^>]*>BEACH SOCCER<\/text>/,'Beach Soccer title');
 assert.match(o,/const \[mounted,setMounted\]=useState\(false\)/,'WebKit hydration gate kept');
}
console.log('map markers ok');
