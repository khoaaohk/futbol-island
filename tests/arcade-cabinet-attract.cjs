const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path'),T=require('three');
const file=path.join(__dirname,'../lib/arcade/arcadeCabinetAttract.ts');let calls=[],current;
const document={createElement(){const ctx=new Proxy({},{set(o,k,v){o[k]=v;return true;},get(o,k){if(k in o)return o[k];return(...args)=>{for(const v of args)if(typeof v==='number')assert(Number.isFinite(v));calls.push([k,...args]);};}});current={width:0,height:0,getContext:()=>ctx};return current;}};
const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:n=>require(n),document,console,Math});
const signatures=new Set();for(const id of ['runner','tennis','pinball','puzzle','live']){calls=[];const a=m.exports.createArcadeCabinetAttract(id);assert.equal(a.frames,1);assert.equal(a.texture.image.width,256);assert.equal(a.texture.image.height,192);signatures.add(JSON.stringify(calls));
 for(let f=0;f<240;f++)a.update(1/60,f/60,true,false);assert.equal(a.frames,33,'only32 draws over4secs at60Hz plus initialization');const frame=a.frames,version=a.texture.version;
 for(let f=0;f<240;f++)a.update(1/60,4+f/60,false,false);assert.equal(a.frames,frame);assert.equal(a.texture.version,version,'hidden does not dirty texture');
 a.update(.1,9,true,true);const still=a.frames;for(let f=0;f<60;f++)a.update(.1,9+f*.1,true,true);assert.equal(a.frames,still,'reduced motion stays frozen');
 a.update(.1,16,true,false);assert.equal(a.frames,still+1);for(let f=0;f<80;f++)a.update(.125,16+f*.125,true,false);const final=a.frames;a.dispose();a.dispose();a.update(1,99,true,false);assert.equal(a.frames,final);assert.equal(a.texture.image.width,1,'canvas backing released');console.log('ARCADE_ATTRACT_PASS',id);}
assert.equal(signatures.size,5,'all five authored previews differ');
