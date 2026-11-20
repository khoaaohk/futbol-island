// Site health pass (Nov 20 2026): new-release recovery (lib/buildUpdate.ts, lib/retryImport.ts) and beacon grouping
// (lib/siteReports.ts, components/ErrorBeacon.tsx). node tests/site-health-nov20.cjs
const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
function loader(globals){
 const ctx=vm.createContext({console,Math,Date,JSON,Promise,Object,Array,Number,String,Boolean,Symbol,Error,TypeError,RegExp,Set,Map,URL,setTimeout,clearTimeout,process:{env:{NEXT_PUBLIC_BUILD_ID:'old'}},...globals});
 ctx.globalThis=ctx;const cache=new Map();
 const resolve=(from,id)=>{const b=id.startsWith('@/')?path.join(ROOT,id.slice(2)):path.resolve(path.dirname(from),id);for(const f of [b,b+'.ts',b+'.tsx'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return f;throw Error('resolve '+id);};
 const load=file=>{if(cache.has(file))return cache.get(file).exports;const mod={exports:{}};cache.set(file,mod);
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,jsx:ts.JsxEmit.React}}).outputText;
  vm.runInContext('(function(exports,module,require){'+code+'\n})',ctx)(mod.exports,mod,id=>id.startsWith('.')||id.startsWith('@/')?load(resolve(file,id)):require(id));return mod.exports;};
 return {ctx,load:rel=>load(path.join(ROOT,rel))};
}
const mem=()=>{const d=new Map();return {getItem:k=>d.has(k)?d.get(k):null,setItem:(k,v)=>d.set(k,String(v)),_d:d};};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

(async()=>{
 const B=loader({}).load('lib/buildUpdate.ts');
 // 1. Chunk errors (JS, CSS, ES module) are recognised; ordinary errors are not.
 assert.ok(B.isChunkLoadError(Object.assign(new Error('Loading chunk 4521 failed.\n(error: https://x/_next/static/chunks/4521-ab.js)'),{name:'ChunkLoadError'})));
 assert.ok(B.isChunkLoadError(Object.assign(new Error('Loading CSS chunk 77 failed.'),{code:'CSS_CHUNK_LOAD_FAILED'})));
 assert.ok(B.isChunkLoadError(new TypeError('Failed to fetch dynamically imported module: /x.js')));
 assert.ok(!B.isChunkLoadError(new Error('x is undefined'))&&!B.isChunkLoadError(null)&&!B.isChunkLoadError('Loading chunk 1 failed'));

 // 2. The watch: throttled checks, safe-moment reload, one reload per build id.
 const env=o=>{const e={t:0,live:'new',isHidden:false,touched:true,store:mem(),reloads:0,fetches:0,...o};
  return Object.assign(e,{now:()=>e.t,fetchId:async()=>{e.fetches++;return e.live;},hidden:()=>e.isHidden,started:()=>e.touched,session:()=>e.store,reload:()=>{e.reloads++;}});};
 {const e=env({live:'old'}),w=B.createUpdateWatch('old',e);
  assert.equal(await w.check(),false);assert.equal(e.fetches,1);
  e.t=60_000;assert.equal(await w.check(),false);assert.equal(e.fetches,1,'no second plain check inside 5 min');
  assert.equal(await w.check(true),false);assert.equal(e.fetches,2,'a chunk failure checks at once');
  e.t+=5_000;await w.check(true);assert.equal(e.fetches,2,'forced checks are throttled too');
  e.t+=B.CHECK_MIN_MS;e.live='new';let n=0;w.subscribe(()=>n++);
  assert.equal(await w.check(),true);assert.equal(n,1);assert.equal(e.reloads,0,'mid-play: prompt, no reload');
  assert.equal(await w.check(),true);assert.equal(e.fetches,3,'ready stays ready without asking again');
  e.isHidden=true;assert.equal(w.tryAutoReload(),true);assert.equal(e.reloads,1,'hidden tab reloads');
  assert.equal(w.tryAutoReload(),false);assert.equal(e.reloads,1,'only once per build id (loop guard)');}
 {const e=env({touched:false}),w=B.createUpdateWatch('old',e);assert.equal(await w.check(),true);assert.equal(e.reloads,1,'untouched page reloads at once');}
 {const e=env({touched:false,store:null}),w=B.createUpdateWatch('old',e);await w.check();assert.equal(e.reloads,0,'no sessionStorage: never auto reload');}
 {const e=env({touched:false}),w=B.createUpdateWatch('old',e);e.store.setItem(B.RELOAD_KEY,'new');await w.check();assert.equal(e.reloads,0,'already reloaded for this id');assert.equal(w.ready(),true);}
 {const e=env({live:null}),w=B.createUpdateWatch('old',e);assert.equal(await w.check(),false,'offline / bad answer: no update');}
 {const e=env(),w=B.createUpdateWatch('',e);assert.equal(await w.check(),false);assert.equal(e.fetches,0,'no own id: never checks');}
 assert.match(B.UPDATE_TITLE+' '+B.UPDATE_TEXT,/^New update ready\. Tap to refresh\.$/);
 assert.ok(B.CHECK_MIN_MS>=5*60_000,'no polling faster than every 5 minutes');

 // 3. retryImport: second chunk failure with a newer release waits (prompt), without one it still rejects.
 for(const live of ['new','old']){
  const L=loader({window:{location:{reload(){}},addEventListener(){},sessionStorage:mem()},document:{visibilityState:'visible'},navigator:{onLine:true},
   fetch:async()=>({ok:true,json:async()=>({id:live})})});
  const {retryImport}=L.load('lib/retryImport.ts');
  const err=Object.assign(new Error('Loading chunk 9 failed.'),{name:'ChunkLoadError'});let calls=0;
  const p=retryImport(()=>{calls++;return Promise.reject(err);},5);let state='pending';p.then(()=>state='ok',()=>state='rejected');
  await sleep(40);assert.equal(calls,2,'retried once');
  assert.equal(state,live==='new'?'pending':'rejected',live==='new'?'newer release: part stays closed, no error screen':'no release: rejects as before');}
 {const L=loader({window:{addEventListener(){}},navigator:{onLine:true},fetch:async()=>{throw Error('no');}});const {retryImport}=L.load('lib/retryImport.ts');
  let n=0;assert.equal(await retryImport(()=>++n===1?Promise.reject(new Error('Loading chunk 1 failed.')):Promise.resolve('ok'),5),'ok','a blip still recovers');}

 // 4. Beacon grouping: one row across releases; ResizeObserver noise dropped; real errors kept.
 const R=loader({}).load('lib/siteReports.ts');
 const rep=(m,f)=>R.parseErrorReport(JSON.stringify({m,f,l:1,r:'/play'}),'futbolisland.app');
 const a=rep('Loading chunk 4521 failed.','https://futbolisland.app/_next/static/chunks/webpack-f594e6ea7bfaa967.js');
 const b=rep('Loading chunk 77 failed.','https://futbolisland.app/_next/static/chunks/webpack-3c5e4b25f337b26b.js');
 assert.equal(a.key,b.key,'same error on two releases is one row');assert.equal(a.label,'Loading chunk N failed. @ chunks/webpack-H.js:1');
 assert.notEqual(rep('Loading CSS chunk 1 failed.','https://futbolisland.app/_next/static/chunks/webpack-3c5e4b25f337b26b.js').key,a.key,'CSS is its own row');
 assert.equal(rep('ResizeObserver loop completed with undelivered notifications.','https://futbolisland.app/play'),null);
 assert.equal(rep('ResizeObserver loop limit exceeded',''),null);
 assert.ok(rep('TypeError: ResizeObserver is not a constructor',''),'a real ResizeObserver error is kept');
 assert.equal(rep('x','https://futbolisland.app/_next/static/chunks/app/play/page-5e89def337b65ca2.js').label,'x @ chunks/app/play/page-H.js:1');

 // 5. Non-Error rejections get a short, data-free name.
 const E=loader({}).load('components/ErrorBeacon.tsx');
 assert.equal(E.rejectionText(undefined),'unhandled rejection: undefined');assert.equal(E.rejectionText(null),'unhandled rejection: null');
 assert.equal(E.rejectionText(42),'unhandled rejection: number');
 class Event{constructor(){this.type='error';this.target={tagName:'SCRIPT',src:'https://secret/x?token=1'};}}
 assert.equal(E.rejectionText(new Event()),'unhandled rejection: Event error on SCRIPT','no URL from the target');
 assert.equal(E.rejectionText({message:'Request failed',code:'x'}),'Object: Request failed');
 assert.equal(E.rejectionText(new Error('boom')),'boom');
 assert.ok(E.BENIGN_ERROR.test('ResizeObserver loop completed with undelivered notifications.'));
 const notice=read('components/NetSaveNotice.tsx');assert.match(notice,/data-update-ready/);assert.doesNotMatch(read('lib/buildUpdate.ts'),/setInterval|requestAnimationFrame/);
 console.log('site-health-nov20: ok');
})().catch(e=>{console.error(e);process.exit(1);});
