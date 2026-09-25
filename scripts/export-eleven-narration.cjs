// Export every riso story's unchanged script, original timing and cue anchors.
// Track films (futsl, grit, regulate) remain single recordings; chapter films keep separate clips.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const cache=new Map();
class Path2D{constructor(){}moveTo(){}lineTo(){}closePath(){}arc(){}rect(){}ellipse(){}bezierCurveTo(){}quadraticCurveTo(){}addPath(){}}
const sandbox={Math,JSON,Set,Map,Number,String,Array,Object,Float32Array,Float64Array,Uint8Array,Path2D,document:{createElement:()=>({getContext:()=>null,width:0,height:0})},window:{},navigator:{},console};
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;const module={exports:{}};cache.set(file,module);
 if(file.endsWith('.json')){module.exports=JSON.parse(fs.readFileSync(file,'utf8'));return module.exports;}
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,{...sandbox,module,exports:module.exports,require:id=>{if(!id.startsWith('.'))return require(id);const base=path.resolve(path.dirname(file),id);return load([base,`${base}.ts`,`${base}.json`].find(fs.existsSync));}});return module.exports;}
const dir=path.resolve('lib/paths/riso/stories');
const timing=JSON.parse(fs.readFileSync('lib/paths/riso/data/narrationTiming.json','utf8'));
const films=fs.readdirSync(dir).filter(f=>f.endsWith('.ts')).sort().map(f=>load(path.join(dir,f)).story).filter(Boolean)
 .map(({id,format,title,audio,chapters})=>({id,format,title,audio,beats:chapters.map((ch,i)=>({...ch,seconds:audio.mode==='chapters'?(timing[id]?.[i]??ch.seconds):ch.seconds}))}));
fs.writeFileSync(process.argv[2]||'/tmp/futbol-eleven-jobs.json',JSON.stringify(films,null,2));
console.log(`Exported ${films.length} stories, including all three single-track films`);
