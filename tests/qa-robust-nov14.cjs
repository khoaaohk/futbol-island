// QA robust pass (Nov 14 2026): blocked storage, save-code restore on a host error. node tests/qa-robust-nov14.cjs
const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
/** A TypeScript module and its relative imports in one vm context with the given globals. */
function loader(globals){
 const ctx=vm.createContext({console,Math,Date,JSON,Promise,Object,Array,Number,String,Boolean,Symbol,Error,TypeError,RegExp,Set,Map,WeakMap,
  Uint8Array,ArrayBuffer,TextEncoder,TextDecoder,URL,URLSearchParams,setTimeout,clearTimeout,queueMicrotask,structuredClone,...globals});
 ctx.globalThis=ctx;const cache=new Map();
 const resolve=(from,id)=>{const b=id.startsWith('@/')?path.join(ROOT,id.slice(2)):path.resolve(path.dirname(from),id);for(const f of [b,b+'.ts',b+'.tsx',path.join(b,'index.ts')])if(fs.existsSync(f)&&fs.statSync(f).isFile())return f;throw Error('resolve '+id);};
 const load=file=>{if(cache.has(file))return cache.get(file).exports;if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));const mod={exports:{}};cache.set(file,mod);
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
  vm.runInContext('(function(exports,module,require){'+code+'\n})',ctx)(mod.exports,mod,id=>id.startsWith('.')||id.startsWith('@/')?load(resolve(file,id)):require(id));return mod.exports;};
 return {ctx,load:rel=>load(path.join(ROOT,rel))};
}
const mem=()=>{const d=new Map();return {getItem:k=>d.has(k)?d.get(k):null,setItem:(k,v)=>d.set(k,String(v)),removeItem:k=>d.delete(k),key:i=>[...d.keys()][i]??null,get length(){return d.size;},_d:d};};

(async()=>{
 // 1. Blocked storage: reading window.localStorage throws (Safari "Block All Cookies"). The pre-paint script swaps in memory.
 const {STORAGE_FALLBACK_BOOT}=loader({}).load('lib/storageFallback.ts');
 {const win={};for(const n of ['localStorage','sessionStorage'])Object.defineProperty(win,n,{configurable:true,enumerable:true,get(){throw Object.assign(new Error('denied'),{name:'SecurityError'});}});
  const ctx=vm.createContext(win);ctx.window=ctx;vm.runInContext(STORAGE_FALLBACK_BOOT,ctx);
  const ls=vm.runInContext('localStorage',ctx);assert.equal(typeof ls.getItem,'function','a store is in place');
  assert.equal(vm.runInContext("typeof localStorage!=='undefined'",ctx),true,'typeof no longer throws');
  ls.setItem('fi2-x-v1',5);assert.equal(ls.getItem('fi2-x-v1'),'5');assert.equal(ls.length,1);assert.equal(ls.key(0),'fi2-x-v1');assert.equal(ls.key(1),null);
  ls.removeItem('fi2-x-v1');assert.equal(ls.getItem('fi2-x-v1'),null);ls.setItem('a','1');ls.clear();assert.equal(ls.length,0);
  assert.equal(ls.getItem('__proto__'),null,'no prototype leaks');
  assert.notEqual(vm.runInContext('sessionStorage',ctx),ls,'two separate stores');assert.equal(ctx.__fiMemoryStorage,true);}
 // Working storage (and one that only refuses writes, a full disk) is left alone.
 {const real=mem(),ctx=vm.createContext({localStorage:real,sessionStorage:{getItem(){return null;},setItem(){throw Error('QuotaExceededError');}}});ctx.window=ctx;
  vm.runInContext(STORAGE_FALLBACK_BOOT,ctx);assert.equal(vm.runInContext('localStorage',ctx),real,'working storage untouched');assert.equal(ctx.__fiMemoryStorage,undefined);}
 const layout=read('app/layout.tsx');
 assert.match(layout,/<body><script dangerouslySetInnerHTML=\{\{ __html: STORAGE_FALLBACK_BOOT \}\}\/>\{children\}/,'the fallback runs first in <body>, before any game chunk');

 // 2. Restore: a host error (502/504/500, a 429 from the edge, a non-JSON page) is "can't reach", never a wrong try.
 for(const [status,body,want] of [[502,'<html>Bad gateway</html>','offline'],[504,'',  'offline'],[500,'{}','offline'],[429,'{"ok":false}','offline'],[503,'{"ok":false,"unavailable":true}','unavailable'],[200,'{"ok":false}','wrong']]){
  const ls=mem();
  const fetch=async()=>({status,json:async()=>JSON.parse(body)});
  const {load}=loader({localStorage:ls,fetch,window:{dispatchEvent(){},addEventListener(){}},Event:class{constructor(t){this.type=t;}}});
  const C=load('lib/saves/client.ts');
  const r=await C.restoreSave('striker-volley-corner-4271');
  assert.equal(r.reason,want,`HTTP ${status} → ${want}`);
  const tries=JSON.parse(ls.getItem('fi2-save-tries-v1')||'[]');
  assert.equal(tries.length,want==='wrong'?1:0,`HTTP ${status}: ${want==='wrong'?'one':'no'} wrong try counted`);
 }
 // Three host errors in a row never send a kid with the right code to "Ask a grown-up".
 {const ls=mem(),{load}=loader({localStorage:ls,fetch:async()=>({status:502,json:async()=>{throw Error('html');}}),window:{dispatchEvent(){}},Event:class{}});
  const C=load('lib/saves/client.ts');for(let i=0;i<4;i++)assert.equal((await C.restoreSave('striker-volley-corner-4271')).reason,'offline');
  assert.equal(C.restoreGate().kind,'ok','still allowed to try');}

 // 3. Lazy parts and a dropped connection. retryGate: one try, then a pause after a failure; `online` opens it at once.
 {let t=0;const listeners={};const win={addEventListener:(n,f)=>{(listeners[n]??=[]).push(f);}};
  const {load}=loader({window:win});const G=load('lib/retryGate.ts').retryGate(5000,()=>t);
  assert.equal(G.ready(),true);G.fail();assert.equal(G.ready(),false,'held after a failure');t=4999;assert.equal(G.ready(),false);t=5000;assert.equal(G.ready(),true,'tries again after 5 s');
  G.fail();assert.equal(G.ready(),false);listeners.online.forEach(f=>f());assert.equal(G.ready(),true,'back online: at once');}
 for(const [f,needle] of [['lib/town/fishing/fishingWorld.ts',"if(!visualsLoading&&!visualsRetry.ready())return Promise.resolve();"],['lib/town/water/diveRuntime.ts',"if(roomModule||(!roomLoading&&!roomRetry.ready()))return Promise.resolve();"],['lib/town/stadiumSit.ts',"dc<SPONSOR_LOAD_RADIUS&&sponsorRetry.ready()"]])
  assert(read(f).includes(needle),'per-frame lazy load is paced: '+f);
 // retryImport: offline, a failed download waits for `online` and tries again; online, once more after a pause; then it rejects.
 {const listeners={};const nav={onLine:false};const win={addEventListener:(n,f)=>{(listeners[n]??=[]).push(f);}};
  const timers=[];const {load}=loader({window:win,navigator:nav,setTimeout:(f,ms)=>{timers.push([f,ms]);}});const {retryImport}=load('lib/retryImport.ts');
  let calls=0;const p=retryImport(()=>++calls===1?Promise.reject(Object.assign(new Error('Loading chunk 1 failed.'),{name:'ChunkLoadError'})):Promise.resolve('panel'));
  await new Promise(r=>setImmediate(r));assert.equal(calls,1);assert.equal(listeners.online.length,1,'waits for online');assert.equal(timers.length,0,'no timer while offline');
  nav.onLine=true;listeners.online[0]();assert.equal(await p,'panel');assert.equal(calls,2);
  let c2=0;const q=retryImport(()=>{c2++;return Promise.reject(new Error('Loading CSS chunk 9 failed.'));});
  await new Promise(r=>setImmediate(r));assert.equal(timers.length,1);assert.equal(timers[0][1],1500);timers[0][0]();
  await assert.rejects(q,/CSS chunk/);assert.equal(c2,2,'one retry, then the error screen as before');}
 const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):/\.tsx?$/.test(e.name)?[path.join(d,e.name)]:[]);
 const lazy=['components','app'].flatMap(d=>walk(path.join(ROOT,d))).map(f=>[f,fs.readFileSync(f,'utf8')]).filter(([,s])=>s.includes("from 'next/dynamic'"));
 assert(lazy.length>=30,'found the lazy parts');
 for(const [f,s] of lazy){assert(!/(dynamic|dynamicImport)\(\(\)\s*=>\s*import\(/.test(s),'every lazy part retries its download: '+path.relative(ROOT,f));}
 // 4. Owner defaults (robust pass 2): offline waits are counted for the "Waiting for internet…" note; blocked storage gets one note.
 {const listeners={};const nav={onLine:false};const win={addEventListener:(n,f)=>{(listeners[n]??=[]).push(f);}};
  const {load}=loader({window:win,navigator:nav});const R=load('lib/retryImport.ts');
  let seen=[];const off=R.subscribeNetWait(()=>seen.push(R.netWaitCount()));
  let a=0,b=0;const pa=R.retryImport(()=>++a===1?Promise.reject(Error('chunk')):Promise.resolve('A'));const pb=R.retryImport(()=>++b===1?Promise.reject(Error('chunk')):Promise.resolve('B'));
  await new Promise(r=>setImmediate(r));assert.equal(R.netWaitCount(),2,'two panels waiting');assert.deepEqual(seen,[1,2]);
  nav.onLine=true;listeners.online.forEach(f=>f());assert.equal(R.netWaitCount(),0,'back online: nothing waits');assert.deepEqual([await pa,await pb],['A','B']);
  off();R.retryImport(()=>Promise.reject(Error('x'))).catch(()=>{});assert.equal(seen.length,4,'unsubscribed');}
 {const blocked={};for(const n of ['localStorage','sessionStorage'])Object.defineProperty(blocked,n,{configurable:true,enumerable:true,get(){throw Error('denied');}});
  const ctx=vm.createContext(blocked);ctx.window=ctx;vm.runInContext(STORAGE_FALLBACK_BOOT,ctx);assert.equal(ctx.__fiNoSave,true,'blocked localStorage is flagged');
  const half=vm.createContext({localStorage:mem()});Object.defineProperty(half,'sessionStorage',{get(){throw Error('denied');}});half.window=half;vm.runInContext(STORAGE_FALLBACK_BOOT,half);
  assert.equal(half.__fiNoSave,undefined,'only sessionStorage blocked: saving still works, no note');}
 {const src=read('components/NetSaveNotice.tsx');
  assert(src.includes(`NO_SAVE_TEXT="This browser can't save your island. Ask a grown-up, or use your save code."`),'owner copy');
  assert(src.includes("NET_WAIT_TITLE='Waiting for internet…'"));
  const fn=src.slice(src.indexOf('export const GAME_PATH'),src.indexOf('function markNoSaveSeen'));
  const js=ts.transpileModule(fn,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  const m={exports:{}};new Function('exports','module','NO_SAVE_SEEN_KEY',js+';module.exports.reset=()=>{noSaveShown=true};')(m.exports,m,'fi2-no-save-note-v1');
  const {wantsNoSaveNote}=m.exports;const ss=mem();
  assert.equal(wantsNoSaveNote({__fiNoSave:true,sessionStorage:ss},'/play'),true,'shows on the game');
  assert.equal(wantsNoSaveNote({__fiNoSave:true,sessionStorage:ss},'/'),false,'never on the tour site');
  assert.equal(wantsNoSaveNote({__fiNoSave:true,sessionStorage:ss},'/admin'),false);
  assert.equal(wantsNoSaveNote({sessionStorage:ss},'/play'),false,'storage works: no note');
  ss.setItem('fi2-no-save-note-v1','1');assert.equal(wantsNoSaveNote({__fiNoSave:true,sessionStorage:ss},'/arcade'),false,'once per visit');
  assert.match(read('app/layout.tsx'),/\{children\}<NetSaveNotice\/>/,'mounted on every page');
  assert.match(read('components/NetSaveNotice.module.css'),/max-width:min\(380px,100%\)/,'phone-safe width');}
 console.log('qa-robust-nov14: ok');
})().catch(e=>{console.error(e);process.exit(1);});
