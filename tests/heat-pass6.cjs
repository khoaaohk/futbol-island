// Heat pass 6 (docs/performance-guide.md, Oct 3 2026): quality-neutral draw-call trims.
// 1. A chunk's static shadow batch survives shadowVisibility culling some of its members (one proxy draw, not one per survivor).
// 2. The flight-trail instanced meshes are not drawn while empty (no zero-instance draws before the first flight).
// 3. Heat pass 6b: townsfolk shadows drawn as a few instanced depth draws (lib/graphics/npcShadowBatch.ts).
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),ts=require('typescript'),T=require('three');
const load=file=>{const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require,Math});return m.exports;};
const {createStaticShadowBatches}=load('lib/graphics/staticShadowBatches.ts'),{createShadowVisibility}=load('lib/graphics/shadowVisibility.ts');

// 1. Wrapped in Town's order: batches first (inner), visibility second (outer).
{
 const scene=new T.Scene(),sun=new T.DirectionalLight();sun.position.set(-20,20,0);sun.target.position.set(0,0,0);
 const camera=new T.PerspectiveCamera(50,1,.1,100);camera.position.set(0,10,20);camera.lookAt(0,0,0);camera.updateMatrixWorld();
 const add=(name,x)=>{const mesh=new T.Mesh(new T.BoxGeometry(2,4,2),new T.MeshStandardMaterial());mesh.name=name;mesh.position.set(x,2,0);mesh.castShadow=true;scene.add(mesh);mesh.updateMatrixWorld();return mesh;};
 // chunk 0:0 has two members in view and one far away; chunk 1:0 has one in view and one far away; chunk 2:0 is entirely far away.
 const a=[add('island-chunk-0:0:a',0),add('island-chunk-0:0:b',2),add('island-chunk-0:0:far',300)];
 const b=[add('island-chunk-1:0:a',-2),add('island-chunk-1:0:far',-300)];
 const c=[add('island-chunk-2:0:a',400),add('island-chunk-2:0:b',402)];
 const all=[...a,...b,...c],proxies=()=>scene.children.filter(o=>o.name==='static-shadow-batch');
 let seen=null,fail=false;
 const original=()=>{seen={visibleProxies:proxies().filter(p=>p.visible).length,cast:Object.fromEntries(all.map(m=>[m.name,m.castShadow]))};if(fail)throw Error('render failure');};
 const renderer={shadowMap:{render:original}};
 const batches=createStaticShadowBatches(renderer,scene,true),visibility=createShadowVisibility(renderer,scene,sun);
 assert.equal(batches.stats.groups,3);
 renderer.shadowMap.render([sun],scene,camera);
 assert.equal(visibility.stats.culled,4,'the four far members are culled from the shadow pass');
 assert.equal(seen.visibleProxies,1,'chunk 0:0 keeps its one proxy draw although a member was culled');
 assert.equal(batches.stats.savedCalls,1,'two surviving members, one draw');
 assert(a.every(m=>!seen.cast[m.name]),'members of a batched group do not draw themselves');
 assert.equal(seen.cast['island-chunk-1:0:a'],true,'a single survivor draws itself (same one call, fewer triangles than the proxy)');
 assert(c.every(m=>!seen.cast[m.name]),'a fully culled chunk draws nothing');
 assert(all.every(m=>m.castShadow&&m.userData.shadowCulled===false||m.castShadow&&m.userData.shadowCulled===undefined),'flags and casters restored');
 assert(proxies().every(p=>!p.visible));
 fail=true;assert.throws(()=>renderer.shadowMap.render([sun],scene,camera));
 assert(all.every(m=>m.castShadow&&m.userData.shadowCulled!==true),'restored after a render failure');assert(proxies().every(p=>!p.visible));
 fail=false;
 // Batches alone (no visibility wrapper, desktop-like) behave as before.
 visibility.dispose();renderer.shadowMap.render([sun],scene,camera);assert.equal(seen.visibleProxies,3);batches.dispose();
 const src=fs.readFileSync('lib/graphics/shadowVisibility.ts','utf8');
 assert.match(src,/mesh\.castShadow=false;mesh\.userData\.shadowCulled=true;removed\.push\(mesh\);/);
 assert.match(src,/for\(const mesh of removed\)\{mesh\.castShadow=true;mesh\.userData\.shadowCulled=false;\}/);
}

// 2. Empty flight trails are hidden from the first frame and while empty.
{
 const {createFlightTrail}=load('lib/graphics/flightTrail.ts');const trail=createFlightTrail();
 const [streaks,rings]=trail.root.children;
 assert.equal(streaks.visible,false);assert.equal(rings.visible,false);assert.equal(streaks.count,0);
 trail.update(0,10,0,0,0,1/30,'classic',false,false,false);assert.equal(streaks.visible,false,'disabled trail stays hidden');
 trail.update(0,10,0,0,10,1/30,'classic',true,false,false);trail.update(1,10,0,0,10,1/30,'classic',true,false,false);
 assert(streaks.count>0&&streaks.visible,'a flying trail draws');
 for(let i=0;i<60;i++)trail.update(1,10,0,0,0,1/30,'classic',false,false,false);
 assert.equal(streaks.count,0);assert.equal(streaks.visible,false,'hidden again once empty');
 trail.dispose();
}

// 3. NPC shadow batch, with real bean townsfolk rigs (the same loader as tests/npc-style-batches.cjs).
{
 const path=require('node:path'),loaded=new Map(),same=(a,b,m)=>assert.equal(JSON.stringify([...a]),JSON.stringify([...b]),m);// arrays from the vm realm
 function deep(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
   {module:m,exports:m.exports,Math,require:id=>id.startsWith('.')?deep(path.resolve(path.dirname(file),id+(fs.existsSync(path.resolve(path.dirname(file),id+'.ts'))?'.ts':'.tsx'))):require(id)});
  loaded.set(file,m.exports);return m.exports;}
 const CS=deep('lib/graphics/characterStyle.ts'),{createPlayer}=deep('lib/graphics/player.ts'),B=deep('lib/graphics/beanSkin.ts'),{npcDress}=deep('lib/town/beanLooks.ts');
 const {NPC_DIALOGUES}=deep('lib/town/npcDialogues.ts'),{DEFAULT_CUSTOMIZATION}=deep('lib/town/customization.ts'),{createNpcShadowBatch}=deep('lib/graphics/npcShadowBatch.ts');
 const scene=new T.Scene(),root=new T.Group();root.name='island-townsfolk';scene.add(root);
 const rigs=NPC_DIALOGUES.slice(0,4).map((d,i)=>{CS.setCharacterStyle('bean');const rig=createPlayer('town-npc-'+d.id,'home');CS.setCharacterStyle(undefined);
  rig.setAppearance({...DEFAULT_CUSTOMIZATION,character:d.character,face:d.face,clothing:d.clothing,body:d.body??'balanced'});const dress=npcDress(d);rig.setBeanLook(dress.look,dress.outfit);
  root.add(rig.root);rig.update(300+i*3,-200,1/30,i,false);return rig;});
 // Two rides with separately built but identical parts (grouped by shape), one translated part (must not join), one lone shape.
 const ride=(x,shift)=>{const g=new T.Group();const mat=new T.MeshStandardMaterial();const deck=new T.Mesh(new T.BoxGeometry(.6,.05,.2),mat);deck.castShadow=true;const bar=new T.Mesh(new T.BoxGeometry(.6,.05,.2).translate(0,shift,0),mat);bar.castShadow=true;g.add(deck,bar);g.position.set(x,0,5);root.add(g);return {deck,bar};};
 const r1=ride(300,.4),r2=ride(305,.8),lone=new T.Mesh(new T.TorusGeometry(.3,.04,5,12),new T.MeshStandardMaterial());lone.castShadow=true;const g3=new T.Group();g3.add(lone);root.add(g3);
 scene.updateMatrixWorld(true);
 const hidden=rigs[3];hidden.root.visible=false;// a unit culled by the view gate or shadowVisibility this pass
 const bodies=rigs.map(r=>r.root.getObjectByName('bean-body')),limbs=rigs.map(r=>r.root.getObjectByName('bean-limbs')),hairs=rigs.map(r=>r.root.getObjectByName('bean-hair'));
 let seen=null,fail=false;const proxies=()=>scene.children.filter(o=>o.name==='npc-shadow-batch');
 const original=function(){const vis=proxies().filter(p=>p.visible);
  seen={proxies:vis.map(p=>({count:p.count,kind:p.customDepthMaterial?.beanKind??'plain',p})),bodyCast:bodies.map(m=>m.castShadow),limbCast:limbs.map(m=>m.castShadow),hairCast:hairs.map(m=>m.castShadow),
   deck:[r1.deck.castShadow,r2.deck.castShadow],bar:[r1.bar.castShadow,r2.bar.castShadow],lone:lone.castShadow};
  // Each batched instance reproduces its source mesh: world matrix (proxy origin × relative instance) and its bean row.
  for(const {p} of seen.proxies){const m=new T.Matrix4(),world=new T.Matrix4();
   for(let i=0;i<p.count;i++){p.getMatrixAt(i,m);world.multiplyMatrices(p.matrixWorld,m);
    const src=[...bodies,...limbs,r1.deck,r2.deck].find(s=>{const a=s.matrixWorld.elements,b=world.elements;return a.every((v,k)=>Math.abs(v-b[k])<1e-4)&&(p.customDepthMaterial?s.customDepthMaterial?.beanKind===p.customDepthMaterial.beanKind:!s.customDepthMaterial);});
    assert(src,'instance '+i+' matches a source caster');
    if(p.customDepthMaterial){const d=p.customDepthMaterial.beanUniforms,fixed=d.beanData.value,pose=d.beanDyn.value,row=src.userData.beanData;
     for(let k=0;k<row.width;k++)for(let c=0;c<4;c++){const t=k<fixed.image.width?fixed:pose,x=k<fixed.image.width?k:k-fixed.image.width;assert(t.image.data[(i*t.image.width+x)*4+c]===Math.fround(row.array[k*4+c]),'bean row texel '+k);/* === : 0 and -0 are the same texel */}}}}
  if(fail)throw Error('render failure');};
 const renderer={shadowMap:{render:original,enabled:true,autoUpdate:true,needsUpdate:false},info:{render:{frame:1}},getContext(){return {};}};
 const batch=createNpcShadowBatch(renderer,scene);batch.addRoots([root]);
 renderer.shadowMap.render([],scene,new T.OrthographicCamera());
 const kinds=seen.proxies.map(p=>p.kind+':'+p.count).sort();
 same(kinds.filter(k=>k.startsWith('body')||k.startsWith('limbs')),['body:3','limbs:3'],'3 visible townsfolk → one body and one limbs depth draw');
 assert(kinds.includes('plain:2'),'the two identical decks share one draw');
 same(seen.bodyCast.slice(0,3),[false,false,false]);same(seen.limbCast.slice(0,3),[false,false,false]);
 assert.equal(seen.bodyCast[3],true,'a hidden unit is left alone');same(seen.hairCast,hairs.map(()=>false),'hair casts no shadow, as before');
 same(seen.bar,[true,true],'a geometry edited after construction (same parameters, other vertices) is not grouped');assert.equal(seen.lone,true,'a lone shape draws itself');
 same(seen.deck,[false,false]);
 assert([...bodies.slice(0,3),...limbs.slice(0,3),r1.deck,r2.deck].every(m=>m.castShadow),'casters restored');assert(proxies().every(p=>!p.visible),'proxies hidden outside the pass');
 assert(B.BeanDepthMaterial&&seen.proxies.filter(p=>p.kind!=='plain').every(p=>p.p.customDepthMaterial instanceof B.BeanDepthMaterial),'bean proxies use the bean depth deformation');
 fail=true;assert.throws(()=>renderer.shadowMap.render([],scene,new T.OrthographicCamera()));fail=false;
 assert([...bodies.slice(0,3),...limbs.slice(0,3),r1.deck,r2.deck].every(m=>m.castShadow),'restored after a render failure');assert(proxies().every(p=>!p.visible));
 // Shadow map not updating this frame (autoUpdate off): no work, nothing touched.
 renderer.shadowMap.autoUpdate=false;seen=null;renderer.shadowMap.render([],scene,new T.OrthographicCamera());assert.equal(seen.proxies.length,0);assert(seen.bodyCast[0]);renderer.shadowMap.autoUpdate=true;
 // Disabled: the per-mesh path, exactly as before.
 batch.setEnabled(false);renderer.shadowMap.render([],scene,new T.OrthographicCamera());assert.equal(seen.proxies.length,0);assert(seen.bodyCast.every(Boolean));batch.setEnabled(true);
 // Steady state allocates nothing new: no new proxies on later passes.
 const before=proxies().length;for(let i=0;i<5;i++){renderer.info.render.frame++;renderer.shadowMap.render([],scene,new T.OrthographicCamera());}assert.equal(proxies().length,before);
 batch.dispose();assert.equal(renderer.shadowMap.render,original);assert.equal(proxies().length,0);
 const town=fs.readFileSync('components/Town.tsx','utf8');
 assert(town.indexOf('createNpcShadowBatch(renderer,scene)')<town.indexOf('createShadowVisibility(renderer,scene,sun)'),'created before shadowVisibility, so it runs inside its culling');
 assert.match(town,/npcShadows\.addRoots\(\[islandNpcs\.root\]\)/);assert.match(town,/npcShadows\.dispose\(\)/);
}
console.log('PASS heat pass 6: shadow batches survive partial shadow culling, empty flight trails are not drawn, townsfolk shadows batched');
