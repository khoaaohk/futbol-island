// /learn, the feature tour (Nov 2 2026, app/(site)/learn/page.tsx + components/learn/*). Checks:
//  1. routes: /learn is the tour, the lesson index moved to /learn/lessons (+ [slug]), old /learn/<id> redirects permanently
//     (and /learn/lessons itself is not caught by that redirect); sitemap and llms files list both;
//  2. links into /learn: title-screen bottom row, site footer, about page, in-game Grown-ups panel (new tab, rel noopener);
//  3. heat + motion: one client island for behaviour with reduced-motion, Save-Data, slow-network and Battery saver branches,
//     IntersectionObserver only (no scroll listeners, no getBoundingClientRect), max 2 clips, pause when hidden; CSS has the
//     scroll-driven path, the IO fallback path and the calm / reduced-motion kill switch; clips are muted, looped, inline,
//     preload="none"; the media module tolerates a missing manifest and missing files;
//  4. content: every feature, group and FAQ from lib/site/learnFeatures.ts is used; FAQ JSON-LD is built from LEARN_FAQ; hrefs in
//     the page are internal paths that exist or futbolisland.app;
//  5. a built site (NEXT_DIST_DIR or .next, when it holds /learn): every feature title, every FAQ question and answer, the
//     3 friend steps are in the HTML; FAQPage JSON-LD matches LEARN_FAQ; old /learn/<id> pages are not built.
// usage: node tests/learn-page.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const has=rel=>fs.existsSync(path.join(root,rel));
const strip=src=>src.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:])\/\/.*$/gm,'$1');

// ---- loader (same as tests/learn-content.cjs) ---------------------------------------------------------------------------------
const cache=new Map();
function load(file){
 if(cache.has(file))return cache.get(file).exports;
 if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
 const mod={exports:{}};cache.set(file,mod);
 const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true,jsx:ts.JsxEmit.React}}).outputText;
 vm.runInNewContext(out,{Math,JSON,Set,Map,Object,Array,Number,String,Symbol,Promise,Error,RegExp,Date,Boolean,Infinity,NaN,isFinite,console,Buffer,
  process:{env:{NODE_ENV:'production'},cwd:()=>root},exports:mod.exports,module:mod,require:id=>{
  if(!id.startsWith('.')&&!id.startsWith('@/'))return require(id);
  const base=id.startsWith('@/')?path.join(root,id.slice(2)):path.resolve(path.dirname(file),id);
  for(const f of [base,base+'.ts',base+'.tsx',base+'.json'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return load(f);
  throw new Error('Cannot resolve '+id+' from '+file);}});
 return mod.exports;
}
const L=rel=>load(path.join(root,rel));
const {LEARN_FEATURES:F,LEARN_GROUPS:G,LEARN_FAQ:Q}=L('lib/site/learnFeatures.ts');

// ---- 1. routes ----------------------------------------------------------------------------------------------------------------
for(const f of ['app/(site)/learn/page.tsx','app/(site)/learn/lessons/page.tsx','app/(site)/learn/lessons/[slug]/page.tsx'])assert(has(f),`${f} exists`);
assert(!has('app/(site)/learn/[slug]'),'the old /learn/[slug] route is gone (moved to lessons/[slug])');
const page=read('app/(site)/learn/page.tsx');
assert.match(page,/export const dynamic='force-static';/,'/learn is static');
assert.match(page,/pageMeta\([^)]*'\/learn'\)/,'/learn has its own metadata and canonical');
assert.match(read('app/(site)/learn/lessons/page.tsx'),/pageMeta\('Football lessons',DESC,'\/learn\/lessons'\)/,'the lesson index canonical is /learn/lessons');
const lessons=L('lib/site/lessons.ts');
assert.equal(lessons.lessonPath('x'),'/learn/lessons/x','lesson pages live under /learn/lessons');
const nc=read('next.config.mjs');
const red=nc.match(/const redirects = \[(.*)\];/);assert(red,'next.config.mjs has redirects');
assert.match(red[1],/source: '\/learn\/:slug\(\(\?!lessons\$\)[^']+'/,'old lesson URLs redirect, /learn/lessons excluded');
assert.match(red[1],/destination: '\/learn\/lessons\/:slug', permanent: true/,'permanent redirect to /learn/lessons/<id>');
assert.match(nc,/async redirects\(\) \{ return redirects; \}/,'redirects are wired into the config');
{const re=new RegExp('^/learn/(?:'+red[1].match(/:slug\((.*)\)', destination/)[1]+')$');
 for(const l of lessons.LESSONS)assert(re.test('/learn/'+l.id),`old URL /learn/${l.id} is caught by the redirect`);
 assert(!re.test('/learn/lessons'),'/learn/lessons is not redirected');}
const paths=L('lib/site/paths.ts').sitePaths();
assert.equal(paths.find(p=>p.path==='/learn')?.priority,.9,'/learn in the sitemap at .9');
assert(paths.some(p=>p.path==='/learn/lessons'),'/learn/lessons in the sitemap');
assert(!paths.some(p=>/^\/learn\/(?!lessons)[^/]+$/.test(p.path)),'no old /learn/<id> path in the sitemap');
const llms=read('public/llms.txt');
assert.match(llms,/\(https:\/\/futbolisland\.app\/learn\): the feature tour/,'llms.txt describes /learn as the feature tour');
assert.match(llms,/\(https:\/\/futbolisland\.app\/learn\/lessons\): every lesson/,'llms.txt points the lesson index at /learn/lessons');
const full=read('app/llms-full.txt/route.ts');
assert(full.includes("abs('/learn')")&&full.includes("abs('/learn/lessons')"),'llms-full.txt lists the tour and the lesson index');

// ---- 2. links into /learn -------------------------------------------------------------------------------------------------------
assert.match(read('components/landing/GrownUps.tsx'),/<a className=\{styles\.grownLink\} href="\/learn">What’s inside<\/a>/,'title screen bottom row links to /learn');
assert.match(read('app/(site)/layout.tsx'),/<a href="\/learn">What’s inside<\/a>\s*<a href="\/privacy">Privacy<\/a>/,'site footer: What’s inside beside Privacy');
assert.doesNotMatch(read('app/(site)/layout.tsx').replace(/\{\/\*[\s\S]*?\*\/\}/g,''),/<header[\s\S]*href="\/learn"[\s\S]*<\/header>/,'no section navigation in the header (Oct 16 2026)');
assert.match(read('app/(site)/about/page.tsx'),/href="\/learn"/,'about links to /learn');
assert.match(read('components/GrownUps.tsx'),/<a href="\/learn" target="_blank" rel="noopener">/,'in-game Grown-ups panel links to /learn in a new tab');
assert.match(page,/href=\{PLAY_URL\}/,'/learn links back to Play');assert.match(page,/href="\/about"/,'/learn links to About');

// ---- 3. heat + motion -----------------------------------------------------------------------------------------------------------
const enh=strip(read('components/learn/LearnEnhance.tsx'));
assert.match(read('components/learn/LearnEnhance.tsx'),/^'use client';/,'LearnEnhance is the client island');
assert.match(enh,/prefers-reduced-motion: reduce/,'reduced-motion branch');
assert.match(enh,/saveData/,'Save-Data branch');
assert.match(enh,/slow-2g\|2g\|3g/,'slow-network branch');
assert.match(enh,/fi2-battery-saver/,'Battery saver branch (same key as lib/graphics/heatTier.ts)');
assert.match(read('lib/graphics/heatTier.ts'),/SAVER_KEY='fi2-battery-saver'/,'the Battery saver key still matches the game');
assert.match(enh,/animation-timeline: view\(\)/,'feature-detects CSS scroll-driven animations');
assert.match(enh,/const MAX_PLAYING=2;/,'at most 2 clips at once');
assert.match(enh,/>=\.5/,'a clip plays only when >= 50 % visible');
assert.match(enh,/visibilitychange/,'clips pause when the tab is hidden');
for(const f of ['components/learn/LearnEnhance.tsx','components/learn/FeatureFinder.tsx','components/learn/FriendStepper.tsx','components/learn/ShareLink.tsx']){const src=strip(read(f));
 assert.doesNotMatch(src,/addEventListener\(\s*['"]scroll['"]|onScroll|onscroll/,`${f}: no scroll listeners`);
 assert.doesNotMatch(src,/framer-motion|gsap|animejs|react-spring|lottie/,`${f}: no animation library`);}
assert.doesNotMatch(enh,/getBoundingClientRect|offsetTop|scrollY|pageYOffset/,'LearnEnhance reads no layout while scrolling (IO entry rects only)');
const css=read('components/learn/learn.module.css');
assert.match(css,/@supports\(animation-timeline:view\(\)\)/,'CSS scroll-driven path');
assert.match(css,/\.root\[data-lm-io\]/,'IntersectionObserver fallback path');
assert.match(css,/\.root\[data-calm\] \*,[^{]*\{animation:none!important;transition:none!important\}/,'calm kills every animation');
assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{\.root \*,[^{]*\{animation:none!important;transition:none!important\}\}/,'reduced motion kills every animation, even before JS');
{const kf=[...css.matchAll(/@keyframes (\w+)\{([\s\S]*?\})\}/g)];assert(kf.length>=10,'keyframes found');
 for(const [,name,body] of kf){const props=[...body.matchAll(/([a-z-]+):/g)].map(m=>m[1]).filter(p=>!['transform','opacity','box-shadow','background','color'].includes(p));
  assert.deepEqual(props,[],`@keyframes ${name} animates transform / opacity only`);
  if(name!=='lightUp')assert.doesNotMatch(body,/box-shadow|background|color/,`@keyframes ${name}: transform / opacity only`);}}
const media=read('components/learn/LearnMedia.tsx');
assert.match(media,/<video [^>]*muted loop playsInline preload="none" poster=/,'clips: muted, loop, playsinline, preload none, poster');
assert.match(media,/video\/webm[\s\S]*video\/mp4/,'webm first, then mp4');
assert.match(media,/data-lv-btn/,'every clip has a pause / play button');
const lm=read('lib/site/learnMedia.ts');
assert.match(lm,/catch\{return out;\}/,'a missing or broken manifest is tolerated');
{const M=L('lib/site/learnMedia.ts');const a=M.learnAsset('definitely_not_captured_xyz');assert(!a.image&&!a.clip,'a missing shot falls back');
 for(const f of F){const x=M.learnAsset(f.imageKey);if(x.image){assert(x.image.width>0&&x.image.height>0,`${f.imageKey}: size`);assert(has('public'+x.image.src),`${f.imageKey}: file`);}}
 // public/learn stays small enough to deploy (brief: under 18 MB, clips under 14 MB)
 const walk=d=>fs.existsSync(d)?fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]):[];
 const files=walk(path.join(root,'public/learn')),size=f=>fs.statSync(f).size;
 const total=files.reduce((t,f)=>t+size(f),0),clips=files.filter(f=>/\.(mp4|webm)$/.test(f)).reduce((t,f)=>t+size(f),0);
 assert(total<18e6,`public/learn is ${(total/1e6).toFixed(1)} MB (< 18 MB)`);assert(clips<14e6*2,`clips ${(clips/1e6).toFixed(1)} MB (mp4 + webm pairs, < 14 MB each set)`);}

// ---- 4. content -----------------------------------------------------------------------------------------------------------------
for(const g of G)assert(page.includes(`byGroup('${g.id}')`)||page.includes(`g="${g.id}"`),`group ${g.id} has a section`);
for(const g of G)assert(page.includes(`id="${g.id}"`),`section #${g.id}`);
assert.match(page,/mainEntity:LEARN_FAQ\.map/,'FAQ JSON-LD is built from LEARN_FAQ');
assert.match(page,/LEARN_FAQ\.filter\(q=>q\.group==='parents'\)/,'parents FAQ rendered');
assert.match(page,/LEARN_FAQ\.filter\(q=>q\.group==='together'\)/,'Play together FAQ rendered');
assert.match(page,/<details key=\{q\.q\} className=\{s\.faq\}><summary>/,'FAQ is details / summary');
{const hrefs=[...page.matchAll(/href=(?:"([^"]+)"|\{`([^`]+)`\})/g)].map(m=>m[1]??m[2]);
 const ok=new Set(['/about','/privacy','#together']);
 for(const h of hrefs){if(h.startsWith('#'))continue;assert(ok.has(h)||h.startsWith('#')||/^https:\/\/futbolisland\.app\//.test(h),`link ${h} is known`);}
 for(const id of ['/about','/privacy'])assert(has(`app/(site)${id}`)||has(`app${id}`),`${id} route exists`);}

// ---- 5. built site --------------------------------------------------------------------------------------------------------------
const dist=path.join(root,process.env.NEXT_DIST_DIR||'.next'),built=path.join(dist,'server/app/learn.html');
if(!fs.existsSync(built)){console.log(`learn page sources ok: ${F.length} features, ${G.length} groups, ${Q.length} FAQ`);console.log(`  SKIP built-page checks: no /learn in ${path.relative(root,dist)} (build with NEXT_DIST_DIR to run them)`);process.exit(0);}
const html=fs.readFileSync(built,'utf8');
const text=html.replace(/<script[\s\S]*?<\/script>/g,' ').replace(/<style[\s\S]*?<\/style>/g,' ').replace(/<[^>]+>/g,' ').replace(/&#x27;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/\s+/g,' ');
const norm=x=>x.replace(/\s+/g,' ');
for(const f of F)for(const k of ['title','hook','proof','description','footballTie','where'])assert(text.includes(norm(f[k])),`${f.id}.${k} is in the HTML`);
for(const q of Q){assert(text.includes(norm(q.q)),`FAQ q: ${q.q}`);assert(text.includes(norm(q.a)),`FAQ a: ${q.q}`);}
for(const st of F.find(f=>f.id==='party-start').steps)assert(text.includes(norm(st.line)),`step: ${st.line}`);
const ld=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
const faq=ld.find(x=>x['@type']==='FAQPage');assert(faq,'FAQPage JSON-LD');
assert.deepEqual(faq.mainEntity.map(e=>[e.name,e.acceptedAnswer.text]),JSON.parse(JSON.stringify(Q.map(q=>[q.q,q.a]))),'FAQPage JSON-LD matches LEARN_FAQ');
assert(ld.some(x=>x['@type']==='BreadcrumbList'),'BreadcrumbList');
assert.match(html,/<link rel="canonical" href="https:\/\/futbolisland\.app\/learn"\/>/,'canonical');
assert.match(html,/<meta property="og:image" content="[^"]*opengraph-image\.png"/,'OG image');
assert.equal((html.match(/<h1[ >]/g)||[]).length,1,'one h1');
for(const m of html.matchAll(/<video [^>]*>/g))assert(/muted/.test(m[0])&&/loop/.test(m[0])&&/playsInline|playsinline/.test(m[0])&&/preload="none"/.test(m[0]),'built video attrs');
assert(!fs.existsSync(path.join(dist,'server/app/learn',lessons.LESSONS[0].id+'.html')),'old /learn/<id> pages are not built');
assert(fs.existsSync(path.join(dist,'server/app/learn/lessons',lessons.LESSONS[0].id+'.html')),'lessons are built under /learn/lessons');
console.log(`learn page ok: ${F.length} features, ${Q.length} FAQ, ${(html.match(/<video /g)||[]).length} clips, ${(html.match(/src="\/learn\/[a-z0-9_]+\.webp"/g)||[]).length} stills in ${path.relative(root,dist)}`);
