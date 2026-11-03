// /learn, the feature tour (Nov 2 2026, app/(site)/learn/page.tsx + components/learn/*). Checks:
//  1. routes: /learn is the tour, the lesson index moved to /learn/lessons (+ [slug]), old /learn/<id> redirects permanently
//     (and /learn/lessons itself is not caught by that redirect); sitemap and llms files list both;
//  2. links into /learn: title-screen bottom row, site footer, about page, in-game Grown-ups panel (new tab, rel noopener);
//  3. heat + motion: one client island for behaviour with reduced-motion, Save-Data, slow-network and Battery saver branches,
//     IntersectionObserver only (no scroll listeners, no getBoundingClientRect), max 2 clips, pause when hidden; CSS has the
//     scroll-driven path, the IO fallback path and the calm / reduced-motion kill switch; clips are muted, looped, inline,
//     preload="none" (auto for the hero only), play at >= 25 % visible, buffer ~1.5 screens ahead except in calm mode;
//     the media module tolerates a missing manifest and missing files; IslandBrush only on the Play buttons (Nov 3, owner);
//  4. content (simplified Nov 2 2026, owner "too much going on"; Apple-style chapters Nov 3): exactly the 5 LEARN_HIGHLIGHTS
//     sections, each with at most 3 chips and a real shot (no drawn placeholder art anywhere); 5 FAQs picked from LEARN_FAQ, safety
//     first; no feature finder, a nav of <= 5 anchors; one motion language (fade + scale in, hero zoom-out), one pinned feature;
//     hrefs are internal paths that exist or futbolisland.app;
//  3b. the See it in action carousel (Nov 3): 9 cards max in order, one-sentence captions from the feature copy, bold via
//     markers (no HTML), snap CSS on the row only, only the active card plays, preload rules, a11y attributes, no scroll reads;
//  5. a built site (NEXT_DIST_DIR or .next, when it holds /learn): every highlight, the 5 FAQ questions and answers and the
//     3 friend steps are in the HTML; FAQPage JSON-LD matches the 5 shown; old /learn/<id> pages are not built.
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
const {LEARN_FEATURES:F,LEARN_GROUPS:G,LEARN_FAQ:ALLQ,LEARN_FAQ_TOP:TOP,LEARN_HIGHLIGHTS:HL,LEARN_CAROUSEL:CAR,learnBoldParts,learnPlain}=L('lib/site/learnFeatures.ts');
const Q=TOP.map(q=>ALLQ.find(x=>x.q===q));

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
assert.match(enh,/const PLAY_AT=\.25;/,'a clip plays once >= 25 % visible (Nov 3: start sooner, like apple.com)');
assert.match(enh,/>=PLAY_AT/,'the play threshold is used');
assert.match(enh,/const AHEAD='150% 0px 150% 0px';/,'clips buffer ahead ~1.5 screens before they scroll in');
assert.match(enh,/if\(!e\.isIntersecting\|\|calm\)continue;/,'no buffering ahead in calm mode (Save-Data, slow network, battery saver)');
assert.match(enh,/\[data-panel\]:not\(\[data-on\]\)/,'a clip in a hidden friends panel never plays');
assert.doesNotMatch(enh,/currentTime/,'no video scrubbing');
assert.match(enh,/visibilitychange/,'clips pause when the tab is hidden');
assert(!has('components/learn/FeatureFinder.tsx'),'the Find a feature finder is gone');
for(const f of ['components/learn/LearnEnhance.tsx','components/learn/FriendSteps.tsx','components/learn/ShareLink.tsx','components/learn/ReelEnhance.tsx','components/learn/LearnReel.tsx']){const src=strip(read(f));
 assert.doesNotMatch(src,/getBoundingClientRect|offsetTop|scrollY|pageYOffset|scrollTo\(|preventDefault\(\)[^;]*wheel|['"]wheel['"]/,`${f}: no layout reads while scrolling, no scroll-jacking`);
 assert.doesNotMatch(src,/addEventListener\(\s*['"]scroll['"]|onScroll|onscroll/,`${f}: no scroll listeners`);
 assert.doesNotMatch(src,/framer-motion|gsap|animejs|react-spring|lottie/,`${f}: no animation library`);}
assert.doesNotMatch(enh,/getBoundingClientRect|offsetTop|scrollY|pageYOffset/,'LearnEnhance reads no layout while scrolling (IO entry rects only)');
const css=read('components/learn/learn.module.css');
assert.match(css,/@supports\(animation-timeline:view\(\)\)/,'CSS scroll-driven path');
assert.match(css,/\.root\[data-lm-io\]/,'IntersectionObserver fallback path');
assert.match(css,/\.root\[data-calm\] \*,[^{]*\{animation:none!important;transition:none!important\}/,'calm kills every animation');
assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{\.root \*,[^{]*\{animation:none!important;transition:none!important\}\}/,'reduced motion kills every animation, even before JS');
{const kf=[...css.matchAll(/@keyframes (\w+)\{([\s\S]*?\})\}/g)];assert.deepEqual(kf.map(k=>k[1]).sort(),['chrome','heroZoom','rise'],'one motion language: fade + scale in, hero zoom-out (+ the sub-nav chrome fade)');
 for(const [,name,body] of kf){const props=[...body.matchAll(/([a-z-]+):/g)].map(m=>m[1]).filter(p=>!['transform','opacity','box-shadow','background','color'].includes(p));
  assert.deepEqual(props,[],`@keyframes ${name} animates transform / opacity only`);
  assert.doesNotMatch(body,/box-shadow|background|color/,`@keyframes ${name}: transform / opacity only`);}
 // Nov 3 restyle: the sub-nav plus at most one pinned feature (the friends media); no word-by-word headline, no snap scrolling
 assert((css.match(/position:sticky/g)||[]).length<=2,'sticky: the sub-nav and one pinned feature at most');
 assert.doesNotMatch(css,/\.word\b/,'no word-by-word headline');
 // scroll snap only on the See it in action row (horizontal, Nov 3); never on the page itself (no vertical scroll-jacking)
 {const snaps=[...strip(css).matchAll(/([^{}]+)\{[^{}]*scroll-snap-type:([^;}]+)/g)].map(m=>[m[1].trim(),m[2].trim()]);
  assert.deepEqual(snaps,[['.reelRow','x mandatory']],'scroll-snap-type only on the carousel row, x mandatory');}
 // owner, Nov 3: IslandBrush only on the gold Play buttons; everything else is the system sans
 for(const m of strip(css).matchAll(/([^{}]+)\{[^{}]*IslandBrush[^{}]*\}/g))assert.match(m[1].trim(),/^\.(cta|pill)$|^\.root \.logo$/,`IslandBrush only on Play buttons and the logo wordmark, not ${m[1].trim()}`);
 assert.match(css,/--sans:-apple-system,/,'system sans stack, no web font download');}
const media=read('components/learn/LearnMedia.tsx');
assert.match(media,/<video [^>]*muted loop playsInline preload=\{eager\?'auto':'none'\}/,'clips: muted, loop, playsinline, preload none (auto for the hero only; LearnEnhance buffers the next one ahead)');
assert.match(media,/srcSet=/,'stills carry srcset + sizes, ready for sharper captures');
assert.doesNotMatch(media,/<video [^>]*poster=/,'no video poster: a poster downloads at once even with preload none (the lazy still underneath is the poster)');
assert.match(strip(media),/video\/mp4[\s\S]*video\/webm/,'mp4 (H.264, hardware-decoded on phones) first, then webm (Nov 3)');
assert.match(media,/data-lv-btn/,'every clip has a pause / play button');
assert.match(media,/if\(!a\.image\)return null;/,'no still = no picture at all (no drawn placeholder art)');
assert.doesNotMatch(media,/Fallback|fbGlyph|gradient/,'no drawn fallback card');
const lm=read('lib/site/learnMedia.ts');
assert.match(lm,/catch\{return out;\}/,'a missing or broken manifest is tolerated');
{const M=L('lib/site/learnMedia.ts');const a=M.learnAsset('definitely_not_captured_xyz');assert(!a.image&&!a.clip,'a missing shot falls back');
 for(const f of F){const x=M.learnAsset(f.imageKey);if(x.image){assert(x.image.width>0&&x.image.height>0,`${f.imageKey}: size`);assert(has('public'+x.image.src),`${f.imageKey}: file`);}}
 // QA Nov 2: the capture pass named shots by what they show; every LEARN_SHOT alias must point at a real still, and most features get one
 for(const [k,v] of Object.entries(M.LEARN_SHOT))assert(has(`public/learn/${v}.webp`),`LEARN_SHOT ${k} -> ${v}: still exists`);
 assert(F.filter(f=>M.learnAsset(f.imageKey).image).length>=24,'at least 24 features show a real still (not the drawn card)');
 // public/learn stays small enough to deploy (brief: under 40 MB since the Nov 3 hero montage, 3 sizes; clips under 36 MB).
 // Only the montage may pass 2 MB per file (montage_l.mp4 <= 4.5 MB, montage_m <= 2.2 MB, montage_s <= 1.1 MB).
 const walk=d=>fs.existsSync(d)?fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]):[];
 const files=walk(path.join(root,'public/learn')),size=f=>fs.statSync(f).size;
 const total=files.reduce((t,f)=>t+size(f),0),clips=files.filter(f=>/\.(mp4|webm)$/.test(f)).reduce((t,f)=>t+size(f),0);
 assert(total<40e6,`public/learn is ${(total/1e6).toFixed(1)} MB (< 40 MB)`);assert(clips<36e6,`clips ${(clips/1e6).toFixed(1)} MB (< 36 MB)`);
 const cap={'montage_l.mp4':4.5e6,'montage_m.mp4':2.2e6,'montage_s.mp4':1.1e6};
 for(const f of files.filter(f=>/\.(mp4|webm)$/.test(f))){const b=path.basename(f);assert(size(f)<=(cap[b]||2e6),`${b} is ${(size(f)/1e6).toFixed(2)} MB (cap ${((cap[b]||2e6)/1e6)} MB)`);}}

// ---- 3b. See it in action: the horizontal clip carousel (Nov 3 2026) ----------------------------------------------------------
{const reel=read('components/learn/LearnReel.tsx'),rx=strip(read('components/learn/ReelEnhance.tsx')),M=L('lib/site/learnMedia.ts');
 assert.match(read('components/learn/ReelEnhance.tsx'),/^'use client';/,'ReelEnhance is a client island');
 // data: 9 cards in the owner's order, one sentence each, <= 22 words, bold via markers, facts from the linked feature
 assert.equal(CAR.map(c=>c.key).join(),'fishing,diving,vending,museum,arcade,books,cards,npc,multiplayer','9 cards in order');
 for(const c of CAR){const t=learnPlain(c.caption),f=F.find(x=>x.id===c.feature);assert(f,`${c.key}: feature ${c.feature} exists`);
  assert(t.split(/\s+/).length<=22,`${c.key}: caption <= 22 words`);assert.equal(t.split(/(?<=[.!?])\s+/).length,1,`${c.key}: one sentence`);
  assert.match(t,/\.$/,`${c.key}: ends with a full stop`);assert.equal((c.caption.match(/\*\*/g)||[]).length%2,0,`${c.key}: bold markers pair up`);
  const bold=learnBoldParts(c.caption).filter(p=>p.bold);assert(bold.length>=1&&bold.length<=2,`${c.key}: one or two bold phrases`);
  assert(/football|lesson|club|team|offside|skill|position|ball/i.test(t),`${c.key}: has the football tie`);
  for(const n of t.match(/\d+/g)??[])assert([f.hook,f.description,f.proof,f.footballTie].join(' ').includes(n),`${c.key}: number ${n} comes from the feature copy`);
  assert(!/[<>]/.test(c.caption),`${c.key}: no markup in captions`);}
 assert.deepEqual(JSON.parse(JSON.stringify(learnBoldParts('a **b** c'))),[{text:'a ',bold:false},{text:'b',bold:true},{text:' c',bold:false}],'bold parser');
 assert.doesNotMatch(reel+read('app/(site)/learn/page.tsx'),/dangerouslySetInnerHTML/,'captions are text nodes, never HTML');
 // media: a card without its manifest entry + poster renders nothing (no placeholder art), the section disappears with no cards
 assert.equal(M.learnWideAsset('definitely_not_captured_xyz'),null,'missing wide clip = no card');
 assert.match(reel,/\.filter\(\(x\)[^\n]*=>!!x\.a\)\.slice\(0,9\)/,'missing cards are skipped, 9 at most');
 assert.match(reel,/if\(!cards\.length\)return null;/,'no cards = no section');
 assert.match(read('lib/site/learnMedia.ts'),/if\(!m\|\|!exists\(still\)\)return null;/,'a card needs its manifest entry and poster');
 assert.match(read('app/(site)/learn/page.tsx'),/<LearnReel\/>\s*\n\s*\{\/\* ---- 2-3\. learn, explore/,'the carousel sits right after the hero');
 // a11y
 assert.match(reel,/role="region" aria-roledescription="carousel" aria-label="[^"]+" tabIndex=\{0\}/,'row: region, carousel, labelled, focusable');
 assert.match(reel,/role="group" aria-roledescription="slide" aria-label=\{`\$\{i\+1\} of \$\{n\}: /,'cards: group "n of N"');
 assert.match(reel,/aria-label="Previous clip"/,'prev has a label');assert.match(reel,/aria-label="Next clip"/,'next has a label');
 assert.match(reel,/aria-label=\{`Play the clip: /,'play / pause has a label');
 assert.match(rx,/ArrowRight[\s\S]*ArrowLeft[\s\S]*Home[\s\S]*End/,'arrow keys, Home and End on the focused row');
 assert.match(rx,/prev\.disabled=i<=0;if\(next\)next\.disabled=i>=cards\.length-1;/,'arrows disabled at the ends');
 // behaviour + heat
 assert.match(reel,/<video [^>]*data-rv="" muted loop playsInline preload="none"/,'carousel clips: muted, loop, inline, preload none');
 assert.doesNotMatch(reel,/<video [^>]*(poster=|autoPlay)/,'no poster attribute, no autoplay attribute');
 assert.match(strip(reel),/video\/mp4[\s\S]*video\/webm/,'mp4 first, then webm');
 assert.match(rx,/const MAX_PLAYING=2;/,'at most 2 carousel clips (calm, tapped)');
 assert.match(rx,/calm\?started\.slice\(-MAX_PLAYING\):paused\?\[\]:\[active\]/,'only the active card plays (calm: only the tapped cards, 2 at most)');
 assert.match(rx,/const NEAR='150% 0px 150% 0px';/,'preload ahead from ~1.5 screens');
 assert.match(rx,/near=true;raise\(active\);raise\(active\+1\);/,'when near: the active + next card preload');
 assert.match(rx,/if\(!v\|\|calm\|\|!near\)return;/,'no preloading in calm mode or before the row is near');
 assert.match(rx,/root:row,rootMargin:/,'active card from an IntersectionObserver on the row');
 assert.match(rx,/visibilitychange/,'pauses when the tab is hidden');
 assert.match(rx,/onScreen=e\.isIntersecting&&e\.intersectionRatio>=SHOW_AT/,'pauses when the row is off screen');
 assert.match(rx,/data-reel-playing/,'carousel clips count toward the page-wide cap');
 assert.match(strip(read('components/learn/LearnEnhance.tsx')),/slice\(0,Math\.max\(0,MAX_PLAYING-reelPlaying\(\)\)\)/,'the page clips leave room for the carousel clip');
 assert.match(rx,/behavior:reduce\?'auto':'smooth'/,'arrows scroll smoothly, instantly in calm / reduced motion');
 assert.doesNotMatch(rx,/currentTime|setInterval/,'no scrubbing, no timers');
 assert.doesNotMatch(rx,/getBoundingClientRect|scrollLeft|scrollX/,'no layout reads tied to scrolling');
 // CSS: snap aligned to the gutter, peeking cards, arrows and play buttons only with JS
 assert.match(css,/\.reelRow\{[^}]*scroll-snap-type:x mandatory;scroll-padding-left:var\(--rpad\)/,'snap row, padding at the content gutter');
 assert.match(css,/\.card\{flex:0 0 var\(--cw\);scroll-snap-align:start/,'cards snap at their start');
 assert.match(css,/--cw:min\(1100px,78vw,/,'desktop card width');assert.match(css,/--cw:86vw/,'phone card width');
 assert.match(css,/\.reelCtl\{display:none;/,'arrows hidden without JS');assert.match(css,/\.reel\[data-js\] \.reelCtl\{display:flex\}/,'arrows shown with JS');
 assert.match(css,/\.card\[data-active\] \.cap\{color:var\(--ink\)\}/,'active caption dark (inactive grey)');
 assert.match(css,/\.reel\[data-js\]\[data-calm\] \.reelPlay/,'calm mode: a Play button on every card');}

// ---- 4. content -----------------------------------------------------------------------------------------------------------------
assert.equal(HL.map(h=>h.id).join(),'top,learn,explore,together,safe','five sections');
for(const h of HL){assert(h.chips.length<=3,`${h.id}: at most 3 chips`);assert(h.title&&h.line&&h.line.length<=80,`${h.id}: one headline, one short line`);
 assert(has(`public/learn/${h.shot}.webp`),`${h.id}: shot ${h.shot} is a real still`);for(const id of h.features)assert(F.some(f=>f.id===id),`${h.id}: feature ${id} exists`);}
for(const h of HL.slice(1))assert(page.includes(`hl('${h.id}')`),`section ${h.id} rendered`);
assert(has('public/learn/town_overview.webp')&&HL[0].shot==='town_overview','hero uses the town overview shot');
assert.equal(Q.length,5,'5 FAQs');for(const q of Q)assert(q,'every LEARN_FAQ_TOP question exists in LEARN_FAQ');
assert.equal(TOP.slice(0,4).join('|'),'Is Futbol Island free?|Are there ads?|Can my child chat with other people?|Does my child need an account?','safety FAQs first');
assert.match(page,/mainEntity:FAQ\.map/,'FAQ JSON-LD is built from the shown FAQs');
assert.match(page,/<details key=\{q\.q\} className=\{s\.faq\}><summary>/,'FAQ is details / summary');
assert.doesNotMatch(page,/FeatureFinder|LEARN_GROUPS|data-pin|IslandArt|Jersey/,'no finder, no 7 group sections, no drawn art');
{const nav=page.match(/const NAV:[^=]*=(\[.*\]);/);assert(nav,'NAV');assert(JSON.parse(nav[1].replace(/'/g,'"')).length<=5,'nav: <= 5 anchors');}
assert.match(page,/<FriendSteps /,'the 3-step play-with-a-friend pinned feature');
assert.match(page,/LEARN_GROWNUP_LINE/,'grown-ups stay in charge: one line');
{const hrefs=[...page.matchAll(/href=(?:"([^"]+)"|\{`([^`]+)`\})/g)].map(m=>m[1]??m[2]);
 const ok=new Set(['/about','/privacy','#together']);
 for(const h of hrefs){if(h.startsWith('#'))continue;assert(ok.has(h)||h.startsWith('#')||/^https:\/\/futbolisland\.app\//.test(h),`link ${h} is known`);}
 for(const id of ['/about','/privacy'])assert(has(`app/(site)${id}`)||has(`app${id}`),`${id} route exists`);}

// ---- 5. built site --------------------------------------------------------------------------------------------------------------
const dist=path.join(root,process.env.NEXT_DIST_DIR||'.next'),built=path.join(dist,'server/app/learn.html');
if(!fs.existsSync(built)){console.log(`learn page sources ok: ${HL.length} sections, ${Q.length} FAQ (data: ${F.length} features, ${G.length} groups)`);console.log(`  SKIP built-page checks: no /learn in ${path.relative(root,dist)} (build with NEXT_DIST_DIR to run them)`);process.exit(0);}
const html=fs.readFileSync(built,'utf8');
const text=html.replace(/<script[\s\S]*?<\/script>/g,' ').replace(/<style[\s\S]*?<\/style>/g,' ').replace(/<[^>]+>/g,' ').replace(/&#x27;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/\s+/g,' ');
const norm=x=>x.replace(/\s+/g,' ');
for(const h of HL){assert(text.includes(norm(h.title)),`section title: ${h.title}`);assert(text.includes(norm(h.line)),`section line: ${h.id}`);for(const c of h.chips)assert(text.includes(c),`chip: ${c}`);}
for(const q of Q){assert(text.includes(norm(q.q)),`FAQ q: ${q.q}`);assert(text.includes(norm(q.a)),`FAQ a: ${q.q}`);}
assert(!/class="[^"]*fallback/.test(html),'no drawn fallback art in the HTML');
for(const st of F.find(f=>f.id==='party-start').steps)assert(text.includes(norm(st.line)),`step: ${st.line}`);
const ld=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
const faq=ld.find(x=>x['@type']==='FAQPage');assert(faq,'FAQPage JSON-LD');
assert.deepEqual(faq.mainEntity.map(e=>[e.name,e.acceptedAnswer.text]),JSON.parse(JSON.stringify(Q.map(q=>[q.q,q.a]))),'FAQPage JSON-LD matches the 5 shown FAQs');
assert(ld.some(x=>x['@type']==='BreadcrumbList'),'BreadcrumbList');
assert.match(html,/<link rel="canonical" href="https:\/\/futbolisland\.app\/learn"\/>/,'canonical');
assert.match(html,/<meta property="og:image" content="[^"]*opengraph-image\.png"/,'OG image');
assert.equal((html.match(/<h1[ >]/g)||[]).length,1,'one h1');
{const vs=[...html.matchAll(/<video [^>]*>/g)].map(m=>m[0]);
 for(const v of vs)assert(/muted/.test(v)&&/loop/.test(v)&&/playsInline|playsinline/.test(v)&&/preload="(none|auto)"/.test(v)&&!/poster=/.test(v),'built video attrs');
 assert.equal(vs.filter(v=>/preload="auto"/.test(v)).length,1,'only the hero clip preloads in full');}
{const M=L('lib/site/learnMedia.ts'),live=CAR.filter(c=>M.learnWideAsset(c.key));
 const cards=html.match(/aria-roledescription="slide"/g)||[];
 assert.equal(cards.length,live.length,`carousel: ${live.length} cards (one per wide clip on disk + in the manifest)`);
 assert(cards.length<=9,'carousel: 9 cards at most');
 if(live.length){assert.match(html,/role="region" aria-roledescription="carousel"/,'carousel region');
  {const flat=text.replace(/\s+/g,"");for(const c of live)assert(flat.includes(learnPlain(c.caption).replace(/\s+/g,"")),`caption: ${c.key}`);}
  const rv=[...html.matchAll(/<video [^>]*data-rv=""[^>]*>/g)].map(m=>m[0]);assert(rv.every(v=>/preload="none"/.test(v)),'carousel clips preload none in the HTML');
  assert(html.indexOf('id="reel-h"')<html.indexOf('id="learn-h"'),'the carousel sits before the Learn chapter');}
 else assert(!/id="reel-h"/.test(html),'no wide clips yet = no carousel section');}
assert(!fs.existsSync(path.join(dist,'server/app/learn',lessons.LESSONS[0].id+'.html')),'old /learn/<id> pages are not built');
assert(fs.existsSync(path.join(dist,'server/app/learn/lessons',lessons.LESSONS[0].id+'.html')),'lessons are built under /learn/lessons');
console.log(`learn page ok: ${HL.length} sections, ${Q.length} FAQ, ${(html.match(/<video /g)||[]).length} clips, ${(html.match(/src="\/learn\/[a-z0-9_]+\.webp"/g)||[]).length} stills in ${path.relative(root,dist)}`);
