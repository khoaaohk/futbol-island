// Random starter look (Oct 23 2026): new players roll a random free Male/Female look once; saves stay untouched.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),cache=new Map(),storage=new Map();
function load(file){if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,console,localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):req(id)});return mod.exports;}
const C=load(base+'/lib/town/customization.ts'),KEY='futbol-island-customization-v1';
// mulberry32: a small seeded rng so every roll is reproducible.
const seeded=seed=>()=>{seed=(seed+0x6D2B79F5)>>>0;let t=seed;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};
const free=key=>C.CUSTOMIZATION_OPTIONS[key].filter(o=>o.unlock===undefined&&!o.coinReward&&!o.graduate&&!o.equipment).map(o=>o.id);

// 1. Only free options; character is Male/Female; kit follows selectCharacter; result is already sanitised.
const seen={character:new Set()};for(const k of C.BEAN_KEYS)seen[k]=new Set();
for(let s=1;s<=600;s++){const look=C.randomCustomization(seeded(s));
 assert.ok(['male','female'].includes(look.character),'male/female only');seen.character.add(look.character);
 for(const k of C.BEAN_KEYS){assert.ok(free(k).includes(look[k]),`${k}=${look[k]} is free`);seen[k].add(look[k]);}
 assert.equal(look.clothing,look.character==='female'?'coast':'classic','kit follows selectCharacter');
 for(const k of ['costume','ball','scooter','bike','moped','jetpack'])assert.equal(look[k],C.DEFAULT_CUSTOMIZATION[k],k+' stays default');
 assert.deepEqual(C.sanitizeCustomization(JSON.parse(JSON.stringify(look))),look,'rolled look survives sanitise');}
assert.deepEqual([...seen.character].sort(),['female','male'],'both characters occur');
for(const k of C.BEAN_KEYS)assert.equal(seen[k].size,free(k).length,k+': every free option rolls');
assert.ok(!seen.headwearColor.has('grad-cap')&&[...seen.headwearColor].every(id=>!C.CUSTOMIZATION_OPTIONS.headwearColor.find(o=>o.id===id).graduate),'no graduation caps');

// 2. Deterministic with an injected rng; gear/costume come from the base.
assert.deepEqual(C.randomCustomization(seeded(42)),C.randomCustomization(seeded(42)));
assert.notDeepEqual(C.randomCustomization(seeded(1)),C.randomCustomization(seeded(2)));
const geared={...C.DEFAULT_CUSTOMIZATION,ball:'cosmic',scooter:'stunt'};const reroll=C.randomCustomization(seeded(7),geared);
assert.equal(reroll.ball,'cosmic');assert.equal(reroll.scooter,'stunt');
// Picking Male/Female after a roll still uses selectCharacter (keeps skin tone + build).
const flipped=C.selectCharacter(reroll,reroll.character==='male'?'female':'male');
assert.equal(flipped.skinTone,reroll.skinTone);assert.equal(flipped.build,reroll.build);

// 3. New player: loadCustomization rolls once, saves it, and returns the same look on reload.
storage.clear();const first=C.loadCustomization();assert.ok(storage.has(KEY),'rolled look saved');
assert.deepEqual(C.loadCustomization(),first,'stable on reload');assert.deepEqual(C.loadCustomization(),first);

// 4. Existing saves are byte-for-byte unchanged (load equals sanitise of the saved value, storage untouched).
const saves=[{...C.DEFAULT_CUSTOMIZATION},{...C.DEFAULT_CUSTOMIZATION,character:'female',hair:'bun',skinTone:'cocoa'},{character:'captain',face:'deep',body:'slim'},{character:'female'},{}];
for(const save of saves){const raw=JSON.stringify(save);storage.clear();storage.set(KEY,raw);
 const loaded=C.loadCustomization();assert.deepEqual(loaded,C.sanitizeCustomization(JSON.parse(raw)));assert.equal(storage.get(KEY),raw,'save not rewritten');}
storage.clear();storage.set(KEY,JSON.stringify(C.DEFAULT_CUSTOMIZATION));assert.deepEqual(C.loadCustomization(),C.DEFAULT_CUSTOMIZATION,'default save stays default');

// 5. Shuffle button is wired into onboarding and the customizer.
const onboarding=fs.readFileSync(base+'/components/IslandOnboarding.tsx','utf8'),customizer=fs.readFileSync(base+'/components/CharacterCustomizer.tsx','utf8');
for(const src of [onboarding,customizer])assert.match(src,/<ShuffleButton[^\n]{0,120}randomCustomization\(Math\.random,value\)/);
assert.match(onboarding,/onChange\(selectCharacter\(value,character\)\)/,'toggle still uses selectCharacter');
console.log('PASS random starter look: free options only, both characters, seeded, saved once, old saves unchanged');
