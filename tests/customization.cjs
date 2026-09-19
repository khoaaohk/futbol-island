const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const storage=new Map();
function load(file){const mod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return mod.exports;}
const {DEFAULT_CUSTOMIZATION:D,sanitizeCustomization,loadCustomization,saveCustomization}=load('lib/town/customization.ts');
for(const count of [0,1,99])assert.equal(sanitizeCustomization({...D,jetpack:'flying-car'},count,100).jetpack,'flying-car','Equipment is available independently of learning progress');
assert.equal(sanitizeCustomization({...D,jetpack:'hovercraft'},0,0).jetpack,'helicopter');
assert.equal(sanitizeCustomization({...D,jetpack:'alien'}).jetpack,'classic');
assert.equal(sanitizeCustomization({...D,character:'captain'},0,100).character,'captain');
assert.equal(sanitizeCustomization({...D,character:'captain'},10,100).character,'captain');
assert.equal(sanitizeCustomization({face:'invalid',body:{},character:'female'}).character,'female');
assert.equal(sanitizeCustomization({face:'invalid'}).face,D.face);
saveCustomization({...D,jetpack:'flying-car',character:'female'});
assert.equal(loadCustomization(100,100).jetpack,'flying-car');assert.equal(loadCustomization(0,100).jetpack,'flying-car','Free equipment survives reload at zero stars');
const {createPlayer}=load('lib/graphics/player.ts'),{createVehicle}=load('lib/graphics/vehicle.ts');
const player=createPlayer('customizer-test','home'),vehicle=createVehicle();
for(const jetpack of ['classic','flying-car','helicopter','ironman','rocketboard','mini-plane']){
 const appearance={...D,character:'female',body:'strong',clothing:'coast',jetpack};player.setAppearance(appearance);vehicle.setCustomization(appearance);
 player.update(1,1,.016,1,false,{travelMode:'jetpack',flyingCar:jetpack==='flying-car'});vehicle.update('jetpack',1,1,0,.016,20);
 assert.equal(vehicle.root.children.filter(v=>v.visible).length,1,'One flight subtype renders');
 assert.equal(vehicle.root.children.find(v=>v.visible).name,{classic:'jetpack','flying-car':'flying-car',helicopter:'helicopter-pack',ironman:'ironman',rocketboard:'rocketboard','mini-plane':'mini-plane'}[jetpack]);
 for(const root of [player.root,vehicle.root])root.traverse(n=>assert.ok([...n.position,...n.quaternion,...n.scale].every(Number.isFinite)));
}
const {STORE_ITEMS,equipStoreItem}=load('lib/town/store.ts');
assert.equal(new Set(STORE_ITEMS.map(item=>item.id)).size,STORE_ITEMS.length);
for(const item of STORE_ITEMS){const equipped=equipStoreItem(D,item.id);assert.ok(equipped);saveCustomization(equipped.value);assert.equal(loadCustomization()[item.category],item.option.id);assert.equal(equipped.mode,item.category==='ball'?'walk':item.category);}
assert.equal(equipStoreItem(D,'fake:paid'),null);
player.dispose();vehicle.dispose();console.log('Customization: characters independent of learning progress, every free store equip/persistence, invalid IDs, all flight subtype geometry and finite poses passed.');

const {CUSTOMIZATION_OPTIONS,isCustomizationUnlocked}=load('lib/town/customization.ts');for(const list of Object.values(CUSTOMIZATION_OPTIONS))for(const option of list)if(!option.coinReward)assert(isCustomizationUnlocked(option,0,100),'No learning gate: '+option.id);console.log('PASS all non-costume options available without quiz or Path progress');
