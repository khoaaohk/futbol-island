const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path'),T=require('three');
const ROOT=path.resolve(__dirname,'..'),loaded=new Map();
function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:n=>n.startsWith('.')?load(path.resolve(path.dirname(file),n+'.ts')):require(n),console,Math,Map,WeakMap,Set,Float64Array,URLSearchParams});return m.exports;}
const {readIslandReturnPosition,saveIslandReturnPosition,validIslandReturnPosition}=load(path.join(ROOT,'lib/arcade/islandReturnPosition.ts'));
let raw=null;const storage={getItem:()=>raw,setItem:(_,value)=>{raw=value;}};
assert.equal(readIslandReturnPosition(storage),null);
for(const ride of ['walk','scooter','bike','moped','jetpack']){const saved={version:1,x:103.8,z:-48.4,yaw:1.25,ride,flightHeight:37.25,camera:{x:120,y:60,z:-15}};saveIslandReturnPosition(saved,storage);assert.equal(JSON.stringify(readIslandReturnPosition(storage)),JSON.stringify(saved));}
const valid=JSON.parse(raw);
for(const update of [{version:2},{x:NaN},{z:9999},{yaw:Infinity},{ride:'constructor'},{ride:'plane'},{flightHeight:-1},{flightHeight:Infinity},{camera:{x:0,y:NaN,z:0}}])assert.equal(validIslandReturnPosition({...valid,...update}),false);
raw='{';assert.equal(readIslandReturnPosition(storage),null);assert.equal(readIslandReturnPosition({getItem(){throw Error('blocked');}}),null);assert.doesNotThrow(()=>saveIslandReturnPosition(valid,{setItem(){throw Error('blocked');}}));
console.log('ISLAND_RETURN_POSITION_PASS: all five modes, position/facing/altitude/camera, invalid and unavailable storage');
