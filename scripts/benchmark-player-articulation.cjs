const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path'),T=require('three');
const loaded=new Map();function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:n=>n.startsWith('.')?load(path.resolve(path.dirname(file),n+'.ts')):require(n),console,Math,Map,WeakMap,Set});return m.exports;}
const {createPlayer,ROLE_PROFILES}=load('lib/graphics/player.ts');
const joint=(r,n)=>r.root.getObjectByName(n),world=(r,n)=>joint(r,n).getWorldPosition(new T.Vector3());
// Whole-body forward pitch: the pelvis carries part of the lean, the torso the rest.
const pitch=r=>joint(r,'player-pelvis').rotation.x+joint(r,'armor-torso').rotation.x;
const finite=r=>{r.root.updateMatrixWorld(true);r.root.traverse(o=>{for(const v of[...o.position,...o.quaternion,...o.scale,...o.matrixWorld.elements])assert(Number.isFinite(v),'finite transform '+o.name);});};


const rigs=Array.from({length:22},(_,i)=>createPlayer('bench'+i,'home',false));const samples=[];
for(let f=0;f<360;f++){const start=performance.now();for(let i=0;i<22;i++)rigs[i].update(i*.8,-f/30,1/60,f/60,false,{facing:0,backpedal:1,jockey:.8});if(f>60)samples.push(performance.now()-start);}
samples.sort((a,b)=>a-b);console.log('22_RIG_CPU_MS',{median:samples[Math.floor(samples.length*.5)],p95:samples[Math.floor(samples.length*.95)]});rigs.forEach(r=>r.dispose());
