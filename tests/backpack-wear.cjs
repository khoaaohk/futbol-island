// The always-worn backpack and its jetpack morph (Oct 20 2026, docs/backpack.md, lib/graphics/backpack.ts):
//  - worn in every ride state (walk, scooter, bike, moped, classic jet, rocketboard), hidden only for back-gear jets;
//  - the morph at 0 hides every jet part inside the closed pack, at 1 the tanks/nozzles stand out at the sides;
//  - take-off unfolds over ~.35 s, landing folds back, reduced motion swaps instantly;
//  - no pack vertex inside a ride's seat / cargo box / body, the old classic pack hidden in the town;
//  - draw-call budget (1 worn, 3 flying), sockets exported, update() allocation-free (source check).
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),cache=new Map(),storage=new Map();
function load(file){if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,console,localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):req(id)});return mod.exports;}
const T=req('three'),G=p=>load(base+'/lib/graphics/'+p+'.ts');
G('characterStyle').setCharacterStyle('bean');
const {createPlayer}=G('player'),{createVehicle}=G('vehicle'),{gearState}=G('beanGearFit'),{DEFAULT_BEAN_LOOK}=G('beanLook');
const BP=G('backpack'),{DEFAULT_CUSTOMIZATION:D}=load(base+'/lib/town/customization.ts');
const report=[];

// ---- exports / sockets
for(const k of ['root','sideLeft','sideRight','nozzleLeft','nozzleRight'])assert.equal(typeof BP.BACKPACK_SOCKETS[k],'string',k);
assert(BP.BACKPACK_SIDE_OFFSET.left[0]<-BP.PACK_SIZE.w/2&&BP.BACKPACK_SIDE_OFFSET.right[0]>BP.PACK_SIZE.w/2,'side sockets sit beside the pack');
for(const r of ['scooter','bike','moped'])assert(BP.BACKPACK_RIDE_OFFSETS[r],'ride offsets for '+r);
assert.equal(BP.HAND_JOINTS.left.hand,'left-hand');assert(Math.abs(BP.MORPH_SECONDS-.35)<1e-9);

const rig=createPlayer('you','home',true,true),vehicle=createVehicle(),pack=BP.createBackpack();
rig.setBeanLook({...DEFAULT_BEAN_LOOK,build:'regular',headwear:'none'},{kind:'kit',shirt:'#edb957',shirt2:'#fff4cd',shorts:'#26453e',socks:'#edb957',boots:'#27342f',number:10});
rig.update(0,0,1/60,0,false,{});
assert(pack.attach(rig.root),'attaches to the torso');rig.setShirtNumber(9);rig.setAppearance({...D});/* the bean skin re-hides classic meshes on these: the pack must survive */vehicle.setBackpackJet(true);
assert.equal(pack.root.parent.name,'armor-torso','parented to the torso joint');
for(const k of ['sideLeft','sideRight','nozzleLeft','nozzleRight'])assert(rig.root.getObjectByName(BP.BACKPACK_SOCKETS[k]),'socket findable on the rig: '+k);
const flight={bob:0,pitch:0,roll:0,compression:0,thrust:1,secondary:0,phase:'cruise',progress:1};
let reduced=false;
function step(mode,value={},frames=1,motion={},powered=true,swim=0,dt=1/60){
  const c={...D,...value};vehicle.setCustomization(c);
  for(let i=0;i<frames;i++){
    rig.update(0,0,dt,i*dt,false,{travelMode:mode,...(mode==='jetpack'?{flight}:{}),...motion});rig.root.position.set(0,mode==='jetpack'?3:0,0);rig.root.scale.setScalar(1);
    vehicle.update(mode,0,0,0,dt,mode==='walk'?0:6,mode==='jetpack'?flight:undefined);vehicle.root.scale.setScalar(1.12);vehicle.root.position.y=rig.root.position.y;
    vehicle.syncArmor(rig.root,true);pack.update(dt,mode,c.jetpack,powered,1,6,swim,reduced);
  }
  rig.root.updateMatrixWorld(true);vehicle.root.updateMatrixWorld(true);
}
/** World-space pack vertices at the current morph. */
function packPoints(roles){
  const g=pack.mesh.geometry,p=g.attributes.position,o=g.morphAttributes.position[0],m=pack.morph,out=[],v=new T.Vector3();
  for(let i=0;i<p.count;i++){if(roles&&!roles.includes(pack.roles[i]))continue;v.set(p.getX(i)+(o.getX(i)-p.getX(i))*m,p.getY(i)+(o.getY(i)-p.getY(i))*m,p.getZ(i)+(o.getZ(i)-p.getZ(i))*m);out.push(v.clone().applyMatrix4(pack.mesh.matrixWorld));}
  return out;
}
/** Pack points inside any visible box-shaped ride part (oriented, 5 mm tolerance). */
function insideRide(){
  const pts=packPoints([BP.BACKPACK_ROLE.body,BP.BACKPACK_ROLE.trim,BP.BACKPACK_ROLE.white,BP.BACKPACK_ROLE.black]),hits=[],inv=new T.Matrix4(),l=new T.Vector3();
  vehicle.root.traverseVisible(o=>{if(!o.isMesh||o.geometry.type!=='BoxGeometry')return;const {width,height,depth}=o.geometry.parameters;inv.copy(o.matrixWorld).invert();
    for(const p of pts){l.copy(p).applyMatrix4(inv);if(Math.abs(l.x)<width/2-.005&&Math.abs(l.y)<height/2-.005&&Math.abs(l.z)<depth/2-.005){hits.push((o.name||o.parent.name)+'@'+o.geometry.parameters.width+'v'+o.parent.visible+'/'+o.parent.parent.name);break;}}});
  return hits;
}

// ---- worn in every ride state, no clipping into the rides
const rides=[['walk',{}],['scooter',{}],['bike',{}],['moped',{}],['moped',{moped:'coast'}],['moped',{moped:'delivery'}],['bike',{bike:'coast'}],['scooter',{scooter:'mint'}],['jetpack',{jetpack:'classic'}],['jetpack',{jetpack:'rocketboard'}]];
for(const [mode,value] of rides){
  step(mode,value,40);const label=mode+':'+(value[mode]??'classic');
  assert(pack.root.visible,label+' pack visible');assert(pack.mesh.visible&&!pack.mesh.userData.beanHidden,label+' pack mesh not hidden by the bean skin');assert(pack.root.parent,label+' pack attached');
  const hits=insideRide();assert.equal(hits.length,0,label+' pack inside ride parts: '+hits.join(','));
  report.push(label+' worn, morph '+pack.morph.toFixed(2)+', draw calls '+pack.drawCalls);
}
for(const kind of ['helicopter','ironman','flying-car','mini-plane']){step('jetpack',{jetpack:kind},5);assert(!pack.root.visible,kind+' hides the pack (own back gear / seat)');}
// The old classic pack never shows in the town; it still does for a vehicle without the backpack (shop previews).
step('jetpack',{jetpack:'classic'},2);assert(!vehicle.root.getObjectByName('jetpack').visible,'classic vehicle pack hidden when the backpack jets');
{const v2=createVehicle();v2.setCustomization(D);v2.update('jetpack',0,0,0,1/60,0,flight);assert(v2.root.getObjectByName('jetpack').visible,'shop vehicle keeps its pack');v2.dispose();}

// ---- morph 0 vs 1
step('walk',{},40);assert.equal(pack.morph,0);
const jet=[BP.BACKPACK_ROLE.metal,BP.BACKPACK_ROLE.dark,BP.BACKPACK_ROLE.band];
{const g=pack.mesh.geometry,p=g.attributes.position,o=g.morphAttributes.position[0],{w,h,d}=BP.PACK_SIZE;let inside=0,total=0,maxOpen=0,minOpenY=0;
  for(let i=0;i<p.count;i++){if(!jet.includes(pack.roles[i]))continue;total++;if(Math.abs(p.getX(i))<w/2&&Math.abs(p.getY(i))<h/2&&Math.abs(p.getZ(i))<d/2)inside++;maxOpen=Math.max(maxOpen,Math.abs(o.getX(i)));minOpenY=Math.min(minOpenY,o.getY(i));}
  assert.equal(inside,total,'morph 0: every jet part hidden inside the closed pack ('+inside+'/'+total+')');
  assert(maxOpen>w/2+.1,'morph 1: tanks stand out beside the pack ('+maxOpen.toFixed(3)+')');assert(minOpenY<-h/2-.04,'morph 1: nozzles below the pack');
  report.push('vertices '+p.count+' (triangles '+p.count/3+'), jet parts '+total);}
// take-off: unfolds over ~.35 s; flames only once open
step('jetpack',{jetpack:'classic'},6);assert(pack.morph>0&&pack.morph<1,'mid-morph after .1 s: '+pack.morph);assert.equal(pack.drawCalls,1,'no flames mid-morph');
step('jetpack',{jetpack:'classic'},18);assert.equal(pack.morph,1,'open after .4 s');assert.equal(pack.drawCalls,3,'pack + two flames while flying');
assert(gearState.packBack>=0&&gearState.packBack<.3,'downwash nozzle offset set: '+gearState.packBack);
{const n=rig.root.getObjectByName(BP.BACKPACK_SOCKETS.nozzleLeft).getWorldPosition(new T.Vector3()),tank=packPoints([BP.BACKPACK_ROLE.dark]);
  const near=Math.min(...tank.map(p=>p.distanceTo(n)));assert(near<.06,'left flame socket at the morphed nozzle ('+near.toFixed(3)+')');}
// parachute / fall phase folds it
step('jetpack',{jetpack:'classic'},30,{},false);assert.equal(pack.morph,0,'unpowered (parachute) folds back');
step('jetpack',{jetpack:'classic'},30);
// landing folds back
step('walk',{},6);assert(pack.morph>0&&pack.morph<1,'folding mid-way after landing');step('walk',{},18);assert.equal(pack.morph,0,'folded after landing');assert.equal(pack.drawCalls,1);
// reduced motion: instant swap
reduced=true;step('jetpack',{jetpack:'classic'},1);assert.equal(pack.morph,1,'reduced: instant open');step('walk',{},1);assert.equal(pack.morph,0,'reduced: instant fold');reduced=false;
// swim tucks it flatter
step('walk',{},1,{},true,1);assert(Math.abs(pack.root.scale.z-.7)<1e-6,'swimming tucks the pack');step('walk',{},1);assert.equal(pack.root.scale.z,1);
// flush on the back (front face within a couple of cm of the shell, never deep inside)
{const zBack=pack.root.position.z+BP.PACK_SIZE.d/2-.012;assert(pack.root.position.z<0&&zBack<0,'pack behind the bean');}
// kit colours: body = shorts
pack.setKit({shorts:'#356478',shirt:'#bcd9d3'});{const c=pack.mesh.geometry.attributes.color,i=pack.roles.indexOf(BP.BACKPACK_ROLE.body),col=new T.Color('#356478');assert(Math.abs(c.getX(i)-col.r)<1e-3,'body takes the kit shorts colour');}
// a build change refits the pack
{const before=pack.root.position.z,beforeY=pack.root.position.y;rig.setBeanLook({...DEFAULT_BEAN_LOOK,build:'short'},{kind:'kit',shirt:'#edb957',shirt2:'#fff4cd',shorts:'#26453e',socks:'#edb957',boots:'#27342f',number:10});step('walk',{},2);
  assert.notEqual(pack.root.position.y,beforeY,'build change refits the pack');report.push('refit on build change: z '+before.toFixed(3)+' → '+pack.root.position.z.toFixed(3));}

// ---- allocation-free update (source check of the per-frame body)
{const src=fs.readFileSync(base+'/lib/graphics/backpack.ts','utf8'),body=src.slice(src.indexOf('    update(dt:number'),src.indexOf('    dispose(){'));
  const bad=body.replace(/if\(hasBean&&[^\n]*rebuild\(\);/,'').match(/new |\[\]|\.map\(|\.filter\(|\.\.\.|=>|\{\s*[a-z]+:/g);
  assert.equal(bad,null,'update() allocates: '+bad);}
pack.dispose();assert(!pack.root.parent,'dispose detaches');vehicle.dispose();
// Rooms and portraits (Oct 21 2026): wearBackpack — attached folded in the room's rig, kit colours, refresh on a kit change; one
// line in the shop, konbini, museum, arcade room and the customizer preview; the classic-jet crash debris includes the pack.
{const room=createPlayer('you','home',true,true);room.setBeanLook({...DEFAULT_BEAN_LOOK,build:'regular'},{kind:'kit',shirt:'#edb957',shirt2:'#fff4cd',shorts:'#1d4f9a',socks:'#edb957',boots:'#27342f',number:10});
 const w=BP.wearBackpack(room.root,{shorts:'#1d4f9a',shirt:'#edb957'});assert(w&&w.pack.root.parent,'worn in a room');assert.equal(w.pack.morph,0,'folded (never the jet in a room)');assert(w.pack.root.visible,'shown');
 const col=w.pack.mesh.geometry.attributes.color,roles=w.pack.roles,i0=[...roles].indexOf(BP.BACKPACK_ROLE.body),c=new T.Color('#1d4f9a');
 assert(Math.abs(col.getX(i0)-c.r)<.02&&Math.abs(col.getZ(i0)-c.b)<.02,'body in the kit shorts colour');w.refresh({shorts:'#b0302a',shirt:'#ffffff'});c.set('#b0302a');assert(Math.abs(col.getX(i0)-c.r)<.02,'refresh recolours');
 w.dispose();assert(!w.pack.root.parent,'disposed with the room');
 for(const f of ['lib/shop/shopScene.ts','lib/konbini/konbiniScene.ts','lib/museum/museumScene.ts','lib/arcade/arcadeRoomScene.ts','components/CharacterPreview.tsx']){const src=fs.readFileSync(base+'/'+f,'utf8');
  assert(/wearBackpack\(/.test(src)&&/pack\?\.dispose\(\)/.test(src),f+': wears the pack and disposes it');}
 assert(/jetpackBreakup\.trigger\(vehicle\.root,reduced,customizationRef\.current\.jetpack==='classic'\?backpack\.root:null\)/.test(fs.readFileSync(base+'/components/Town.tsx','utf8')),'classic crash debris includes the pack');
 const JB=load(base+'/lib/graphics/jetpackBreakup.ts').createJetpackBreakup(),v2=createVehicle(),host=new T.Group(),pk=BP.createBackpack(),r2=createPlayer('you','home',true,true);
 r2.setBeanLook({...DEFAULT_BEAN_LOOK},{kind:'kit',shirt:'#edb957',shirt2:'#fff4cd',shorts:'#26453e',socks:'#edb957',boots:'#27342f',number:10});pk.attach(r2.root);host.add(r2.root);v2.setBackpackJet(true);
 JB.trigger(v2.root,false,pk.root);assert(JB.root.children.length>=1,'the crash throws the pack copy');JB.dispose();pk.dispose();v2.dispose();
 report.push('rooms: worn folded in the kit colours (shop, konbini, museum, arcade, customizer), refresh recolours; crash debris includes the pack');}
console.log('backpack-wear ok\n  '+report.join('\n  '));
