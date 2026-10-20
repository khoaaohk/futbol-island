const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const loaded=new Map();function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,Map,Set,Uint8Array,Float32Array,JSON,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});loaded.set(file,mod.exports);return mod.exports;}
const {onLand,distanceToLand}=load('lib/town/landmass.ts'),{waterDepthAt,ZONE_SWIM}=load('lib/town/water/waterDepth.ts');
const {EAST_PIER:P,jettyOffset,onEastPier}=load('lib/town/eastPier.ts');
// Oct 19 2026 regression: distanceToLandableDeck used the jetty's bounding rectangle, so open sea beside the Farmers Market
// seawall and inside the spiral read 0 m from land: the kid walked upright at sea. Water there must be deep (swim).
const x0=P.x0,x1=P.cx+P.r0+P.walkHalf,z0=P.cz-P.r0-P.walkHalf,z1=P.z+P.walkHalf;
let checked=0;
for(let x=x0;x<=x1;x+=1)for(let z=z0;z<=z1;z+=1){
 if(onLand(x,z))continue;const off=jettyOffset(x,z)-P.walkHalf;
 if(off>=3&&x>=262){assert.ok(waterDepthAt(x,z)>=ZONE_SWIM,`open sea at ${x},${z} (${off.toFixed(1)} m off the jetty) must be swim depth, got ${waterDepthAt(x,z)}`);checked++;}
 if(off>0)assert.ok(distanceToLand(x,z)>=Math.min(off,distanceToLand(x,z))-1e-9&&distanceToLand(x,z)>0,`water at ${x},${z} must be off the land`);
}
assert.ok(checked>1000,'sampled the open sea around the jetty');
for(const [x,z] of [[252,60],[255,45],[250,75],[270,60],[300,50],[310,60],[318,72],[372,50],[343,92]]){
 assert.ok(!onLand(x,z)&&!onEastPier(x,z),`${x},${z} is open water`);assert.ok(waterDepthAt(x,z)>=ZONE_SWIM||distanceToLand(x,z)>=2.2,`${x},${z} beside the jetty/market is swim water`);
}
// The walkway itself is still ground and its edge still wades.
assert.equal(waterDepthAt(300,98),0);assert.equal(distanceToLand(300,98),0);
assert.ok(Math.abs(distanceToLand(300,98+P.walkHalf+1)-1)<.05&&waterDepthAt(300,98+P.walkHalf+1)>0);
console.log('east-pier-water ok',checked);
