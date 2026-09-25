const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const loaded=new Map();function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,{module:m,exports:m.exports,require:n=>n.startsWith('.')?(n.endsWith('.json')?require(path.resolve(path.dirname(file),n)):load(path.resolve(path.dirname(file),n+'.ts'))):require(n),console,Math,Map,WeakMap,Set});return m.exports;}
const {POSITION_PLAYERS}=load('lib/town/playerPositions.ts');
const A=JSON.parse(fs.readFileSync('lib/town/playerAppearance.json','utf8'));

const STYLES=['short','buzz','afro','medium','bald','long','curly','dreads','bun','slick','fade','mohawk'],FACIAL=['none','stubble','mustache','beard'],FIELDS=['skin','hair','style','facial','headband','country'];
const names=[...new Set(Object.values(POSITION_PLAYERS).flatMap(r=>[...r.current,...r.allTime]))];
assert(names.length>150,`expected ~196 players, got ${names.length}`);

// Every player has an entry; the only extra keys are the metadata arrays.
for(const n of names)assert(Object.prototype.hasOwnProperty.call(A,n),`missing appearance for ${n}`);
const META=['_uncertain','_countries'];
for(const k of Object.keys(A))assert(names.includes(k)||META.includes(k),`unexpected key ${k}`);

// Every value is in range.
const used=new Set();
for(const n of names){
 const e=A[n];
 assert.deepEqual(Object.keys(e).sort(),[...FIELDS].sort(),`${n} has exactly the schema fields`);
 assert(Number.isInteger(e.skin)&&e.skin>=0&&e.skin<=6,`${n} skin ${e.skin}`);
 assert(Number.isInteger(e.hair)&&e.hair>=0&&e.hair<=8,`${n} hair ${e.hair}`);
 assert(STYLES.includes(e.style),`${n} style ${e.style}`);
 assert(FACIAL.includes(e.facial),`${n} facial ${e.facial}`);
 assert.equal(typeof e.headband,'boolean',`${n} headband`);
 assert(typeof e.country==='string'&&e.country.trim().length>0,`${n} country`);
 used.add(e.country);
}

// Metadata arrays are consistent with the entries.
assert(Array.isArray(A._uncertain),'_uncertain is an array');
for(const n of A._uncertain)assert(names.includes(n),`_uncertain lists unknown player ${n}`);
assert.equal(new Set(A._uncertain).size,A._uncertain.length,'_uncertain has no duplicates');
assert(Array.isArray(A._countries),'_countries is an array');
assert.deepEqual([...A._countries].sort(),[...used].sort(),'_countries lists exactly the countries used');

console.log('PLAYER_APPEARANCE_PASS',names.length,'players',A._uncertain.length,'uncertain',used.size,'countries');
