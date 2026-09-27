// Bean costumes (lane E, docs/bean-characters/CONTRACT.md): every costume builds for every build, attaches to the
// solver joints, stays inside the merged-mesh budget, has finite geometry, patches lane A's shaders, and the
// fallback switch keeps the bean skin for costumes with a bean version (classic fallback otherwise).
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path'),T=require('three');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),cache=new Map(),storage=new Map();
function load(file){if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,console,localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):req(id)});cache.set(file,mod.exports);return mod.exports;}
const {setCharacterStyle}=load(base+'/lib/graphics/characterStyle.ts');setCharacterStyle('bean');
const {createPlayer}=load(base+'/lib/graphics/player.ts');
const BC=load(base+'/lib/graphics/beanCostumes.ts');
const {beanSkinOf,BeanMaterial}=load(base+'/lib/graphics/beanSkin.ts');
const {CLUB_COSTUMES}=load(base+'/lib/town/costumes.ts'),{ISLAND_COSTUMES}=load(base+'/lib/town/islandCostumes.ts'),{DEFAULT_CUSTOMIZATION:D}=load(base+'/lib/town/customization.ts');
const BUILDS=['regular','tall','short','wide'];

// 1. Every costume id has a bean version and builds for every build: finite, within budget.
assert.equal(BC.BEAN_COSTUME_IDS.length,Object.keys(ISLAND_COSTUMES).length,'every island costume has a bean version');
assert.equal(BC.BEAN_COSTUME_IDS.length,CLUB_COSTUMES.length+1,'all club costumes plus the Matchday Fox');
let maxMeshes=0,maxTris=0;const signatures=new Set();
for(const id of BC.BEAN_COSTUME_IDS)for(const build of BUILDS){
 const parts=BC.beanCostumeParts(id,build);assert(parts&&parts.size>0,'parts '+id+' '+build);
 assert(parts.size<=BC.BEAN_COSTUME_MESH_BUDGET,`merged meshes ${id}: ${parts.size}`);maxMeshes=Math.max(maxMeshes,parts.size);
 let tris=0;for(const [joint,geo] of parts){for(const name of ['position','normal','color']){const a=geo.getAttribute(name);assert(a,name+' '+id+' '+joint);assert(a.array.every(Number.isFinite),`NaN in ${name} ${id} ${joint}`);}tris+=geo.getAttribute('position').count/3;
  assert(!geo.index&&Object.keys(geo.attributes).sort().join()==='color,normal,position','one vertex layout for the shared material');}
 maxTris=Math.max(maxTris,tris);assert(tris<5000,`triangle budget ${id}: ${tris}`);
 assert.equal(BC.beanCostumeParts(id,build),parts,'cached per costume × build (shared by every wearer)');
 if(build==='regular')signatures.add([...parts].map(([j,g])=>j+':'+g.getAttribute('position').count+':'+g.getAttribute('color').array.reduce((a,b)=>a+b,0).toFixed(2)).join('|'));
 const limbs=BC.beanCostumeLimbs(id);assert(limbs.arm.length<=6&&limbs.leg.length<=6&&limbs.arm[0][0]===0&&limbs.leg[0][0]===0);
}
assert.equal(signatures.size,BC.BEAN_COSTUME_IDS.length,'every costume is visually distinct');
// Club colours (user decision, Sep 25 2026): the onesie body and limbs wear the club's home-kit colour
// (CLUB_KIT_COLOURS); the kit accent or body colour shows in the parts. No sash.
for(const club of CLUB_COSTUMES){const kit=load(base+'/lib/town/costumes.ts').CLUB_KIT_COLOURS[club.id],L=BC.beanCostumeLimbs(club.id),bodyC=club.animal==='bee'?kit.accent:kit.body;assert.equal(L.arm[0][1],bodyC,'club body colour on the sleeves '+club.id);
 const cols=new Set();for(const g of BC.beanCostumeParts(club.id).values()){const c=g.getAttribute('color').array;for(let i=0;i<c.length;i+=3)cols.add(Math.round(c[i]*255)<<16|Math.round(c[i+1]*255)<<8|Math.round(c[i+2]*255));}
 const has=hex=>{const t=new T.Color(hex);return [...cols].some(v=>Math.abs((v>>16)/255-t.r)<.02&&Math.abs((v>>8&255)/255-t.g)<.02&&Math.abs((v&255)/255-t.b)<.02);};
 assert(has(kit.body)||has(kit.accent),'club colours in the hood/tail parts '+club.id);}
assert.equal(BC.hasBeanCostume('none'),false);assert.equal(BC.hasBeanCostume('unknown'),false);assert.equal(BC.hasBeanCostume(null),false);
console.log('PASS',BC.BEAN_COSTUME_IDS.length,'bean costumes × 4 builds: finite, cached, distinct; max',maxMeshes,'merged meshes,',Math.round(maxTris),'triangles');

// 2. Shader hooks exist in lane A's compiled body and limb shaders.
for(const kind of ['body','limbs']){const m=new BeanMaterial(kind,new T.DataTexture(new Float32Array(4),1,1,T.RGBAFormat,T.FloatType));const sh={uniforms:{},vertexShader:T.ShaderLib.standard.vertexShader,fragmentShader:T.ShaderLib.standard.fragmentShader};m.onBeforeCompile(sh,null);
 assert(BC.patchCostumeShader(kind,sh),'costume hook found in lane A '+kind+' shader');assert(sh.fragmentShader.includes(kind==='body'?'uCostumePattern':'uCostumeLeg'));m.dispose();}
console.log('PASS costume patches find their hooks in lane A\'s body and limb shaders');

// 3. The switch on a real bean rig: parts attach, the skin stays active, hair/hat go under the hood, all reversible.
const rig=BC.attachBeanCostumes(createPlayer('costume-bean','home'));assert.equal(BC.attachBeanCostumes(rig),rig,'idempotent');
const skin=beanSkinOf(rig);assert(skin,'bean skin present');
const [body,limbs,hair,hat]=skin.meshes,baseBody=body.material,baseLimbs=limbs.material;
const classicCostume=()=>{let n=0;rig.root.traverse(o=>{if(o.isMesh&&o.name.startsWith('club-costume'))n++;});return n;};
const joint=n=>rig.root.getObjectByName(n);
for(const id of BC.BEAN_COSTUME_IDS){
 rig.setAppearance({...D,costume:id});
 const st=BC.beanCostumeOf(rig);assert(st&&st.id===id,'wearing '+id);
 assert.equal(skin.active,true,'bean skin stays on for '+id);assert(body.visible&&limbs.visible,'bean body shows');
 assert.equal(classicCostume(),0,'classic costume never built');
 assert.notEqual(body.material,baseBody);assert.notEqual(limbs.material,baseLimbs);assert(body.material.isBeanMaterial&&limbs.material.isBeanMaterial);
 assert(body.material.userData.costumeUniforms.uCostumePattern.value,'shared pattern texture');
 assert.equal(hair.layers.mask>>>0,2**31);assert.equal(hat.layers.mask>>>0,2**31);
 assert(st.meshes.length>0&&st.meshes.length<=BC.BEAN_COSTUME_MESH_BUDGET);
 for(const m of st.meshes){assert(m.parent&&['armor-torso','player-lumbar','player-chest','left-shoulder','right-shoulder','left-elbow','right-elbow'].includes(m.parent.name),'attached to a joint '+m.parent?.name);assert.equal(m.userData.playerId,'costume-bean');}
 // classic meshes stay hidden (only bean skin + costume parts render)
 rig.root.traverse(o=>{if(o.isMesh&&o.visible&&!skin.meshes.includes(o)&&!o.userData.beanCostume&&o.name!=='character-selection-glow')assert.fail('classic mesh visible: '+o.name);});
 rig.update(1,2,.016,1,false,{});rig.root.updateWorldMatrix(true,true);for(const m of st.meshes)assert(m.matrixWorld.elements.every(Number.isFinite));
}
// face and expression still come from the skin (preserve the player): expressions change the data row under the costume
rig.setAppearance({...D,costume:'arsenal'});const cell=skin.faceCell;rig.setExpression('calling');assert.notEqual(skin.faceCell,cell,'expression shows through the hood');rig.setExpression('neutral');
// build change refits the parts
const before=BC.beanCostumeOf(rig).meshes[0].geometry;rig.setBeanLook({...skin.look,build:skin.look.build==='tall'?'wide':'tall'},skin.outfit);
assert.equal(BC.beanCostumeOf(rig).build,skin.look.build);assert.notEqual(BC.beanCostumeOf(rig).meshes[0].geometry,before,'refit for the new build');
// removal restores lane A's materials and layers
const worn=BC.beanCostumeOf(rig).meshes;rig.setAppearance({...D,costume:'none'});
assert.equal(BC.beanCostumeOf(rig),undefined);assert(worn.every(m=>!m.parent));assert.equal(body.material,baseBody);assert.equal(limbs.material,baseLimbs);assert.equal(hair.layers.mask,1);assert.equal(hat.layers.mask,1);assert.equal(skin.active,true);
// fallback: an id without a bean version goes to lane A's classic fallback untouched
rig.setAppearance({...D,costume:'arsenal'});rig.setAppearance({...D,costume:'no-bean-version'});
assert.equal(BC.beanCostumeOf(rig),undefined,'no bean costume for unknown ids');assert.equal(skin.active,false,'lane A classic fallback');assert.equal(body.material,baseBody);
rig.setAppearance({...D,costume:'none'});assert.equal(skin.active,true);
// two wearers share the same costume geometry and part material
const rig2=BC.attachBeanCostumes(createPlayer('costume-bean-2','away'));rig.setAppearance({...D,costume:'juventus'});rig2.setAppearance({...D,costume:'juventus'});
if(skin.look.build===beanSkinOf(rig2).look.build)assert.equal(BC.beanCostumeOf(rig).meshes[0].geometry,BC.beanCostumeOf(rig2).meshes[0].geometry);
assert.equal(BC.beanCostumeOf(rig).meshes[0].material,BC.beanCostumeOf(rig2).meshes[0].material,'one shared part material');
rig.dispose();rig2.dispose();assert(!worn.some(m=>m.parent));
console.log('PASS bean rig switch: skin stays on, parts on joints, face/expression preserved, build refit, removal restores, unknown ids fall back to classic, shared geometry/material');

// 3b. Regression (Sep 25 2026, "when equipping the costumes, it doesn't apply"): the town applies a customization as
// setAppearance → setBeanLook(look, outfit with the shirt number) → setShirtNumber. Lane A's hook re-hid every non-skin
// mesh on those calls, so the hood/tail/wings vanished. Equip must stay visible through that sequence, persist through a
// save/reload, and unequip must bring the normal look back.
{
 const {saveCustomization,loadCustomization,beanLookFor,playerOutfit}=load(base+'/lib/town/customization.ts');
 const {COIN_QUEST}=load(base+'/lib/town/coinQuest.ts'),{recordCoin}=load(base+'/lib/town/coinProgress.ts');
 for(const coin of COIN_QUEST){recordCoin(coin.id,'reveal');recordCoin(coin.id,'collect');}
 const visibleParts=r=>{let n=0;r.root.traverseVisible(o=>{if(o.isMesh&&o.userData.beanCostume)n++;});return n;};
 const townApply=(r,c)=>{r.setAppearance(c);r.setBeanLook(beanLookFor(c),playerOutfit(c));r.setShirtNumber(10);};
 const you=BC.attachBeanCostumes(createPlayer('you','home',true,true));const youSkin=beanSkinOf(you);
 you.setShirtNumber(10);townApply(you,{...D});assert.equal(visibleParts(you),0);
 const equipped={...D,costume:'arsenal'};townApply(you,equipped);
 const worn=BC.beanCostumeOf(you);assert(worn&&worn.id==='arsenal','equipped');assert.equal(visibleParts(you),worn.meshes.length,'every costume part visible after the town apply sequence');
 assert.equal(youSkin.active,true,'bean body, not the classic fallback');assert.notEqual(youSkin.meshes[0].material.userData.costumeUniforms,undefined,'onesie pattern on the body');
 you.setShirtNumber(7);you.setBeanLook(beanLookFor(equipped),{...playerOutfit(equipped),number:9});assert.equal(visibleParts(you),worn.meshes.length,'still visible after later number/look changes');
 saveCustomization(equipped);const reloaded=loadCustomization();assert.equal(reloaded.costume,'arsenal','equip persists');
 const again=BC.attachBeanCostumes(createPlayer('you-reload','home',true,true));again.setShirtNumber(10);townApply(again,reloaded);assert.equal(BC.beanCostumeOf(again)?.id,'arsenal');assert(visibleParts(again)>0,'costume shows after reload');
 townApply(you,{...D,costume:'none'});assert.equal(BC.beanCostumeOf(you),undefined);assert.equal(visibleParts(you),0);assert.equal(youSkin.active,true);assert.equal(youSkin.meshes[0].material.userData.costumeUniforms,undefined,'normal look back');
 you.dispose();again.dispose();saveCustomization({...D});
 console.log('PASS regression: equip shows the costume through the town apply sequence, persists after reload, unequip restores the look');
}
// 4. Classic style: a no-op.
setCharacterStyle('classic');const classic=createPlayer('costume-classic','home');const set=classic.setAppearance;assert.equal(BC.attachBeanCostumes(classic),classic);assert.equal(classic.setAppearance,set,'classic rigs untouched');classic.dispose();setCharacterStyle('bean');
console.log('PASS classic style untouched');
