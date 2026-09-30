const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm');
const path=require('node:path');
// venues.ts now imports the Coral Cay beach court (Sep 29 2026), so the loader resolves relative TypeScript imports.
const cache=new Map();
function load(file){if(cache.has(file))return cache.get(file).exports;const m={exports:{}};cache.set(file,m);
 const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInNewContext(out,{exports:m.exports,module:m,Math,console,require:id=>{if(id.startsWith('.')||id.startsWith('@/')){const base=id.startsWith('@/')?path.resolve(id.slice(2)):path.resolve(path.dirname(file),id);for(const f of [base+'.ts',base+'.tsx',base+'/index.ts',base])if(fs.existsSync(f)&&!fs.statSync(f).isDirectory())return f.endsWith('.json')?JSON.parse(fs.readFileSync(f,'utf8')):load(f);}return require(id);}});
 return m.exports;}
const mod={exports:load(path.resolve('lib/town/venues.ts'))};
const {VENUES,ISLAND_SQUARE,parkingSurfaceHeight,fieldSurfaceHeight,venueEntrance}=mod.exports;
assert.equal(parkingSurfaceHeight(31,45),0,'Ramp joins ground');
assert.equal(parkingSurfaceHeight(31,20),3,'Ramp rises continuously');
assert.equal(parkingSurfaceHeight(31,-5),6,'Ramp joins upper landing');
assert.equal(parkingSurfaceHeight(25,-7),6,'Bridge joins roof');
assert.equal(fieldSurfaceHeight(11,18),6.105,'Field sits on garage roof');
const arrival=venueEntrance(VENUES.find(v=>v.id==='futsal'));
assert.equal(parkingSurfaceHeight(arrival.x,arrival.z),6,'Map arrival lands on roof');
for(const v of VENUES.filter(v=>v.id!=='futsal'))assert.equal(fieldSurfaceHeight(v.x,v.z),.105,'Ground pitches retain their raised surface');
assert.equal(fieldSurfaceHeight(ISLAND_SQUARE.x,ISLAND_SQUARE.z),0,'Central square stays at ground level');
console.log('Terrain: roof, field, arrival, continuous ramp, bridge and ground fields passed.');
