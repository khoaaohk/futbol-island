#!/usr/bin/env node
// The admin SEO tab (Nov 15 2026): data/seo/snapshot.json + lib/seo/snapshotSchema.mjs + lib/seo/snapshot.ts + app/admin/SeoSection.tsx.
//  1. schema: the committed seed passes scripts/seo-snapshot.mjs; broken files fail it (exit 1 / 2) with readable errors;
//  2. the tab renders the seed's headline numbers, the "As of" line, the summary, quick-win badges, indexing, sitemaps, work log;
//  3. empty state: a missing or malformed snapshot shows a friendly message (and our Search arrivals still render);
//  4. admin-only: the snapshot is read on the server after the session check and never shipped by a client file or an API route.
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript'),os=require('os'),{spawnSync}=require('child_process');
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
const read=f=>fs.readFileSync(f,'utf8');
const loaded=new Map(),cssProxy=new Proxy({},{get:(_,k)=>k==='__esModule'?false:String(k)});
function resolve(from,id){const base=id.startsWith('@/')?path.join(ROOT,id.slice(2)):path.resolve(path.dirname(from),id);
 for(const f of [base,base+'.ts',base+'.tsx',base+'.mjs',base+'.json'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return f;throw Error('cannot resolve '+id+' from '+from);}
function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);
 if(file.endsWith('.css')){loaded.set(file,{default:cssProxy});return loaded.get(file);}
 const m={exports:{}};loaded.set(file,m.exports);
 const out=ts.transpileModule(read(file),{fileName:file.replace(/\.mjs$/,'.ts'),compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 vm.runInNewContext(out,{module:m,exports:m.exports,URL,Date,Math,JSON,Promise,Intl,process:{env:{},cwd:()=>ROOT},console,setTimeout,clearTimeout,
  require:id=>{if(id.endsWith('.css'))return {__esModule:true,default:cssProxy};if(id==='next/navigation')return {useRouter:()=>({push(){},refresh(){}})};
   return id.startsWith('.')||id.startsWith('@/')?load(resolve(file,id)):require(id);}});
 loaded.set(file,m.exports);return m.exports;}
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const SNAP='data/seo/snapshot.json',seed=JSON.parse(read(SNAP));
const L=load('lib/seo/snapshot.ts'),SeoSection=load('app/admin/SeoSection.tsx').default;
const cli=(...a)=>spawnSync(process.execPath,['scripts/seo-snapshot.mjs',...a],{encoding:'utf8'});
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'seo-snap-'));
const writeTmp=(name,x)=>{const f=path.join(tmp,name);fs.writeFileSync(f,typeof x==='string'?x:JSON.stringify(x));return f;};
const clone=()=>JSON.parse(JSON.stringify(seed));
const noSearch={search:null};
const render=(seo,report=noSearch)=>renderToStaticMarkup(React.createElement(SeoSection,{seo,report,rangeText:'Nov 15',dayLabel:k=>k}));
const text=html=>html.replace(/<[^>]+>/g,' ').replace(/&#x27;|&#39;/g,"'").replace(/&amp;/g,'&').replace(/\s+/g,' ');
let n=0;const ok=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};

// 1. schema ---------------------------------------------------------------------------------------------------------------------
ok('the committed seed passes the CLI and the app validator',()=>{
 const r=cli();assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/seo-snapshot: OK/);
 assert.equal(L.validateSnapshot(seed).errors.length,0);
 assert.equal(cli('--quiet').stdout,'');
});
ok('the seed carries the Nov 15 Search Console numbers',()=>{
 assert.deepEqual([seed.asOf,seed.gscDataThrough],['2026-11-15','2026-11-13']);
 const w=seed.windows.d28;assert.deepEqual([w.clicks,w.impressions,w.ctr,w.position],[25,535,0.047,28.3]);
 assert.deepEqual([seed.index.indexed,seed.index.reasons.map(r=>r.pages)],[314,[575,37,5]]);
 assert.equal(seed.index.reasons[2].validation,'Started 2026-11-15');
 assert.deepEqual(seed.sitemaps.map(s=>[s.path,s.lastRead,s.status,s.discovered]),[['/sitemap.xml','2026-11-13','Success',916],['/sitemap-images.xml','2026-11-12','Success',788]]);
 assert.deepEqual(seed.history.map(h=>[h.day,h.clicks,h.impressions,h.position]),[['2026-11-14',15,108,11.1],['2026-11-15',25,535,28.3]]);
 assert(seed.workLog.length>=6&&seed.workLog.length<=30,'work log within 30');
});
ok('broken snapshots fail with readable errors',()=>{
 const bad=[
  [s=>{delete s.asOf;},/asOf/],[s=>{s.windows.d28.ctr=4.7;},/ctr: a fraction/],[s=>{s.windows.d28.clicks=999;},/more clicks than impressions/],
  [s=>{s.topPages[0].path='learn';},/path starting with/],[s=>{s.history.reverse();},/oldest first/],
  [s=>{s.workLog=Array.from({length:31},(_,i)=>({day:`2026-12-${String(i+1).padStart(2,'0')}`,requested:[],alreadyIndexed:0}));},/last 30/],
  [s=>{s.index.reasons[0].pages=-1;},/pages/],[s=>{s.schemaVersion=2;},/schemaVersion/],[s=>{s.gscDataThrough='2026-11-16';},/after asOf/]];
 for(const [mut,re] of bad){const s=clone();mut(s);const {errors}=L.validateSnapshot(s);assert(errors.some(e=>re.test(e)),`${re}: ${errors.join(' | ')}`);}
 const r=cli(writeTmp('bad.json',(()=>{const s=clone();s.windows.d28.ctr=4.7;return s;})()));assert.equal(r.status,1);assert.match(r.stderr,/ctr/);
 assert.equal(cli(writeTmp('syntax.json','{"asOf":')).status,2,'unreadable JSON exits 2');
 const w=clone();w.history.pop();const {errors,warnings}=L.validateSnapshot(w);assert.equal(errors.length,0);assert(warnings.some(x=>/append one/.test(x)),'missing asOf row is a warning');
});

// 2. the tab -------------------------------------------------------------------------------------------------------------------
ok('the tab renders the seed headline numbers, the as-of line and the summary',()=>{
 const seo=L.parseSnapshot(read(SNAP));assert.equal(seo.status,'ok');
 const html=render(seo),t=text(html);
 assert.match(t,/As of Nov 15 · Google data through Nov 13/);
 const tile=k=>(html.match(new RegExp(`data-k="${k}">([^<]+)<`))||[])[1];
 assert.deepEqual([tile('seo-clicks'),tile('seo-impressions'),tile('seo-ctr'),tile('seo-position'),tile('seo-indexed'),tile('seo-not-indexed')],['25','535','4.7%','28.3','314','617']);
 assert.equal(seo.summary.length,3);
 assert.match(seo.summary[0],/Impressions up 5x in 1 day \(108 → 535\); clicks up 67% \(15 → 25\)/);
 assert.match(seo.summary[1],/^314 pages indexed \(\+312 since Nov 8\); 37 crawled but not indexed/);
 assert.match(seo.summary[2],/Quick wins/);
 for(const l of seo.summary)assert(t.includes(l.replace(/\s+/g,' ')),'summary on the page: '+l);
 // quick wins = position 5-20 exactly: two-v-one (7.9) and the calculator (12.6) yes; / (2.1) and yellow cards (51.4) no.
 const winRows=[...html.matchAll(/<th scope="row"[^>]*>([^<]+)<span[^>]*data-win/g)].map(m=>m[1]);
 assert(winRows.includes('/learn/soccer-terms/two-v-one')&&winRows.includes('/tools/soccer-playing-time-calculator')&&winRows.includes('2v1'));
 assert(!winRows.includes('/')&&!winRows.includes('/learn/soccer-rules/yellow-and-red-cards')&&!winRows.includes('futbal island'));
 for(const s of ['Discovered - currently not indexed','Duplicate without user-selected canonical','fix validation started Nov 15','/sitemap-images.xml','788','Indexing requests','/learn/soccer-positions/striker','Google says','We counted','Search arrivals'])assert(t.includes(s),s);
 assert(t.indexOf('Nov 15',t.indexOf('Indexing requests'))<t.indexOf('2026-11-10'.replace('2026-11-10','Nov 10'),t.indexOf('Indexing requests')),'work log newest first');
 assert.match(t,/7-day numbers were not recorded/);
});
ok('a 7-day window and a previous window show changes',()=>{
 const s=clone();s.windows.d28.prev={clicks:10,impressions:100,ctr:0.1,position:30};s.windows.d7={clicks:5,impressions:50,ctr:0.1,position:20,prev:null};
 const html=render(L.parseSnapshot(JSON.stringify(s))),t=text(html);
 assert.match(t,/\+150% vs previous 28 days/);assert.match(t,/\+435% vs previous 28 days/);
 assert.match(html,/data-tone="bad"><span aria-hidden="true">▼<\/span> −5 pts vs previous 28 days/,'CTR in points');
 assert.match(html,/data-k="seo-position">28.3<\/b><small class="delta" data-tone="good">/,'a lower position is good');
 assert(!/7-day numbers were not recorded/.test(t));
});

// 3. empty state ---------------------------------------------------------------------------------------------------------------
ok('missing and malformed snapshots show a friendly empty state',()=>{
 const miss=L.parseSnapshot(null);assert.equal(miss.status,'missing');
 let t=text(render(miss));assert.match(t,/No Search Console snapshot yet/);assert(!/As of/.test(t));assert.match(t,/Search arrivals/);
 const bad=L.parseSnapshot('{not json');assert.equal(bad.status,'invalid');
 t=text(render(bad));assert.match(t,/could not be read/);assert.match(t,/node scripts\/seo-snapshot\.mjs/);
 const wrong=L.parseSnapshot(JSON.stringify({asOf:'yesterday'}));assert.equal(wrong.status,'invalid');assert(text(render(wrong)).includes('data/seo/snapshot.json'));
 assert.match(render(null),/data-seo-empty/);
});

// 4. admin-only ----------------------------------------------------------------------------------------------------------------
ok('the snapshot is read on the server after the session check, never by a client file or API route',()=>{
 assert.match(read('lib/seo/loadSnapshot.ts'),/^import \{readFile\} from 'node:fs\/promises';/,'the reader uses fs, so a client import fails the build');
 const page=read('app/admin/page.tsx'),gate=page.indexOf('verifySession('),use=page.indexOf('loadSeoSnapshot()');
 assert(gate>0&&use>gate,'loaded after the session check');
 assert(/return <AdminLogin/.test(page.slice(gate,use)),'signed-out visitors get the login card before the snapshot is read');
 assert.match(page,/seo=\{seo\}/);
 const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
 for(const f of [...walk('app'),...walk('components'),...walk('lib')].filter(f=>/\.(tsx?|mjs|js)$/.test(f))){
  const src=read(f);
  assert(!/seo\/snapshot\.json/.test(src.replace(/\/\/.*|\/\*[\s\S]*?\*\//g,''))||f==='lib/seo/snapshot.ts'||f.startsWith('app/admin/SeoSection'),'no other file reads the JSON: '+f);
  if(/loadSeoSnapshot\(/.test(src))assert(['app/admin/page.tsx','lib/seo/loadSnapshot.ts'].includes(f)||f.startsWith('app/dev-seo-preview'),'only /admin reads the snapshot: '+f);
  if(/^\s*['"]use client['"]/.test(src))assert(!/loadSeoSnapshot|loadSnapshot|from ['"]@\/data\/seo/.test(src),'no client file loads the snapshot: '+f);
  if(f.startsWith('app/api/')||/^app\/[^/]+\/route\.ts$/.test(f))assert(!/lib\/seo\/snapshot/.test(src),'no API route exposes it: '+f);
 }
 assert.match(read('next.config.mjs'),/outputFileTracingIncludes: \{ '\/admin': \['\.\/data\/seo\/\*\*'\] \}/,'the JSON ships with the /admin function');
 const MI=load('lib/analytics/metricIndex.ts');assert(MI.DASH_TABS.some(([id,label])=>id==='seo'&&label==='SEO'),'SEO tab');
 assert.match(read('app/admin/AnalyticsDashboard.tsx'),/tab==='seo'&&<div className=\{dd\.mx\} data-metric="seo\.section"><SeoSection seo=\{seo\}/);
});

fs.rmSync(tmp,{recursive:true,force:true});
console.log(`admin-seo: ${n} checks passed`);
