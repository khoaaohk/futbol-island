// Loads the real island world (lib/town/world.ts buildTown) in Node, the same way tests/field-light-collisions.cjs does, plus the
// colliders Town.tsx adds at runtime (vending machines, fishing kiosks) and the rooftop/stair surface model (rooftopTravel.ts).
// Used by scripts/audit-island-connectivity.cjs and tests/island-connectivity.cjs. No browser, no WebGL.
const fs=require('fs'),vm=require('vm'),path=require('path'),ts=require('typescript');
async function loadIslandWorld(base=process.cwd()){
 const T=require(path.join(base,'node_modules/three'));
 const utils=await import(path.join(base,'node_modules/three/examples/jsm/utils/BufferGeometryUtils.js'));
 const cache=new Map(),gradient={addColorStop(){}};
 const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient,getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(Math.max(1,w*h*4))}),createImageData:(w,h)=>({data:new Uint8ClampedArray(Math.max(1,w*h*4))})},{get:(o,k)=>o[k]??(()=>{})});
 const storage={getItem:()=>null,setItem(){},removeItem(){}};
 const sandbox={console:{log(){},warn(){},error:console.error,info(){}},Math,performance,Float32Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,Uint8ClampedArray,Float64Array,Map,Set,WeakMap,Date,JSON,Array,Object,Promise,
  window:{matchMedia:()=>({matches:false}),location:{search:''},localStorage:storage,addEventListener(){},devicePixelRatio:1},localStorage:storage,navigator:{userAgent:'node'},
  document:{createElement:()=>({width:0,height:0,getContext:()=>ctx,style:{}}),addEventListener(){},dispatchEvent(){}},setTimeout,clearTimeout,queueMicrotask,process:{env:{}}};
 function resolve(from,id){const p=id.startsWith('@/')?path.join(base,id.slice(2)):path.resolve(path.dirname(from),id);for(const c of [p+'.ts',p+'.tsx',path.join(p,'index.ts'),p])if(fs.existsSync(c)&&fs.statSync(c).isFile())return c;throw new Error('cannot resolve '+id+' from '+from);}
 function load(file){if(cache.has(file))return cache.get(file).exports;const m={exports:{}};cache.set(file,m);
  if(file.endsWith('.json')){m.exports=JSON.parse(fs.readFileSync(file,'utf8'));return m.exports;}
  const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React}}).outputText;
  vm.runInNewContext(out,{...sandbox,module:m,exports:m.exports,require:id=>id==='three'?T:id.includes('BufferGeometryUtils')?utils:(id.startsWith('.')||id.startsWith('@/'))?load(resolve(file,id)):require(require.resolve(id,{paths:[base]}))});
  return m.exports;}
 const L=rel=>load(path.join(base,rel));
 const worldMod=L('lib/town/world.ts'),sim=L('lib/town/simulation.ts'),venues=L('lib/town/venues.ts');
 const world=worldMod.buildTown(new T.Scene());
 const extra=[];
 try{const v=L('lib/graphics/vendingMachines.ts').createVendingMachines(new T.Scene(),{coins:()=>0});extra.push(...v.obstacles);}catch(e){console.error('vending colliders not loaded:',e.message);}
 try{extra.push(...L('lib/town/fishing/fishingWorld.ts').fishingKioskObstacles());}catch(e){console.error('fishing kiosk colliders not loaded:',e.message);}
 const obstacles=[...world.obstacles,...extra];
 return {T,L,world,sim,venues,obstacles,extraObstacles:extra};
}
module.exports={loadIslandWorld};
