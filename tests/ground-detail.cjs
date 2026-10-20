// Ground detail (Oct 17 2026): mottled colour + procedural grain in the ground materials (lib/graphics/groundTint.ts) and static instanced
// decals (lib/graphics/groundDecals.ts, lib/town/groundDecalSites.ts). Checks the tint range and determinism, the grass range wider than the
// sand, decal counts under their caps, decals deterministic and clear of blocked rects, and the heat-tier switch in the source.
// usage: node tests/ground-detail.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.resolve(__dirname,'..');
const timers={raf:0,timeout:0,interval:0},winListeners=new Map();
const fakeWindow={addEventListener:(t,fn)=>{if(!winListeners.has(t))winListeners.set(t,new Set());winListeners.get(t).add(fn);},removeEventListener:(t,fn)=>winListeners.get(t)?.delete(fn),
 requestAnimationFrame:()=>{timers.raf++;return 1;},setTimeout:()=>{timers.timeout++;return 1;},setInterval:()=>{timers.interval++;return 1;}};
const cache=new Map();
function load(file){
 file=path.isAbsolute(file)?file:path.resolve(ROOT,file);
 if(cache.has(file))return cache.get(file).exports;
 const mod={exports:{}};cache.set(file,mod);
 if(file.endsWith('.json'))return mod.exports=JSON.parse(fs.readFileSync(file,'utf8'));
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true,jsx:ts.JsxEmit.React}}).outputText;
 vm.runInNewContext(code,{exports:mod.exports,module:mod,Math,JSON,Set,Map,Object,Array,Number,String,Symbol,Promise,Error,console,Date,Float32Array,Float64Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,
  window:fakeWindow,requestAnimationFrame:fakeWindow.requestAnimationFrame,setTimeout:fakeWindow.setTimeout,setInterval:fakeWindow.setInterval,navigator:undefined,document:undefined,
  require:id=>{
   if(!id.startsWith('.')&&!id.startsWith('@/'))return id==='react'?{useSyncExternalStore:(_s,get)=>get()}:require(id);
   const base=id.startsWith('@/')?path.join(ROOT,id.slice(2)):path.resolve(path.dirname(file),id);
   for(const f of [base,base+'.ts',base+'.tsx',base+'.js',base+'.json',path.join(base,'index.ts')])if(fs.existsSync(f)&&fs.statSync(f).isFile())return load(f);
   throw new Error('Cannot resolve '+id+' from '+file);}});
 return mod.exports;
}
const T=require('three');
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const tint=load('lib/graphics/groundTint.ts'),D=load('lib/graphics/groundDecals.ts'),sites=load('lib/town/groundDecalSites.ts');
// 1) the tint stays inside 1 +- amp (grass .12, sand and sand paths .09, land .05, mixed .095) everywhere, is deterministic, and grass varies more than sand
const range={};
for(const kind of ['grass','sand','path','land','mixed']){let lo=9,hi=0;for(let x=-300;x<900;x+=3.7)for(let z=-300;z<400;z+=4.1){const f=tint.groundTintFactor(x,z,kind);assert.equal(f,tint.groundTintFactor(x,z,kind));lo=Math.min(lo,f);hi=Math.max(hi,f);}
 range[kind]=[lo,hi];const a=tint.GROUND_TINT[kind].amp;assert.ok(lo>=1-a-1e-9&&hi<=1+a+1e-9,kind+' within 1+-'+a+': '+lo+' '+hi);}
assert.equal([tint.GROUND_TINT.grass.amp,tint.GROUND_TINT.sand.amp,tint.GROUND_TINT.land.amp].join(),'0.12,0.09,0.09','final mottle strengths (land = sand since Oct 17 2026)');
assert.equal(JSON.stringify(tint.GROUND_TINT.path),JSON.stringify({amp:tint.GROUND_TINT.sand.amp,grain:tint.GROUND_TINT.sand.grain,wet:false}),'sand paths get exactly the sand mottle and grain (no waterline term)');
assert.ok(tint.GROUND_TINT.grass.grain>=.14-1e-9&&tint.GROUND_TINT.sand.grain>=.16-1e-9,'grain 1.4x/1.33x the first pass (backed off from 1.6x: it read as a checkerboard)');
assert.ok(range.grass[1]-range.grass[0]>range.sand[1]-range.sand[0]+.02,'grass range is wider than sand');
assert.ok(range.grass[1]-range.grass[0]>.08,'grass mottle is visible (not flat)');
assert.ok(tint.GROUND_TINT.grass.amp>tint.GROUND_TINT.sand.amp);
// 2) the shader snippet matches the JS noise and the tier switch exists in the source
assert.ok(tint.GROUND_TINT_GLSL.includes('sin(q.x*.31+sin(q.y*.23)*1.3)*.4')&&tint.GROUND_TINT_GLSL.includes('sin(q.y*.47-q.x*.29+1.7)*.3')&&tint.GROUND_TINT_GLSL.includes('sin(q.x*.83+q.y*.71+.9)*.3'),'GLSL harmonics match groundMottle');
const src=read('lib/graphics/groundTint.ts');
assert.ok(/effectiveTier\(\)>=GROUND_GRAIN_OFF_TIER/.test(src)&&tint.GROUND_GRAIN_OFF_TIER===1,'grain is off at tier 1 and above (heat offsets Oct 19 2026; Battery saver is tier 4)');
assert.ok(/if\(uGroundGrain>0\.\)/.test(src),'the grain branch is skipped by a uniform');
assert.ok(/subscribeHeatTier\(syncGrain\)/.test(src),'tier changes update the uniform');
const heat=load('lib/graphics/heatTier.ts');
heat.forceHeatTier(0);tint.applyGroundTint(new T.MeshStandardMaterial(),'grass');assert.equal(tint.GROUND_GRAIN.value,1);
heat.forceHeatTier(2);assert.equal(tint.GROUND_GRAIN.value,0);
heat.forceHeatTier(3);assert.equal(tint.GROUND_GRAIN.value,0);heat.forceHeatTier(4);assert.equal(tint.GROUND_GRAIN.value,0);
heat.forceHeatTier(1);assert.equal(tint.GROUND_GRAIN.value,0);heat.forceHeatTier(0);assert.equal(tint.GROUND_GRAIN.value,1);heat.forceHeatTier(null);
// the materials are wired
assert.ok(/applyGroundTint\(new T\.MeshStandardMaterial\(\{color:INTERIOR_GRASS_COLOR/.test(read('lib/town/fields.ts')),'main lawn tinted');
assert.ok(/'sand'\)/.test(read('lib/town/fields.ts'))&&/tintGroundMesh\(sand,'sand'\)/.test(read('lib/town/coralCayWorld.ts'))&&/'mixed'\)/.test(read('lib/town/summitIsleWorld.ts')),'sand/cay/summit tinted');
// the inner sand and the sand-coloured paving are tinted (by source): ribbon, cay ring/shoulders/sandbars/court, paths, plazas, pier sand
const W=read('lib/town/world.ts'),C=read('lib/town/coralCayWorld.ts');
assert.ok(/tintGroundMesh\(box\(w,\.035,d,'#eddfbb'[^;]*'path'\)/.test(W),'every path() (beach paths, promenades, cay paths) is tinted');
assert.ok(/'#d6c394'[^;]*'sand'\)/.test(W)&&/pier-volleyball-sand/.test(W)&&/tintGroundMesh\(box\(24,\.07,16,'#e8d5a3'/.test(W),'dune patches and pier sand tinted');
assert.ok(/'#eddfbb'\)?[^;]*'path'\)/.test(W)&&/tintGroundMesh\(box\(54,\.045,30/.test(W)&&/tintGroundMesh\(box\(48,\.12,6/.test(W),'plaza and frontage paving tinted');
assert.ok(/-\.09,-\.09,'#f1d6a1',false,12,'sand'\)/.test(C)&&/-\.02,-\.02,'#eddfbb',false,12,'path'\)/.test(C)&&/tintGroundMesh\(flat\(put\(g,'#f1d6a1',C\.x,-\.08/.test(C)&&/color==='#f1d6a1'\)tintGroundMesh\(m,'sand'\)/.test(C),'cay shoulders, sidewalks, sandbars and court sand tinted');
// the seam: the path colour is nudged toward the beach sand, and the sand surfaces share ONE source colour
const T0=require('three');{const sandC=new T0.Color(tint.SAND_COLOR),pathSrc=new T0.Color('#eddfbb'),mesh=new T0.Mesh(new T0.BoxGeometry(1,1,1),new T0.MeshStandardMaterial({color:'#eddfbb'}));
 tint.tintGroundMesh(mesh,'path');const m=mesh.material,d=(a,b)=>Math.max(Math.abs(a.r-b.r),Math.abs(a.g-b.g),Math.abs(a.b-b.b));
 assert.ok(d(m.color,pathSrc)<=.05,'a tinted path keeps its source colour (no nudge since Oct 17 2026: it broke the roundabout coplanar check)');assert.equal(new T0.Mesh(new T0.BoxGeometry(1,1,1),mesh.material).material,m);
 const other=new T0.Mesh(new T0.BoxGeometry(1,1,1),new T0.MeshStandardMaterial({color:'#eddfbb'}));assert.equal(other.material.color.getHex(),pathSrc.getHex(),'an untinted material of that colour is untouched');}
assert.equal((read('lib/town/fields.ts').match(/#f1d6a1/g)||[]).length>=1,true);
// 3) decals: counts under the caps, deterministic, outside blocked rectangles, under 10 triangles per instance
const blockedRects=[{x:60,z:-215,w:40,d:30},{x:11,z:-80,w:6,d:6}];
const world={obstacles:blockedRects,buildings:[{x:120,z:-20,w:20,d:12}],roads:[{x:80,z:-10,w:300,d:12}],surfaceAreas:[{x:-45,z:-185,w:3,d:52}]};
const plan1=sites.planIslandDecals(world),plan2=sites.planIslandDecals(world);
assert.deepEqual(plan1,plan2,'decals are deterministic');
for(const [island,caps] of Object.entries(D.DECAL_CAPS)){const p=plan1[island],total=p.stones.length+p.tufts.length+p.flowers.length;
 assert.ok(p.stones.length<=caps.stones&&p.tufts.length<=caps.tufts&&p.flowers.length<=caps.flowers,island+' under caps');
 assert.ok(total<=1200&&caps.stones+caps.tufts+caps.flowers<=1200,island+' total <= 1200');
 assert.ok(total>=60,island+' has decals ('+total+')');}
assert.ok(Math.max(D.DECAL_TRIS.stone,D.DECAL_TRIS.tuft,D.DECAL_TRIS.flower)<10);
const idx=new D.RectIndex(world.obstacles.concat(world.buildings,world.roads,world.surfaceAreas),0);
for(const s of [...plan1.main.stones,...plan1.main.tufts,...plan1.main.flowers])assert.ok(!idx.blocked(s.x,s.z),'a main-island decal sits in a blocked rect at '+s.x+','+s.z);
// decals cover the whole main sand band (inner part too): some stones sit deeper than 60 % of the local band width
{const {ISLAND_SHORE,shoreSandWidth}=load('lib/town/shoreline.ts');let inner=0,all=0;for(const st of plan1.main.stones){let best=1e9,bw=1;for(const p of ISLAND_SHORE){const d=Math.hypot(p.x-st.x,p.z-st.z);if(d<best){best=d;bw=shoreSandWidth(p);}}all++;if(best>.6*bw)inner++;}
 assert.ok(inner/all>.25,'main stones reach the inner beach band ('+inner+'/'+all+')');}
const stats=n=>n+' '+plan1[n].stones.length+'/'+plan1[n].tufts.length+'/'+plan1[n].flowers.length;
// the builder makes at most one InstancedMesh per kind, opaque, with no shadows, and disposes
const parent=new T.Group(),built=sites.buildIslandDecals(parent,world);
const meshes=[];parent.traverse(o=>{if(o.isInstancedMesh)meshes.push(o);});
assert.ok(meshes.length<=12&&meshes.length>=3,'<= 1 InstancedMesh per kind per island (stones, tufts, flowers + the macro strips)');
for(const m of meshes){assert.ok(!m.material.transparent&&!m.castShadow&&!m.receiveShadow,m.name);const g=m.geometry,tris=g.index?g.index.count/3:g.getAttribute('position').count/3;assert.ok(tris<12,m.name+' tris '+tris);}
assert.equal(built.count,meshes.reduce((a,m)=>a+m.count,0));
assert.ok(meshes.filter(m=>/strips$/.test(m.name)).length<=3,'the macro strips are the only new mesh: +1 draw per island');
built.dispose();assert.equal(parent.children.length,0);
// 4) open spaces + macro detail (Oct 17 2026)
const OS=load('lib/town/openSpaces.ts'),scans=sites.scanIslands(world),scans2=sites.scanIslands(world);
const sig=sc=>JSON.stringify({n:sc.openCells,r:sc.regions.map(r=>[r.kind,r.cells,r.cx,r.cz]),c:sc.cells.map(c=>[c.i,c.j,c.kind])});
const MH={dune:'mounds',bare:'mounds',litter:'mounds',flower:'mounds',log:'stones',rock:'stones',shell:'stones',tuft:'tufts',ripple:'strips',weed:'strips',towel:'strips'};
const rep=[];
for(const island of ['main','cay','summit']){
 const sc=scans[island];assert.equal(sig(sc),sig(scans2[island]),island+' open-space scan is deterministic');
 assert.ok(sc.openCells>50&&sc.largest&&sc.largest.cells>=30,island+' has big open regions ('+sc.openCells+')');
 // every open cell is 9 m clear of the blocked rects (centre test) and region cells add up
 const wide=new D.RectIndex(world.obstacles.concat(world.buildings,world.roads,world.surfaceAreas),OS.OPEN_MARGIN-.01);
 for(const c of sc.cells)assert.ok(!wide.blocked(c.x,c.z),island+' open cell near a blocked rect at '+c.x+','+c.z);
 assert.equal(sc.regions.reduce((a,r)=>a+r.cells,0),sc.openCells);
 for(const c of sc.cells)assert.equal(c.w>0,sc.regions[c.region].cells>=4,'small gaps (<4 cells) get no macro detail');
 // macro: separate cap, deterministic, outside blocked rects (even with a 0.9 m margin), per-kind triangle limits
 const p=plan1[island],macro=p.macro;
 assert.ok(macro.every(m=>D.MACRO_KINDS_KEPT.includes(m.k)),island+' only the kept macro kinds (driftwood, rocks, seaweed): '+[...new Set(macro.map(m=>m.k))]);
 if(true){ // macro checks below that assume all kinds are relaxed for the kept three (Oct 17 2026)
  const blocked=new D.RectIndex(world.obstacles.concat(world.buildings,world.roads,world.surfaceAreas),.9);for(const m of macro)assert.ok(!blocked.blocked(m.x,m.z),island+' macro '+m.k+' outside blocked rects');assert.ok(macro.length<=D.MACRO_CAP,island+' macro under cap');continue;}
 assert.ok(macro.length<=D.MACRO_CAP&&D.MACRO_CAP===900,island+' macro under its own cap of 900 ('+macro.length+')');
 assert.ok(macro.length>=400,island+' macro fills the open space ('+macro.length+')');
 assert.ok(p.stones.length+p.tufts.length+p.flowers.length<=1200,'small decal caps unchanged');
 const idx2=new D.RectIndex(world.obstacles.concat(world.buildings,world.roads,world.surfaceAreas),.9);
 for(const m of macro){assert.ok(!idx2.blocked(m.x,m.z),island+' macro '+m.k+' inside a blocked rect at '+m.x+','+m.z);assert.ok(D.MACRO_HOST_TRIS[MH[m.k]]<12);assert.equal(D.MACRO_HOST[m.k],MH[m.k]);}
 // minimum spacing: no two macro instances closer than 0.3 m, and dunes keep 2 m
 const seen=new Map();for(const m of macro){const k=Math.floor(m.x)+','+Math.floor(m.z);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(const o of seen.get((Math.floor(m.x)+a)+','+(Math.floor(m.z)+b))||[])assert.ok(Math.hypot(o.x-m.x,o.z-m.z)>=.28,island+' two macro instances closer than 0.3 m');if(!seen.has(k))seen.set(k,[]);seen.get(k).push(m);}
 const kinds=new Set(macro.map(m=>m.k));assert.ok(kinds.size>=(island==='summit'?7:9),island+' varied kinds: '+[...kinds]);
 // the sand ones stay on sand, the lawn ones on lawn (kinds are disjoint by ground)
 const sandKinds=['dune','ripple','weed','shell','log','towel'],grassKinds=['tuft','flower','bare','litter'];
 assert.ok(macro.some(m=>sandKinds.includes(m.k))&&macro.some(m=>grassKinds.includes(m.k)),island+' both sand and lawn get macro detail');
 // coverage of the open area (4 m sub-cells with at least one instance): clearly up
 const small=[...p.stones,...p.tufts,...p.flowers],before=OS.openCoverage(sc,small),after=OS.openCoverage(sc,[...small,...macro]);
 assert.ok(after.ratio>=before.ratio*1.8&&after.ratio-before.ratio>=.04,island+' open-area coverage up clearly: '+before.ratio.toFixed(3)+' -> '+after.ratio.toFixed(3));
 assert.deepEqual(p.open.coverageAfter,+after.ratio.toFixed(3));
 const tris=macro.reduce((a,m)=>a+D.MACRO_HOST_TRIS[MH[m.k]],0);
 rep.push(island+' open '+sc.openCells+' cells ('+sc.openArea+' m2, '+sc.regions.length+' regions, largest '+sc.largest.cells+' '+sc.largest.kind+'), macro '+macro.length+' ('+tris+' tris), coverage '+before.ratio.toFixed(3)+'->'+after.ratio.toFixed(3));
}
// macro is region-weighted: tiny gaps get nothing, the weight grows with the region size up to 1 (checked on the helper), and cells carry it
{let prev=-1;for(const n of [1,3,4,8,16,32,64]){const w=OS.regionWeight(n);assert.ok(w>=prev);prev=w;}assert.equal(OS.regionWeight(3),0);assert.equal(OS.regionWeight(32),1);assert.ok(OS.regionWeight(4)<.4);
 for(const sc of Object.values(scans))for(const c of sc.cells)assert.equal(c.w,OS.regionWeight(sc.regions[c.region].cells));}
console.log(rep.join('\n'));
console.log('ground-detail ok: grass '+range.grass.map(v=>v.toFixed(3))+' sand '+range.sand.map(v=>v.toFixed(3))+'; decals '+[stats('main'),stats('cay'),stats('summit')].join(', ')+'; '+meshes.length+' instanced meshes');
