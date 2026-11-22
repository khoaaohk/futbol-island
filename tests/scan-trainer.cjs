// Scan Trainer (/scan, Nov 16 2026; docs/scan-trainer/HANDOFF.md): the pure engine, its saved data, the app shell, the SEO front
// door in both languages and the club embed. No build: the real modules are transpiled and run (tests/lib/tsLoad.cjs).
//  1. Settings: cleaning of garbage, interval in half seconds 1-6, at least two colors / directions, presets.
//  2. Cues: every mode respects its settings, never the same cue twice in a row (also with a broken random), mix uses all kinds.
//  3. The session clock: 3-2-1, cue index, pause and resume, session end, endless, cues shown.
//  4. The coach score and "better"; the saved record (version, garbage, results).
//  5. The app shell: noindex, own manifest, a service worker scoped to /scan only (never /play, /coach or the site); counters.
//  6. Front door: titles and descriptions, FAQ JSON-LD = visible FAQ, HowTo, six drills with diagrams, links resolve,
//     Spanish parity (1:1 arrays, banned words, the route renders) and the app's own words in both languages.
//  7. The embed: noindex with the canonical on the front door, one link, framable headers.
// usage: node tests/scan-trainer.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {root,L,read,render,React,ldOf}=require('./lib/tsLoad.cjs');process.chdir(root);
const E=L('lib/scan/engine.ts'),S=L('lib/scan/store.ts'),W=L('lib/scan/words.ts').WORDS;
let checks=0;const ok=(c,m)=>{assert(c,m);checks++;};
const strip=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'');
ok(!/Math\.random|Date\.now|new Date|fetch\(|window\.|document\./.test(strip(read('lib/scan/engine.ts'))),'the engine is pure');
(async()=>{
/* ---- 1. settings ---- */
{const d=E.cleanSettings(null);ok(JSON.stringify(d)===JSON.stringify(E.DEFAULTS),'null gives the defaults');
 const s=E.cleanSettings({mode:'rockets',interval:0.2,colours:['red','red','nope'],range:'5-500',dirs:['up'],teammates:99,bg:'yes',names:false,session:45,sound:'siren',score:true,age:'u99'});
 ok(s.mode==='colours'&&s.interval===1&&s.colours.length>=2&&s.range==='1-9'&&s.dirs.length>=2&&s.teammates===E.MAX_TEAMMATES,'bad values are replaced or clamped');
 ok(s.bg===true&&s.names===false&&s.session===90&&s.sound==='tick'&&s.score===true&&s.age==='u10','booleans kept only when boolean');
 for(const [v,want] of [[7,6],[2.3,2.5],[2.2,2],[1,1],[NaN,3],['4',3],[3.75,4]])ok(E.cleanInterval(v)===want,`interval ${v} -> ${want}`);
 ok(E.cleanSettings({teammates:1}).teammates===2&&E.cleanSettings({age:null}).age===null,'teammates at least 2; no age is allowed');
 ok(JSON.stringify(E.cleanSettings({colours:['blue','red','blue']}).colours)==='["red","blue"]','colors unique, in palette order');
 for(const a of E.AGES){const p=E.applyPreset(E.DEFAULTS,a);ok(JSON.stringify(E.cleanSettings(p))===JSON.stringify(p),`preset ${a} is already clean`);ok(p.age===a&&JSON.stringify(p.colours)===JSON.stringify(E.DEFAULTS.colours),`preset ${a} keeps the coach's colors`);}
 const iv=E.AGES.map(a=>E.PRESETS[a].interval);ok(iv.every((x,i)=>i===0||x<iv[i-1]),'older groups get faster changes');}
/* ---- 2. cues ---- */
{const rand=E.seeded(42);
 const lum=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];};
 for(const [id,c] of Object.entries(E.COLOURS)){const a=lum(c.hex),b=lum(c.ink),r=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);ok(r>=4.5,`${id}: the name reads on the color (${r.toFixed(1)})`);}
 const cases=[];for(const mode of E.MODES)for(const range of ['1-9','1-20','0-99'])for(const n of [2,3,9])cases.push({mode,range,interval:2,colours:E.COLOUR_IDS.slice(0,n),dirs:E.DIRS.slice(0,Math.min(8,n)),teammates:n});
 for(const c of cases){const s=E.cleanSettings(c);let prev=null;const kinds=new Set();
  for(let i=0;i<1500;i++){const q=E.nextCue(s,prev,rand);kinds.add(q.kind);
   if(prev)assert.notEqual(E.cueKey(q),E.cueKey(prev),`${s.mode}: a repeat at ${i}`);
   if(q.kind==='colour')assert(s.colours.includes(q.colour),'color from the coach list');
   if(q.kind==='number'){const [lo,hi]=E.RANGES[s.range];assert(q.n>=lo&&q.n<=hi&&Number.isInteger(q.n),`number ${q.n} in ${s.range}`);}
   if(q.kind==='arrow')assert(s.dirs.includes(q.dir),'allowed arrow');
   if(q.kind==='pass')assert(q.n>=1&&q.n<=s.teammates&&s.dirs.includes(q.dir),'pass to a real teammate, allowed direction');
   prev=q;checks++;}
  const want={colours:['colour'],numbers:['number'],arrows:['arrow'],pass:['pass'],mix:['colour','number','arrow']}[s.mode];
  ok(JSON.stringify([...kinds].sort())===JSON.stringify([...want].sort()),`${s.mode}: cue kinds ${[...kinds]}`);}
 for(const mode of E.MODES){const s=E.cleanSettings({mode,colours:['red','blue'],dirs:['left','right'],teammates:2});let prev=null;
  for(let i=0;i<50;i++){const q=E.nextCue(s,prev,()=>0);if(prev)ok(E.cueKey(q)!==E.cueKey(prev),`${mode}: changes even with a stuck random`);prev=q;}
  prev=null;for(let i=0;i<50;i++){const q=E.nextCue(s,prev,()=>0.9999999);if(prev)ok(E.cueKey(q)!==E.cueKey(prev),`${mode}: rand near 1`);prev=q;}}
 const a=E.seeded(7),b=E.seeded(7);ok([1,2,3,4,5].every(()=>a()===b()),'seeded runs replay');}
/* ---- 3. the session clock ---- */
{const s=E.cleanSettings({interval:2.5,session:60}),t0=1e6;let r=E.startRun(t0);
 ok(E.phaseAt(r,s,t0).n===3&&E.phaseAt(r,s,t0+999).n===3&&E.phaseAt(r,s,t0+1000).n===2&&E.phaseAt(r,s,t0+2999).n===1,'3-2-1');
 let p=E.phaseAt(r,s,t0+3000);ok(p.phase==='run'&&p.cue===0&&p.left===60,'first cue at 3 s with 60 s left');
 ok(E.phaseAt(r,s,t0+3000+2499).cue===0&&E.phaseAt(r,s,t0+3000+2500).cue===1,'changes every 2.5 s');
 r=E.pauseRun(r,t0+10000);ok(E.phaseAt(r,s,t0+50000).ms===7000,'paused: the clock stops');ok(E.pauseRun(r,t0+60000)===r,'pausing twice changes nothing');
 r=E.resumeRun(r,t0+40000);ok(E.runMs(r,t0+41000)===8000&&r.pausedMs===30000,'resume carries on where it stopped');
 p=E.phaseAt(r,s,t0+3000+30000+60000);ok(p.phase==='done'&&p.ms===60000&&p.cues===24,'done at 60 s with 24 cues shown');
 const endless=E.cleanSettings({session:0,interval:1});ok(E.phaseAt(E.startRun(0),endless,3600e3).phase==='run'&&E.phaseAt(E.startRun(0),endless,10e3).left===null,'endless never ends');
 ok(E.cuesIn(0,1000)===0&&E.cuesIn(1,1000)===1&&E.cuesIn(1000,1000)===1&&E.cuesIn(1001,1000)===2&&E.cuesIn(90000,3000)===30,'cues shown');
 ok(E.fmtTime(0)==='0:00'&&E.fmtTime(90)==='1:30'&&E.fmtTime(-4)==='0:00','time format');}
/* ---- 4. score + store ---- */
{let sc={hit:0,miss:0};for(const x of [1,1,0,1,1,1,0,1,1,1,1,1,1,1])sc=E.tally(sc,!!x);ok(sc.hit===12&&sc.miss===2,'12 of 14');
 const R=(hit,total,interval=3)=>({hit,total,cues:total,sec:60,interval,at:'2026-11-16'});
 ok(E.better(R(12,14),undefined)&&!E.better(R(0,0),undefined),'first score is the best; an empty one is not');
 ok(E.better(R(13,14),R(12,14))&&!E.better(R(11,14),R(12,14))&&E.better(R(24,28),R(12,14))&&E.better(R(12,14,2),R(12,14,3))&&!E.better(R(12,14,3),R(12,14,3)),'better: share, then count, then speed');
 const st=S.cleanStore({v:1,lang:'es',settings:{mode:'pass',interval:9},results:{pass:{last:R(3,4),best:{hit:9,total:4}},colours:{best:R(5,5)},rockets:{best:R(1,1)}}});
 ok(st.lang==='es'&&st.settings.mode==='pass'&&st.settings.interval===6,'settings cleaned');
 ok(st.results.pass.last.hit===3&&!st.results.pass.best&&st.results.colours.best.total===5&&!st.results.rockets,'results cleaned (hit > total dropped, unknown modes dropped)');
 ok(S.cleanStore({v:2,lang:'es'}).lang===undefined&&S.cleanStore('x').v===1,'other versions and garbage give an empty store');
 const mem={};const ls={getItem:k=>mem[k]??null,setItem:(k,v)=>{mem[k]=v;}};ok(S.saveStore(ls,st)&&S.loadStore(ls).results.pass.last.hit===3&&Object.keys(mem)[0]==='fi-scan-v1','round trip under fi-scan-v1');
 ok(S.loadStore({getItem:()=>{throw new Error('blocked');}}).v===1&&S.loadStore({getItem:()=>'{bad'}).v===1,'blocked or bad storage is safe');
 const snap=L('lib/saves/snapshot.ts');ok(snap.NEVER_KEYS.includes('fi-scan-v1'),'fi-scan-v1 is a device-only key (never in a save code)');}
/* ---- 5. the app shell ---- */
{const layout=read('app/scan/layout.tsx'),sw=read('public/scan-sw.js'),app=read('components/scan/ScanApp.tsx'),man=L('app/scan/manifest.webmanifest/route.ts'),cfg=read('next.config.mjs');
 const lm=L('app/scan/layout.tsx').metadata;ok(lm.robots.index===false&&lm.manifest==='/scan/manifest.webmanifest','noindex, own manifest');
 ok(/l\.href='\/scan\/manifest\.webmanifest'/.test(layout),'the layout swaps the site manifest link');
 const mj=await man.GET().json();ok(mj.start_url==='/scan'&&mj.scope==='/scan'&&mj.id==='/scan'&&mj.icons.every(i=>fs.existsSync(path.join(root,'public',i.src))),'manifest start_url, scope, id and icons');
 ok(/register\('\/scan-sw\.js',\{scope:'\/scan'\}\)/.test(app)&&/if\(embed\)return;/.test(app),'the SW is registered with scope /scan, never in the embed');
 const m=/function inScope\(([^)]*)\)\{([\s\S]*?)\n\}/.exec(sw);const inScope=new Function(m[1],m[2]);
 for(const [u,want] of [['/scan',true],['/scan/manifest.webmanifest',true],['/scanner',false],['/scan-sw.js',false],['/play',false],['/',false],['/coach',false],['/tools/soccer-scanning-trainer',false],['/es/tools/soccer-scanning-trainer',false],['/embed/soccer-scanning-trainer',false]])
  ok(inScope(u)===want,`SW scope ${u} -> ${want}`);
 ok(!/\/play/.test(strip(sw))&&/fi-scan-sw-/.test(sw),'the SW never names /play; its own cache name');
 const cm=/function inScope\(([^)]*)\)\{([\s\S]*?)\n\}/.exec(read('public/coach-sw.js'));ok(!new Function(cm[1],cm[2])('/scan'),'the coach SW does not cover /scan');
 const tops=fs.readdirSync(path.join(root,'app')).concat(fs.readdirSync(path.join(root,'app/(site)')));ok(tops.filter(x=>/^scan/.test(x)).join()==='scan','no other route starts with /scan');
 ok(/source: '\/scan', headers: \[\{ key: 'X-Robots-Tag', value: 'noindex' \}\]/.test(cfg)&&/source: '\/scan-sw\.js'/.test(cfg),'X-Robots-Tag noindex on /scan');
 const counts=[...strip(app).matchAll(/count\('([^']+)'\)/g)].map(x=>x[1]);ok(JSON.stringify([...new Set(counts)].sort())==='["sn:finish","sn:start"]','counters: sn:start and sn:finish only');
 const ids=L('lib/analytics/countIds.ts').FIXED_COUNT_IDS;ok(ids.includes('sn:start')&&ids.includes('sn:finish'),'counters registered');
 ok(L('lib/analytics/pageKeys.ts').pageKeyOf('/scan')==='scan','page key for /scan');
 ok(!/fetch\(|sendBeacon|XMLHttpRequest|WebSocket|supabase/.test(strip(app)),'the app sends nothing itself');
 ok(/wakeLock/.test(app)&&/requestFullscreen/.test(app)&&/AudioContext/.test(app),'wake lock, full screen, sound after a gesture');
 const wEn=Object.keys(W.en).sort(),wEs=Object.keys(W.es).sort();ok(JSON.stringify(wEn)===JSON.stringify(wEs),'app words: same keys in both languages');
 for(const k of ['colourNames','dirNames','modes','ages','sounds','sessions','modeLines'])ok(JSON.stringify(Object.keys(W.en[k]))===JSON.stringify(Object.keys(W.es[k])),`app words ${k}`);}
/* ---- 6. front door ---- */
const T=L('lib/site/tools/scanTrainer.ts'),ES=L('lib/i18n/es/scanTrainer.ts').SCAN_ES,EN=T.SCAN_EN,glos=L('lib/i18n/es-glossary.ts'),ep=L('lib/i18n/esPaths.ts');
const PATHS=new Set(L('lib/site/paths.ts').sitePaths().map(p=>p.path));
const text=h=>h.replace(/<script[\s\S]*?<\/script>/g,' ').replace(/<style[\s\S]*?<\/style>/g,' ').replace(/<[^>]+>/g,' ').replace(/&#x27;|&#39;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/\s+/g,' ');
function checkPage(h,p,where,lang){
 const h1=h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/g)||[];ok(h1.length===1&&text(h1[0]).trim()===p.h1,`${where}: one h1`);
 const ld=ldOf(h),types=ld.map(x=>x['@type']);ok(['BreadcrumbList','WebApplication','HowTo','FAQPage'].every(t=>types.includes(t)),`${where}: JSON-LD ${types}`);
 const faq=ld.find(x=>x['@type']==='FAQPage'),body=text(h);ok(faq.mainEntity.length===5&&faq.mainEntity.every(q=>body.includes(q.name)&&body.includes(q.acceptedAnswer.text)),`${where}: the FAQ JSON-LD is the visible FAQ`);
 const how=ld.find(x=>x['@type']==='HowTo');ok(how.step.length===p.how.length&&how.step.every((s,i)=>s.text===p.how[i]&&body.includes(s.text)),`${where}: HowTo steps are on the page`);
 ok(!/aggregateRating|ratingValue|"review"/.test(JSON.stringify(ld)),`${where}: no invented ratings`);
 ok((h.match(/data-diagram=|<svg[^>]*role="img"/g)||[]).length>=6,`${where}: six drill diagrams`);
 ok(body.split(' ').length>=1200,`${where}: real content (${body.split(' ').length} words)`);
 ok(body.indexOf(p.what[0].slice(0,60))>-1&&body.indexOf(p.whatTitle)<body.indexOf(p.howTitle),`${where}: answer first`);
 const links=[...h.matchAll(/href="([^"]+)"/g)].map(m=>m[1]);
 ok(links.some(l=>l.startsWith('/scan')),`${where}: opens the app`);
 for(const l of links){const u=l.split('#')[0].split('?')[0];if(u==='/scan')continue;if(l.startsWith('#')){ok(h.includes(` id="${l.slice(1)}"`),`${where}: in-page link ${l} has its target`);continue;}/* Nov 20 2026 night: the side nav's in-page links (owner: "it should list what's on that page to smooth scroll down") */ok(PATHS.has(u)||(lang==='es'&&u.startsWith('/es')&&ep.hasEs(ep.toEn(u))),`${where}: link ${l} resolves`);}
 ok(h.includes('/embed/soccer-scanning-trainer'),`${where}: the embed snippet`);
 ok((h.match(/class="cta"/g)||[]).length===1,`${where}: one gold button`);
}
{for(const p of [EN,ES]){ok(p.title.length>=30&&p.title.length<=60,`title ${p.title.length}: ${p.title}`);ok(p.description.length>=120&&p.description.length<=155,`description ${p.description.length}`);}
 ok(/scanning/i.test(EN.title)&&/soccer/i.test(EN.title)&&/check/i.test(EN.title),'English title carries the queries');
 const all=JSON.stringify(EN).toLowerCase();for(const q of ['scanning','check','shoulder','drill','app'])ok(all.includes(q),`English words include "${q}"`);
 ok(T.scanDrillScenes(EN).length===6,'six drills');
 const same=(a,b,k)=>ok(Array.isArray(a)&&a.length===b.length,`Spanish parity: ${k}`);
 for(const k of ['what','how','ages','ageHead','settings','drills','tips','faq','features'])same(ES[k],EN[k],k);
 EN.drills.forEach((d,i)=>{same(ES.drills[i].steps,d.steps,`drill ${d.id} steps`);ok(ES.drills[i].id===d.id&&ES.drills[i].scene.who===d.scene.who&&ES.drills[i].scene.title!==d.scene.title,`drill ${d.id}: same geometry, Spanish words`);});
 EN.ages.forEach((r,i)=>ok(ES.ages[i].every===r.every,`age row ${i}: same seconds`));
 ok(EN.ages.map(r=>r.every).join()===E.AGES.map(a=>E.PRESETS[a].interval).join(),'the age table matches the app presets');
 const esText=JSON.stringify(ES);for(const re of glos.ES_BANNED)ok(!re.test(esText),`Spanish: no ${re}`);ok(!/\busted\b/i.test(JSON.stringify(W.es)),'app Spanish: tú');
 ok(ep.ES_PAGES.includes(T.SCAN_PATH)&&PATHS.has(T.SCAN_PATH),'in the sitemap, with a Spanish page');
 ok(fs.existsSync(path.join(root,'public',T.SCAN_IMAGE)),'the share picture exists');
 const reg=L('lib/site/tools/registry.ts');ok(reg.TOOL_HUBS.some(t=>t.path===T.SCAN_PATH),'hub-level (llms.txt, search, More to learn)');
 const mod=L('app/(site)/tools/soccer-scanning-trainer/page.tsx');ok(mod.metadata.title===EN.title&&mod.metadata.alternates.canonical===T.SCAN_PATH&&mod.metadata.openGraph.images[0].url===T.SCAN_IMAGE,'English metadata');
 checkPage(render(React.createElement(mod.default)),EN,T.SCAN_PATH,'en');
 const r=L('components/es/routes.tsx').esRoute(T.SCAN_PATH);ok(r,'Spanish route');const em=r.meta();ok(em.title===ES.title||em.title?.absolute===ES.title,'Spanish title');
 checkPage(render(r.render()),ES,'/es'+T.SCAN_PATH,'es');
 ok(render(React.createElement(L('app/(site)/tools/page.tsx').default)).includes(`href="${T.SCAN_PATH}"`),'/tools links the front door');
 ok(render(L('components/es/routes.tsx').esRoute('/tools').render()).includes(`href="/es${T.SCAN_PATH}"`),'/es/tools links the Spanish front door');
 const si=read('lib/site/searchIndex.ts');ok(/TOOL_HUBS/.test(si),'site search lists hub-level tools');}
/* ---- 7. the embed ---- */
{const P=L('app/embed/soccer-scanning-trainer/page.tsx');ok(/force-static/.test(read('app/embed/soccer-scanning-trainer/page.tsx')),'static');
 ok(P.metadata.robots.index===false&&P.metadata.alternates.canonical==='https://futbolisland.app/tools/soccer-scanning-trainer','embed: noindex, canonical on the front door');
 const h=render(React.createElement(P.default));const links=[...h.matchAll(/<a\b[^>]*>/g)].map(x=>x[0]);
 ok(links.length===1&&links[0].includes('href="/tools/soccer-scanning-trainer"')&&/target="_blank"/.test(links[0])&&/rel="noopener"/.test(links[0]),'embed: one attribution link');
 ok(/data-scan-view="settings"/.test(h)&&!/<script(?![^>]*application\/ld\+json)/.test(h)&&!/src="https?:\/\//.test(h),'embed: the app, no scripts, nothing from elsewhere');
 const cfg=await import(path.join(root,'next.config.mjs'));const rules=await cfg.default('phase-production-build').headers();
 const {pathToRegexp}=require('next/dist/compiled/path-to-regexp');
 const headersFor=p=>{const out={};for(const r of rules){if(r.has)continue;if(pathToRegexp(r.source,[],{strict:false,delimiter:'/'}).test(p))for(const x of r.headers)out[x.key]=x.value;}return out;};
 const eh=headersFor('/embed/soccer-scanning-trainer');ok(eh['X-Frame-Options']===undefined&&/frame-ancestors \*/.test(eh['Content-Security-Policy-Report-Only'])&&eh['X-Robots-Tag']==='noindex','embed headers: framable, noindex');
 const sh=headersFor('/scan');ok(sh['X-Frame-Options']==='SAMEORIGIN'&&sh['X-Robots-Tag']==='noindex','/scan headers: not framable, noindex');
 ok(headersFor('/scan-sw.js')['Cache-Control']==='no-cache','the SW is never cached');
 ok(headersFor('/tools/soccer-scanning-trainer')['X-Robots-Tag']===undefined,'the front door is indexable');}
/* Nov 20 2026: Back in the header. The shared button locks itself once pressed, so each screen needs its own (a key): without it Back
   was dead on the settings after a session's summary. From the summary it returns to the settings; from the settings it leaves. */
{const app=read('components/scan/ScanApp.tsx');ok(/<AppHeader /.test(app)&&/data-scan-back/.test(app)&&/data-scan-exit/.test(app),'the shared header: Back from the summary, Exit on the right');
 ok(/data-scan-view="summary"><Top .*onBack=\{\(\)=>screenChange\('back',\(\)=>setView\('settings'\)\)\}/.test(app),'summary Back returns to the settings');
 ok(/window\.location\.assign\(exitHref\(lang\)\)/.test(read('components/motion/AppHeader.tsx')),'Exit leaves for the page the coach came from (else the tools hub)');}
console.log(`PASS scan-trainer: ${checks} checks`);
})().catch(e=>{console.error(e);process.exit(1);});
