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

const {CUSTOMIZATION_OPTIONS,isCustomizationUnlocked}=load('lib/town/customization.ts');for(const list of Object.values(CUSTOMIZATION_OPTIONS))for(const option of list)if(!option.coinReward&&!option.graduate)assert(isCustomizationUnlocked(option,0,100),'No learning gate: '+option.id);/* graduate caps (lib/endgame) are graduation rewards by design */console.log('PASS all non-costume options available without quiz or Path progress');

// Bean character builder (lane D): migration, sanitising, presets and every option applying.
{
 const canon=v=>JSON.stringify(v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v),same=(a,b,m)=>assert.equal(canon(a),canon(b),m);
 const C=load('lib/town/customization.ts'),L=load('lib/graphics/beanLook.ts');
 const {sanitizeCustomization:S,migrateBeanFields,applyCustomization,selectCharacter,beanLookFor,playerOutfit,BEAN_KEYS,BEAN_PRESETS,CUSTOMIZATION_OPTIONS:O,DEFAULT_CUSTOMIZATION:DC,MAIN_PLAYER_NUMBER,SHIRT_NUMBER_ROLES}=C;
 const hexOf=(key,id)=>O[key].find(o=>o.id===id).color;
 // Every bean key has options and a valid default that matches beanLook's allowed values.
 const allowed={eyes:L.BEAN_EYES,mouth:L.BEAN_MOUTHS,hair:L.BEAN_HAIR_STYLES,build:L.BEAN_BUILDS,headwear:L.BEAN_HEADWEAR};
 for(const key of BEAN_KEYS){assert.ok(O[key].length>=2,key);assert.ok(O[key].some(o=>o.id===DC[key]),'default '+key);if(allowed[key])for(const o of O[key])assert.ok(allowed[key].includes(o.id),`${key}:${o.id} is a BeanLook value`);else for(const o of O[key])assert.match(o.color,/^#[0-9a-f]{6}$/i);}
 for(const [key,list] of Object.entries(allowed))assert.equal(JSON.stringify([...list].sort()),JSON.stringify(O[key].map(o=>o.id).sort()),'builder exposes every '+key);
 // Migration: old saves (character/face/body/clothing only) keep a similar look.
 const oldFemale=S({character:'female',face:'deep',body:'slim',clothing:'coast',jetpack:'ironman'});
 assert.equal(oldFemale.character,'female');assert.equal(oldFemale.hair,'ponytail');assert.equal(oldFemale.eyes,'ovals');assert.equal(oldFemale.bodyColor,'sky');
 assert.equal(oldFemale.skinTone,'cocoa');assert.equal(oldFemale.build,'tall');assert.equal(oldFemale.clothing,'coast');assert.equal(oldFemale.jetpack,'ironman');
 const oldMale=S({character:'male',face:'light',body:'strong',clothing:'sunset'});
 assert.equal(oldMale.hair,'crop');assert.equal(oldMale.skinTone,'peach');assert.equal(oldMale.build,'wide');assert.equal(oldMale.bodyColor,'coral');
 assert.equal(S({character:'captain'}).headwear,'headband');assert.equal(S({character:'explorer'}).headwear,'bucket');
 assert.equal(S({face:'warm',body:'balanced'}).skinTone,'caramel');assert.equal(S({body:'balanced'}).build,'regular');
 same(migrateBeanFields({character:'female',face:'light',body:'balanced'}),{...BEAN_PRESETS.female,skinTone:'peach',build:'regular'});
 storage.set('futbol-island-customization-v1',JSON.stringify({costume:'none',character:'female',face:'deep',body:'strong',clothing:'coast',ball:'neon'}));
 const loaded=C.loadCustomization();assert.equal(loaded.skinTone,'cocoa');assert.equal(loaded.build,'wide');assert.equal(loaded.hair,'ponytail');assert.equal(loaded.ball,'neon');
 // Sanitising: unknown values fall back per field, unknown keys are dropped, saved bean choices win over migration.
 const dirty=S({character:'female',hair:'mohawk',hairColor:'#ff00ff',eyes:'lasers',mouth:42,build:'giant',headwear:'crown',headwearColor:null,bodyColor:{},skinTone:'teal',hacker:'<script>'});
 assert.equal(dirty.hair,'ponytail');assert.equal(dirty.hairColor,'dark');assert.equal(dirty.eyes,'ovals');assert.equal(dirty.mouth,'smile');assert.equal(dirty.build,'regular');assert.equal(dirty.headwear,'none');assert.equal(dirty.bodyColor,'sky');assert.equal(dirty.skinTone,'caramel','face tone falls back to the legacy face');
 assert.ok(!('hacker' in dirty));same(Object.keys(dirty).sort(),Object.keys(DC).sort());
 const kept=S({character:'male',face:'deep',hair:'long',skinTone:'porcelain',build:'short',headwear:'visor',headwearColor:'teal'});
 assert.equal(kept.hair,'long');assert.equal(kept.skinTone,'porcelain');assert.equal(kept.build,'short');assert.equal(kept.headwear,'visor');assert.equal(kept.headwearColor,'teal');
 same(S(JSON.parse(JSON.stringify(kept))),kept,'round trip');
 for(const bad of [null,undefined,'x',7,[]])same(S(bad),DC);
 // Presets: male/female set hair/eyes/body colour but keep face tone, build, kit choice of gear and costume.
 const custom={...DC,skinTone:'espresso',build:'wide',ball:'cosmic',jetpack:'mini-plane',costume:'none'};
 const f=selectCharacter(custom,'female');
 assert.equal(f.character,'female');assert.equal(f.hair,'ponytail');assert.equal(f.eyes,'ovals');assert.equal(f.bodyColor,'sky');assert.equal(f.skinTone,'espresso');assert.equal(f.build,'wide');assert.equal(f.ball,'cosmic');assert.equal(f.jetpack,'mini-plane');
 const m=selectCharacter(f,'male');assert.equal(m.hair,'crop');assert.equal(m.eyes,'dots');assert.equal(m.bodyColor,'coral');assert.equal(m.skinTone,'espresso');
 assert.equal(selectCharacter(f,'female'),f,'same preset is a no-op');
 // Every option is open to both presets and applies to the look.
 for(const character of ['male','female'])for(const key of BEAN_KEYS)for(const o of O[key]){
  const next=applyCustomization(selectCharacter(DC,character),key,o.id);assert.equal(next[key],o.id);assert.equal(next.character,character);same(S(next),o.graduate?{...next,[key]:S(selectCharacter(DC,character))[key]}:next,`${character} ${key}:${o.id} ${o.graduate?'is dropped until graduated':'survives a save'}`);
  const look=beanLookFor(next);
  if(key==='bodyColor')assert.equal(look.body,o.color);else if(key==='skinTone')assert.equal(look.skin,o.color);else if(key==='hairColor')assert.equal(look.hair.color,o.color);else if(key==='hair')assert.equal(look.hair.style,o.id);else if(key==='headwearColor'){assert.equal(look.headwearColor,o.color);assert.equal(look.headwearColor2,o.color2);}else assert.equal(look[key],o.id);
 }
 assert.equal(applyCustomization(DC,'hair','mohawk'),DC,'unknown option ignored');
 // Classic fields follow the bean face tone and build (costumes still render the classic body).
 assert.equal(applyCustomization(DC,'skinTone','espresso').face,'deep');assert.equal(applyCustomization(DC,'skinTone','porcelain').face,'light');assert.equal(applyCustomization(DC,'skinTone','caramel').face,'warm');
 assert.equal(applyCustomization(DC,'build','wide').body,'strong');assert.equal(applyCustomization(DC,'build','tall').body,'slim');assert.equal(applyCustomization(DC,'build','short').body,'balanced');
 // Outfit: the player's own kit from the clothing choice, shirt number 10.
 assert.equal(MAIN_PLAYER_NUMBER,10);
 for(const clothing of ['classic','coast','sunset']){const kit=playerOutfit({...DC,clothing});assert.equal(kit.kind,'kit');assert.equal(kit.number,10);assert.equal(kit.shirt,hexOf('clothing',clothing));for(const k of ['shirt','shirt2','shorts','socks','boots'])assert.match(kit[k],/^#[0-9a-f]{6}$/i);}
 // Equipment and costumes keep working alongside the bean fields.
 const geared=S({...kept,costume:'none',ball:'solar',scooter:'comet',bike:'bmx',moped:'sport',jetpack:'rocketboard'});same([geared.ball,geared.scooter,geared.bike,geared.moped,geared.jetpack],['solar','comet','bmx','sport','rocketboard']);assert.equal(geared.hair,'long');
 // Learning hook: every classic number links to a real positionReference entry; 10 is the playmaker.
 const ref=JSON.parse(fs.readFileSync('lib/town/positionReference.json','utf8'))['11v11'];
 same(SHIRT_NUMBER_ROLES.map(r=>r.number),[1,2,3,4,5,6,7,8,9,10,11]);for(const r of SHIRT_NUMBER_ROLES)assert.ok(ref[r.position],r.position);
 assert.equal(SHIRT_NUMBER_ROLES.find(r=>r.number===10).title,'Playmaker');
 // The rig accepts the saved look for every preset/option without throwing.
 const rig=createPlayer('you','home');for(const character of ['male','female'])for(const key of BEAN_KEYS)for(const o of O[key]){const v=applyCustomization(selectCharacter(DC,character),key,o.id);rig.setAppearance(v);rig.setBeanLook(beanLookFor(v),playerOutfit(v));}
 rig.update(0,0,.016,1,false,{facing:0});rig.root.traverse(n=>assert.ok([...n.position,...n.quaternion,...n.scale].every(Number.isFinite)));rig.dispose();
 console.log('PASS bean builder: legacy save migration, sanitising, male/female presets, every option on both presets, kit + number 10, number lesson links');
}

// Simplified builder: ready-made looks (4 per main character) and combined face styles.
{
 const C=load('lib/town/customization.ts'),{LOOK_PRESETS,FACE_STYLES,applyLook,applyFace,matchingLook,sanitizeCustomization:S,DEFAULT_CUSTOMIZATION:DC,CUSTOMIZATION_OPTIONS:O,beanLookFor}=C;
 assert.equal(LOOK_PRESETS.filter(l=>l.character==='male').length,4);assert.equal(LOOK_PRESETS.filter(l=>l.character==='female').length,4);assert.equal(new Set(LOOK_PRESETS.map(l=>l.id)).size,8);
 const base={...DC,skinTone:'espresso',clothing:'sunset',ball:'cosmic',jetpack:'ironman'};
 for(const look of LOOK_PRESETS){
  for(const [key,id] of Object.entries(look.fields))assert.ok(O[key].some(o=>o.id===id),`${look.id} ${key}:${id}`);
  const v=applyLook(base,look.id);assert.equal(v.character,look.character);assert.equal(v.skinTone,'espresso','look keeps skin');assert.equal(v.clothing,'sunset','look keeps kit');assert.equal(v.jetpack,'ironman');
  assert.equal(matchingLook(v).id,look.id);assert.equal(JSON.stringify(S(JSON.parse(JSON.stringify(v)))),JSON.stringify(S(v)));assert.equal(S(v).hair,look.fields.hair);
  assert.equal(v.body,look.fields.build==='wide'?'strong':look.fields.build==='tall'?'slim':'balanced','classic body follows the look build');beanLookFor(v);
 }
 assert.equal(applyLook(base,'nope'),base);assert.equal(matchingLook({...applyLook(base,'sunny'),hair:'long'}),undefined);
 assert.equal(new Set(FACE_STYLES.map(f=>f.eyes+f.mouth)).size,FACE_STYLES.length);
 for(const f of FACE_STYLES){const v=applyFace(base,f.id);assert.equal(v.eyes,f.eyes);assert.equal(v.mouth,f.mouth);assert.equal(v.hair,base.hair);}
 assert.equal(applyFace(base,'nope'),base);
 console.log('PASS simplified builder: 8 ready-made looks (4 male, 4 female) keep skin/kit/gear and match back, 6 face styles');
}
