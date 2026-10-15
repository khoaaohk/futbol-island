// Shared loader for tests/summit-kick.cjs and tests/zipline.cjs (Summit Isle activities, Oct 12 2026). Not a test on its own.
// - load(file): a TypeScript module transpiled to CommonJS, relative and '@/…' imports resolved, with per-test overrides.
// - runtime(): lib/graphics/summitActivities.ts on the real three.js (ESM) with browser stubs that COUNT any frame loop or
//   timer it might start, and stubbed wallet/board ports that record what would be paid or requested.
const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const ROOT=path.join(__dirname,'..');
function createLoader(overrides={}){
 const cache=new Map();
 function resolve(from,spec){
  if(spec.startsWith('@/'))spec=path.join(ROOT,spec.slice(2));else if(spec.startsWith('.'))spec=path.resolve(path.dirname(from),spec);else return null;
  for(const ext of ['','.ts','.tsx','/index.ts'])if(fs.existsSync(spec+ext)&&fs.statSync(spec+ext).isFile())return spec+ext;
  throw new Error('cannot resolve '+spec);
 }
 function load(file){
  file=path.resolve(ROOT,file);if(cache.has(file))return cache.get(file).exports;
  const mod={exports:{}};cache.set(file,mod);
  const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file/* .ts files never parse as JSX (generic arrows) */,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  const req=spec=>{
   for(const [k,v] of Object.entries(overrides))if(spec===k||spec.endsWith('/'+k)||spec.endsWith('/'+k+'.ts'))return v;
   const r=resolve(file,spec);return r?load(r):require(spec);
  };
  new Function('require','module','exports','__filename','__dirname',out)(req,mod,mod.exports,file,path.dirname(file));
  return mod.exports;
 }
 return load;
}
/** Browser stubs: localStorage, window events, document (events, a fake canvas), and counters for rAF and timers. */
function browser(){
 const store=new Map(),counts={raf:0,timeout:0,interval:0,events:[]},listeners=new Map();
 const localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),clear:()=>store.clear(),get length(){return store.size;},key:i=>[...store.keys()][i]??null};
 const target=()=>({addEventListener:(t,f)=>{if(!listeners.has(t))listeners.set(t,new Set());listeners.get(t).add(f);},removeEventListener:(t,f)=>listeners.get(t)?.delete(f),dispatchEvent:e=>{counts.events.push(e.type+':'+(typeof e.detail==='string'?e.detail:JSON.stringify(e.detail)));listeners.get(e.type)?.forEach(f=>f(e));return true;}});
 const ctx2d=new Proxy({},{get:(_,k)=>k==='createRadialGradient'?()=>({addColorStop(){}}):()=>{} ,set:()=>true});
 const document={...target(),createElement:()=>({width:0,height:0,getContext:()=>ctx2d}),hidden:false};
 const window={...target(),localStorage};
 class CustomEvent{constructor(type,init){this.type=type;this.detail=init?.detail;}}
 Object.assign(globalThis,{window,document,localStorage,CustomEvent,
  requestAnimationFrame:()=>{counts.raf++;return 0;},cancelAnimationFrame:()=>{},
  navigator:{vibrate:()=>true}});
 const realTimeout=globalThis.setTimeout,realInterval=globalThis.setInterval;
 return {store,counts,localStorage,
  /** Count timers started while `fn` runs (the runtime must start none). */
  async watchTimers(fn){globalThis.setTimeout=(...a)=>{counts.timeout++;return realTimeout(...a);};globalThis.setInterval=(...a)=>{counts.interval++;return realInterval(...a);};
   try{return await fn();}finally{globalThis.setTimeout=realTimeout;globalThis.setInterval=realInterval;}}};
}
/** The 3D runtime on ESM three.js with wallet/board stubs. */
async function runtime(){
 const env=browser();
 const T=await import('three'),BGU=await import('three/examples/jsm/utils/BufferGeometryUtils.js');
 const paid=[],sessions=[];
 const wallet={creditRun:async(id,game,amount,reason)=>{paid.push({kind:'run',id,game,amount,reason});return amount;},creditOnce:async(id,game,amount,reason)=>{if(paid.some(p=>p.id===id))return 0;paid.push({kind:'once',id,game,amount,reason});return amount;}};
 const load=createLoader({'three':T,'three/examples/jsm/utils/BufferGeometryUtils.js':BGU,'arcade/arcadeWallet':wallet,'arcade/boardClient':{beginBoardSession:g=>sessions.push(g)}});
 const mod=load('lib/graphics/summitActivities.ts');
 return {env,T,load,mod,paid,sessions};
}
module.exports={ROOT,createLoader,browser,runtime};
