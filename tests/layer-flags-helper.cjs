// Shared by tests/elevation.cjs, tests/town-depth.cjs and tests/surface-edges.cjs (Nov 26 2026: the three ground layers ship ON).
// Loads a town module the way the browser does, with a page query, so each test can assert both halves of the shipping contract:
// the layer is on by default, and `?elev=0` / `?depth=0` / `?surf=0` still switches it off for a before / after.
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
/** A fresh module graph whose `window.location.search` is `search` (null: no window at all, as in node). */
function loaderWithQuery(search){const loaded=new Map(),root=path.resolve(__dirname,'..');
 return function load(file){file=path.resolve(root,file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
   {exports:mod.exports,module:mod,Math,Map,Set,Uint8Array,Float32Array,Float64Array,console,...(search===null?{}:{window:{location:{search}}}),require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});
  loaded.set(file,mod.exports);return mod.exports;};}
/** on(search) for one layer: `file` exports `isOn` (elevationOn / townDepthOn / surfOn). */
const layerOn=(file,isOn,search)=>loaderWithQuery(search)(file)[isOn]();
/** FI_LAYERS_OFF=1: the release check's second run, with the three constants flipped to false by hand to prove the flat island still passes
 *  the whole suite. Only the "ships ON" assertions step aside for it; never set in a normal run. */
const FORCED_OFF=process.env.FI_LAYERS_OFF==='1';
/** The shipping contract of one layer. */
function assertShipsOn(assert,{file,constant,isOn,key,name}){
 const M=loaderWithQuery(null)(file);
 if(FORCED_OFF){assert.equal(M[constant],false,`${name}: FI_LAYERS_OFF=1 expects the constant flipped to false`);assert.equal(layerOn(file,isOn,`?${key}=1`),true,`?${key}=1 switches ${name} on`);assert.equal(layerOn(file,isOn,''),false);return;}
 assert.equal(M[constant],true,`${name} ships ON (the owner approved it on Nov 26 2026)`);assert.equal(M[isOn](),true,`${name}: on with no page query (node, tests)`);
 assert.equal(layerOn(file,isOn,''),true,`${name}: on for a plain page load`);assert.equal(layerOn(file,isOn,'?utm=x&other=1'),true,`${name}: on with unrelated query keys`);
 assert.equal(layerOn(file,isOn,`?${key}=0`),false,`?${key}=0 switches ${name} off`);assert.equal(layerOn(file,isOn,`?a=1&${key}=0&b=2`),false,`&${key}=0 anywhere in the query switches it off`);
 assert.equal(layerOn(file,isOn,`?${key}=1`),true,`?${key}=1 keeps it on`);assert.equal(layerOn(file,isOn,`?${key}=00`),true,`only the exact value 0 switches it off`);
}
module.exports={loaderWithQuery,layerOn,assertShipsOn,FORCED_OFF};
