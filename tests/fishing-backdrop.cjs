// Fishing backdrop (Oct 15 2026, user: "the background while fishing is not rendering fully. we need it to render but, not detailed",
// "save on heat", "audit that for all the other fishing as well"). While fishing, every 50 m cell of static scenery is drawn exactly
// once: real (near the angler) or by the low-detail backdrop (lib/graphics/fishingBackdrop.ts), never half of a building's batches.
// Small props are dropped as whole categories, markers / people / vehicles away from the angler are skipped whole, and the colour
// pass restores exactly what it skipped. The per-spot check runs every fishing spot (all 18) against a world-sized grid.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),T=require('three');
const {mergeGeometries}=require('three/examples/jsm/utils/BufferGeometryUtils.js');
const ROOT=path.resolve(__dirname,'..');
const cache=new Map();
const context=vm.createContext({console,Set,Map,WeakMap,Math,Date,JSON,Promise,Object,Array,Number,String,Error,URL,structuredClone,queueMicrotask,performance,
 Float32Array,Float64Array,Int8Array,Uint8Array,Uint16Array,Uint32Array,Int32Array});
function load(file){if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,id=>{
  const base=id.startsWith('@/')?path.resolve(ROOT,id.slice(2)):id.startsWith('.')?path.resolve(path.dirname(file),id):null;
  if(base){for(const f of [base+'.ts',base+'.tsx',base+'/index.ts'])if(fs.existsSync(f))return load(f);}
  return id==='three'?T:require(id);});
 cache.set(file,mod.exports);return mod.exports;}
const src=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
let checks=0;const ok=(c,m)=>{assert(c,m);checks++;};
const {createFocusMode,NEAR_M}=load(path.join(ROOT,'lib/graphics/focusMode.ts'));
const {DROPPED_KINDS,BOX_PIECE,SMALL_PIECE,COARSE_FROM_M,COARSE_PIECE,regionOfCell}=load(path.join(ROOT,'lib/graphics/fishingBackdrop.ts'));
const {FISH_SPOTS}=load(path.join(ROOT,'lib/town/fishing/fishCatalog.ts'));

// ---- A synthetic island: per 50 m cell, a building (walls + roof + windows in three materials, like lib/town/world.ts batching),
// a lamp (pole + head, tagged 'lamp'), a palm (tagged 'palm'), a tiny untagged prop; merged per cell + material with piece starts.
const mats={wall:new T.MeshStandardMaterial({color:'#d8b27a'}),roof:new T.MeshStandardMaterial({color:'#b5523b'}),glass:new T.MeshStandardMaterial({color:'#7fa6c9'}),metal:new T.MeshStandardMaterial({color:'#333'}),leaf:new T.MeshStandardMaterial({color:'#3f7a3a'})};
const box=(w,h,d,x,y,z)=>{const g=new T.BoxGeometry(w,h,d);g.translate(x,y,z);return g;};
function addCell(scene,cx,cz,record){
 const x=cx*50+25,z=cz*50+25,pieces={};const put=(mat,g,kind)=>{(pieces[mat]??=[]).push({g,kind});};
 put('wall',box(12,9,10,x,4.5,z),'');put('roof',box(13,1,11,x,9.5,z),'');put('glass',box(1.2,1.4,.05,x,5,z+5.03),'');
 put('metal',box(.18,4.2,.18,x+9,2.1,z),'lamp');put('metal',box(.6,.3,.6,x+9,4.3,z),'lamp');
 put('leaf',box(.4,6,.4,x-9,3,z+6),'palm');put('leaf',box(4,.5,4,x-9,6.2,z+6),'palm');
 put('wall',box(.4,.4,.4,x+3,.2,z-8),'');
 put('leaf',new T.IcosahedronGeometry(.8,1).translate(x-3,1,z-12),'tree');// a round shrub (80 triangles): becomes its 12-triangle box
 for(const [mat,list] of Object.entries(pieces)){
  let v=0;const starts=list.map(p=>{const s=v;v+=p.g.getAttribute('position').count;return s;});
  for(const p of list){if(!p.g.index)p.g.setIndex(Array.from({length:p.g.getAttribute('position').count},(_,i)=>i));p.g.deleteAttribute('uv');p.g.deleteAttribute('normal');}// as world.ts batching
  const merged=mergeGeometries(list.map(p=>p.g));const mesh=new T.Mesh(merged,mats[mat]);mesh.name=`island-chunk-${cx}:${cz}:${mats[mat].uuid}:true`;
  mesh.userData.pieces={starts,kinds:list.map(p=>p.kind)};mesh.matrixAutoUpdate=false;scene.add(mesh);
  record.push({mesh,cell:cx+':'+cz,mat,tris:list.map(p=>({kind:p.kind,count:p.g.index.count/3,size:new T.Box3().setFromBufferAttribute(p.g.getAttribute('position')).getSize(new T.Vector3())}))});
 }
}
function world(cells){
 const scene=new T.Scene(),record=[];for(const [cx,cz] of cells)addCell(scene,cx,cz,record);
 // Markers / people / small props outside the chunks, and landmarks that must stay.
 const coins=new T.Group();coins.name='matchday-coin-hunt';scene.add(coins);
 const folk=new T.Group();folk.name='island-townsfolk';scene.add(folk);
 const jobs=new T.Group();jobs.name='island-jobs';scene.add(jobs);jobs.add(Object.assign(new T.Mesh(box(2.9,.7,.1,0,1.7,0),mats.wall),{name:'job-signs'}));
 const venue=new T.Group();venue.name='venue-11v11';scene.add(venue);venue.add(Object.assign(new T.Mesh(box(60,.1,40,135,0,100),mats.leaf),{name:'pitch-surface'}));
 const town=new T.Group();scene.add(town);
 // The ferry stays (a landmark); its padlock (the "floating green bag" of the report) is an overworld marker.
 const ferry=new T.Group();ferry.name='southeast-ferry';town.add(ferry);ferry.position.set(246,0,199);ferry.add(Object.assign(new T.Mesh(box(9,2,18,0,1,0),mats.wall),{name:'ferry-hull'}));
 const lock=new T.Mesh(box(1,1.4,.3,0,8.8,0),mats.leaf);lock.name='matchday-ferry-locked';ferry.add(lock);
 for(const [cx,cz] of cells){const x=cx*50+25,z=cz*50+25;
  const coin=new T.Group();coin.name='coin-spot-'+cx+':'+cz;coin.position.set(x+5,0,z-5);coin.add(new T.Mesh(box(.5,.5,.5,0,.25,0),mats.metal));coins.add(coin);
  const npc=new T.Group();npc.position.set(x-4,0,z-4);npc.add(new T.Mesh(box(.5,1.6,.4,0,.8,0),mats.wall));folk.add(npc);
  const umbrella=new T.Mesh(new T.ConeGeometry(2,1,8),mats.roof);umbrella.position.set(x+12,3,z+12);umbrella.userData.umbrellaAnimated=true;town.add(umbrella);}
 const sun=new T.DirectionalLight('#ffffff',2.5);sun.position.set(-288,252,198);scene.add(sun,sun.target);scene.add(new T.HemisphereLight('#ffffff','#336633',1.5));
 scene.updateMatrixWorld(true);
 return {scene,record,coins,folk,jobs,venue,town,ferry,lock};
}
const isVisible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
/** Run one focused session at (x, z) and capture what the colour pass draws. */
function session(w,x,z){
 // A fishing-like shot: low behind the angler, looking back across the water at the island (the main island's centre).
 const camera=new T.PerspectiveCamera(50,16/9,.1,3000);camera.position.set(x,6,z);camera.lookAt(150,0,0);camera.updateMatrixWorld();let drawn=null;
 const renderer={render(scene,cam){const seen=new Set();scene.traverse(o=>{if(isVisible(o))seen.add(o);});drawn={seen,backdrop:[...scene.children].filter(o=>o.userData.backdrop&&o.visible)};}};
 const focus=createFocusMode(w.scene,renderer,camera);focus.enter(x,z,true);
 const before=new Map();w.scene.traverse(o=>before.set(o,o.visible));
 for(let i=0;i<400&&!focus.backdrop?.ready;i++)renderer.render(w.scene,camera);
 renderer.render(w.scene,camera);
 const after=[...before].every(([o,v])=>o.visible===v||o.userData.backdrop);
 return {focus,get drawn(){return drawn;},camera,renderer,restored:after};
}
/** Each cell drawn exactly once: real chunks all on (near) or all off with its backdrop triangles drawn. */
function audit(w,s,x,z,label){
 const {focus,drawn}=s,bd=focus.backdrop,near=focus.plan.near;
 const frustum=new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(s.camera.projectionMatrix,s.camera.matrixWorldInverse));
 const cellBox=new Map(bd.cells().map(c=>[c.key,c.box]));let inView=0;
 const byCell=new Map();for(const r of w.record){(byCell.get(r.cell)??byCell.set(r.cell,[]).get(r.cell)).push(r);}
 const geomIndex=new Map();for(const m of drawn.backdrop){const g=m.geometry,idx=g.index.array,n=g.drawRange.count,pos=g.getAttribute('position');
  for(let i=0;i<n;i+=3){const a=idx[i];const cx=Math.floor(pos.getX(a)/50),cz=Math.floor(pos.getZ(a)/50),k=cx+':'+cz;geomIndex.set(k,(geomIndex.get(k)??0)+1);}}
 for(const [cell,list] of byCell){
  const real=list.map(r=>drawn.seen.has(r.mesh));
  ok(real.every(v=>v)||real.every(v=>!v),`${label}: cell ${cell} real batches all on or all off (no half-built buildings)`);
  const dim=t=>Math.max(t.size.x,t.size.y,t.size.z);
  const b=cellBox.get(cell),far=b&&Math.hypot(Math.max(b.min.x-x,0,x-b.max.x),Math.max(b.min.z-z,0,z-b.max.z))>COARSE_FROM_M;
  const expected=list.reduce((s,r)=>s+r.tris.filter(t=>!DROPPED_KINDS.has(t.kind)&&!(t.kind===''&&dim(t)<SMALL_PIECE)&&(!far||dim(t)>=COARSE_PIECE||['tree','palm','goal'].includes(t.kind))).reduce((a,t)=>a+(dim(t)<BOX_PIECE&&t.count>12?12:t.count),0),0);
  const umbrella=new T.ConeGeometry(2,1,8).index.count/3;
  const got=geomIndex.get(cell)??0;
  if(real[0]){ok(near.has(cell),`${label}: ${cell} real only when near`);ok(got===0,`${label}: near cell ${cell} not drawn twice by the backdrop`);}
  else{ok(!near.has(cell),`${label}: ${cell} far`);
   if(frustum.intersectsBox(cellBox.get(cell))){inView++;ok(got===expected+umbrella,`${label}: far cell ${cell} in the fishing camera's frustum drawn whole by the backdrop (${got} vs ${expected+umbrella} triangles)`);}
   else ok(got===0,`${label}: far cell ${cell} outside the fishing camera's frustum not drawn`);}
 }
 ok(inView>0,`${label}: the island is in view`);return byCell;
}

// ---- 1. Main island + jetty + cay + summit cells, focused at the Deep Sea Boat ----
const cells=[];for(let cx=-2;cx<=15;cx++)for(let cz=-6;cz<=5;cz++)cells.push([cx,cz]);
{const w=world(cells),boat=FISH_SPOTS.find(s=>s.id==='deep-sea-boat');const s=session(w,boat.x,boat.z);
 ok(s.focus.backdrop.ready,'backdrop built (in slices)');ok(s.restored,'every visibility the colour pass changed is restored');
 audit(w,s,boat.x,boat.z,'deep-sea-boat');
 ok(s.focus.backdrop.cells().some(c=>c.on&&c.coarse)&&s.focus.backdrop.cells().some(c=>c.on&&!c.coarse),'mid-distance cells in the backdrop\'s fine set, the far skyline in its coarse set');
 // The shot moves (boat motion, a new aim): the cells in view follow the camera that renders.
 {const sel=s.focus.stats.selects;s.camera.lookAt(650,0,-150);s.camera.updateMatrixWorld();s.renderer.render(w.scene,s.camera);ok(s.focus.stats.selects===sel+1,'a camera turn re-selects the cells in view');audit(w,s,boat.x,boat.z,'deep-sea-boat turned');
  s.renderer.render(w.scene,s.camera);ok(s.focus.stats.selects===sel+1,'a still camera uploads nothing');}
 const bd=s.focus.backdrop;
 ok(bd.meshes.size<=4,`at most one backdrop draw per island region (${bd.meshes.size})`);
 for(const m of bd.meshes.values()){ok(!m.castShadow&&!m.receiveShadow,'backdrop casts and receives no shadows');
  ok(m.material.type==='ShaderMaterial'&&!m.material.lights&&!m.material.transparent&&m.material.vertexColors,'backdrop: one small shader (no scene light loop, no maps)');
  ok(!m.geometry.getAttribute('uv')&&m.geometry.getAttribute('color').array instanceof Uint8Array&&m.geometry.getAttribute('normal').array instanceof Int8Array,'backdrop: positions + byte colours + byte normals, no UVs');}
 {const f=bd.material.fragmentShader;
  ok(/uSun\*saturate\(dot\(n,uSunDir\)\)\+mix\(uGround,uSky,\.5\*dot\(n,uHemiDir\)\+\.5\)\+uAmbient/.test(f)&&/RECIPROCAL_PI/.test(f),'backdrop light = three\'s Lambert sun + hemisphere + ambient terms (no seam with the real near cells)');
  ok(/dot\(vNormalB,vNormalB\)<\.25\?\(vec4\(normalize\(cross\(dFdx\(vViewPosition\),dFdy\(vViewPosition\)\)\)/.test(f),'zero-normal pieces (boxes) shade flat, the rest smooth');
  ok(/#include <fog_fragment>/.test(f)&&/#include <colorspace_fragment>/.test(f)&&/#include <tonemapping_fragment>/.test(f),'fog, tone mapping and output colour space as the island');
  const u=bd.material.uniforms;ok(Math.abs(u.uSun.value.r-2.5)<1e-6&&u.uSunDir.value.y>.5&&Math.abs(u.uSky.value.g-1.5)<1e-6,'the scene\'s sun and sky are copied into the backdrop each focused frame');}
 const posAttrs=new Set([...bd.meshes.values()].map(m=>m.geometry.getAttribute('position')));ok(posAttrs.size===1,'regions share ONE vertex buffer');
 // Whole categories: no lamp anywhere in the backdrop (all lamps or none), palms all kept, tiny untagged props gone.
 ok(bd.stats.droppedKinds.lamp===cells.length*2,'every lamp piece dropped (all lamps, none half)');
 ok(bd.stats.droppedKinds.small===cells.length*2,'every small untagged piece (window, tiny prop) dropped');
 ok(bd.stats.boxed===cells.length,'small rounded pieces drawn as boxes (whole, never dropped)');
 // Markers / people: far ones skipped, near ones drawn; jobs never; landmarks always.
 const far=[...w.coins.children].filter(c=>Math.hypot(c.position.x-boat.x,c.position.z-boat.z)>NEAR_M+5),near=[...w.coins.children].filter(c=>Math.hypot(c.position.x-boat.x,c.position.z-boat.z)<NEAR_M-5);
 ok(far.length&&far.every(c=>!s.drawn.seen.has(c)),'no far ball-hunt marker in the fishing view');
 ok(near.every(c=>s.drawn.seen.has(c)),'markers next to the angler stay');
 ok([...w.folk.children].filter(c=>Math.hypot(c.position.x-boat.x,c.position.z-boat.z)>NEAR_M+5).every(c=>!s.drawn.seen.has(c)),'far townsfolk skipped whole');
 ok(!s.drawn.seen.has(w.jobs),'job signs never drawn behind a fishing shot');
 ok(s.drawn.seen.has(w.venue.children[0]),'pitches (landmarks) stay');
 ok(s.drawn.seen.has(w.ferry.children[0])&&!s.drawn.seen.has(w.lock),'the ferry stays, its floating padlock marker does not');
 ok([...w.town.children].filter(u=>u.userData.umbrellaAnimated).every(u=>{const k=Math.floor(u.position.x/50)+':'+Math.floor(u.position.z/50);return s.focus.plan.near.has(k)===s.drawn.seen.has(u);}),'umbrellas: real near, backdrop far');
 // Other renders (shore field capture, previews) and exit see the normal scene.
 const other=new T.OrthographicCamera();
 s.renderer.render(w.scene,other);ok(w.record.every(r=>r.mesh.visible),'a render with another camera is untouched');
 s.focus.exit();s.renderer.render(w.scene,s.camera);ok(s.drawn.seen.size>0&&w.record.every(r=>s.drawn.seen.has(r.mesh))&&s.drawn.backdrop.length===0,'after fishing: full island, no backdrop');
 // Re-entering elsewhere re-selects (no rebuild).
 const built=bd.stats.buildMs;s.focus.enter(-95.5,24,true);s.renderer.render(w.scene,s.camera);ok(s.focus.backdrop===bd&&bd.stats.buildMs===built,'built once per page');
 audit(w,s,-95.5,24,'re-enter west-cove');s.focus.exit();
 // The easel holds still without the backdrop.
 s.focus.enter(0,0,false);s.renderer.render(w.scene,s.camera);ok(w.record.every(r=>s.drawn.seen.has(r.mesh))&&s.drawn.backdrop.length===0,'easel focus: everything drawn, no backdrop');s.focus.dispose();}

// ---- 2. Every fishing spot (all 18): each cell exactly once, the angler's own cell real, nothing else ----
ok(FISH_SPOTS.length>=18,`all fishing spots audited (${FISH_SPOTS.length})`);
{const w=world(cells);
 for(const spot of FISH_SPOTS){const s=session(w,spot.x,spot.z);
  const own=Math.floor(spot.x/50)+':'+Math.floor(spot.z/50);
  ok(s.focus.plan.near.has(own),`${spot.id}: the angler's own cell is full detail`);
  ok(s.focus.plan.near.size<=9,`${spot.id}: only the cells round the angler stay real (${s.focus.plan.near.size})`);
  audit(w,s,spot.x,spot.z,spot.id);ok(s.restored,`${spot.id}: visibility restored after the pass`);s.focus.dispose();}}

// ---- 3. Wiring: Town gives focus the renderer and the main camera; world.ts records the pieces; the old distance cut is gone ----
{const town=src('components/Town.tsx'),fm=src('lib/graphics/focusMode.ts'),wd=src('lib/town/world.ts');
 ok(/createFocusMode\(scene,renderer,camera\)/.test(town),'Town wires focus mode to the renderer and the main (fishing) camera');
 ok(/focus\.enter\(s\.x,s\.z,!easel\.focused/.test(town),'fishing uses the backdrop, the easel does not');
 ok(!/chunkRadius|aspect<1\?90:200/.test(fm+town),'no distance cut by material batch any more');
 ok(/mesh\.userData\.pieces=\{starts:batch\.starts,kinds:batch\.kinds\}/.test(wd),'world.ts records piece starts and prop kinds per chunk');
 ok(/cam!==camera/.test(fm),'only the main camera\'s colour pass is changed');}
// Region split matches world.ts's Coral Cay / Summit Isle gates.
ok(regionOfCell(8,0)==='isle'&&regionOfCell(6,1)==='jetty'&&regionOfCell(5,-4)==='cay'&&regionOfCell(2,2)==='main','region split');
console.log(`fishing-backdrop: ${checks} checks passed`);
