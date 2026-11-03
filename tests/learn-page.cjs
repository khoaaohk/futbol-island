// The feature tour, the HOME page `/` since Nov 3 2026 (it was /learn from Nov 2; app/(site)/page.tsx + components/learn/*;
// /learn now 308-redirects to `/`, the game moved from `/` to /play). Checks:
//  1. routes: `/` is the tour, the lesson index moved to /learn/lessons (+ [slug]), old /learn/<id> redirects permanently
//     (and /learn/lessons itself is not caught by that redirect); sitemap and llms files list both;
//  2. links into /learn: title-screen bottom row, site footer, about page, in-game Grown-ups panel (new tab, rel noopener);
//  3. heat + motion: one client island for behaviour with reduced-motion, Save-Data, slow-network and Battery saver branches,
//     IntersectionObserver only (no scroll listeners, no getBoundingClientRect), max 2 clips, pause when hidden; CSS has the
//     scroll-driven path, the IO fallback path and the calm / reduced-motion kill switch; clips are muted, looped, inline,
//     preload="none" (auto for the hero only), play at >= 25 % visible, buffer ~1.5 screens ahead except in calm mode;
//     the media module tolerates a missing manifest and missing files; IslandBrush only on the Play buttons (Nov 3, owner);
//  4. content (simplified Nov 2 2026, owner "too much going on"; Apple-style chapters Nov 3): exactly the 6 LEARN_HIGHLIGHTS
//     (the light "Fuel up" chapter, Nov 3: after Explore, before Play with friends, its 16:9 Konbini clip in the large film frame
//     with a 1280px <source media> for phones, copy only from docs/learn-konbini-facts.md),
//     sections, each with at most 3 chips and a real shot (no drawn placeholder art anywhere); 5 FAQs picked from LEARN_FAQ, safety
//     first; no feature finder, a nav of <= 5 anchors; one motion language (fade + scale in, hero zoom-out), one pinned feature;
//     hrefs are internal paths that exist or futbolisland.app;
//  3b. the See it in action carousel (Nov 3): 9 cards max in order, one-sentence captions from the feature copy, bold via
//     markers (no HTML), snap CSS on the row only, only the active card plays, preload rules, a11y attributes, no scroll reads;
//  3c. (Nov 3) the full-bleed montage (one <video>, s / m / l as <source media> alternatives so one file is fetched, preload none,
//     30 % play threshold, page-wide cap), the light Even more to explore slideshow (<= 6 slides in order, auto-advance gated on
//     visibility / pause / hover / focus / calm, only the active slide plays, centre snap, no scroll reads), the dark sub-nav over
//     dark chapters (IntersectionObserver markers), friend steps 1 and 2 with their own 16:9 shots;
//  5. a built site (NEXT_DIST_DIR or .next, when it holds /learn): every highlight, the 5 FAQ questions and answers and the
//     3 friend steps are in the HTML; FAQPage JSON-LD matches the 5 shown; old /learn/<id> pages are not built; montage and
//     slideshow order and sources.
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
assert(!has('app/(site)/learn/page.tsx')&&!has('app/page.tsx'),'the tour is the home page: no /learn page, no root app/page.tsx');
for(const f of ['app/(site)/page.tsx','app/play/page.tsx','app/(site)/learn/lessons/page.tsx','app/(site)/learn/lessons/[slug]/page.tsx'])assert(has(f),`${f} exists`);
assert(!has('app/(site)/learn/[slug]'),'the old /learn/[slug] route is gone (moved to lessons/[slug])');
const page=read('app/(site)/page.tsx');
assert.match(page,/export const dynamic='force-static';/,'the home page is static');
assert.match(page,/pageMeta\(TITLE,DESC,'\/',\{whole:true,type:'website'\}\)/,'the home page has its own metadata and canonical /');
assert.match(page,/const PLAY_URL=PLAY_PATH;/,'Play goes to the game');assert.equal(L('lib/site/seo.ts').PLAY_PATH,'/play','the game is at /play');
assert.match(read('app/(site)/learn/lessons/page.tsx'),/pageMeta\('Football lessons',DESC,'\/learn\/lessons'\)/,'the lesson index canonical is /learn/lessons');
const lessons=L('lib/site/lessons.ts');
assert.equal(lessons.lessonPath('x'),'/learn/lessons/x','lesson pages live under /learn/lessons');
const nc=read('next.config.mjs');
const red=nc.match(/const redirects = \[(.*)\];/);assert(red,'next.config.mjs has redirects');
assert.match(red[1],/source: '\/learn\/:slug\(\(\?!lessons\$\)[^']+'/,'old lesson URLs redirect, /learn/lessons excluded');
assert.match(red[1],/destination: '\/learn\/lessons\/:slug', permanent: true/,'permanent redirect to /learn/lessons/<id>');
assert.match(nc,/async redirects\(\) \{ return redirects; \}/,'redirects are wired into the config');
assert.match(red[1],/\{ source: '\/learn', destination: '\/', permanent: true \}/,'/learn is a permanent redirect to the home page /');
{const re=new RegExp('^/learn/(?:'+red[1].match(/:slug\((.*)\)', destination/)[1]+')$');
 for(const l of lessons.LESSONS)assert(re.test('/learn/'+l.id),`old URL /learn/${l.id} is caught by the redirect`);
 assert(!re.test('/learn/lessons'),'/learn/lessons is not redirected');}
const paths=L('lib/site/paths.ts').sitePaths();
assert(!paths.some(p=>p.path==='/learn'),'/learn (a redirect) is not in the sitemap');assert.equal(paths.find(p=>p.path==='/')?.priority,1,'the tour (/) is the main entry');
assert(paths.some(p=>p.path==='/learn/lessons'),'/learn/lessons in the sitemap');
assert(!paths.some(p=>/^\/learn\/(?!lessons)[^/]+$/.test(p.path)),'no old /learn/<id> path in the sitemap');
const llms=read('public/llms.txt');
assert.match(llms,/\(https:\/\/futbolisland\.app\/\): the feature tour/,'llms.txt describes / as the feature tour');assert.match(llms,/\(https:\/\/futbolisland\.app\/play\): the title screen/,'llms.txt: /play is the game');assert.doesNotMatch(llms,/futbolisland\.app\/learn\)/,'llms.txt: no /learn link');
assert.match(llms,/\(https:\/\/futbolisland\.app\/learn\/lessons\): every lesson/,'llms.txt points the lesson index at /learn/lessons');
const full=read('app/llms-full.txt/route.ts');
assert(full.includes("abs('/')")&&full.includes("abs('/play')")&&full.includes("abs('/learn/lessons')")&&!full.includes("abs('/learn')"),'llms-full.txt lists the tour (/), the game (/play) and the lesson index');

// ---- 2. links into the tour (/) -------------------------------------------------------------------------------------------------------
assert.doesNotMatch(read('components/landing/GrownUps.tsx'),/What’s inside/,'title screen bottom row: no What’s inside link (owner, Nov 3)');
assert.match(read('components/landing/Landing.tsx'),/<LandingBack\/>/,'title screen: the game Back button at the top-left');
assert.match(read('components/landing/LandingBack.tsx'),/BackButton[\s\S]*assign\('\/'\)/,'title screen Back goes to the home page /');
assert.match(read('app/(site)/layout.tsx'),/<a href="\/">What’s inside<\/a>\s*<a href="\/privacy">Privacy<\/a>/,'site footer: What’s inside (/) beside Privacy');
assert.match(read('components/learn/learn.module.css'),/:global\(\[data-reading-page\]\):has\(\.root\) :global\(footer\) a\[href="\/"\]\{display:none\}/,'the tour hides the footer link to itself');
assert.doesNotMatch(read('app/(site)/layout.tsx').replace(/\{\/\*[\s\S]*?\*\/\}/g,''),/<header[\s\S]*href="\/(learn|play)"[\s\S]*<\/header>/,'no section navigation in the header (Oct 16 2026)');
assert.match(read('app/(site)/about/page.tsx'),/<a href="\/">See what’s inside the game<\/a>/,'about links to the tour at /');assert.match(read('app/(site)/about/page.tsx'),/className=\{styles\.cta\} href="\/play"/,'about Play goes to /play');
assert.match(read('components/GrownUps.tsx'),/<a href="\/" target="_blank" rel="noopener">futbolisland\.app<\/a>/,'in-game Grown-ups panel links to the tour (/) in a new tab');
assert.match(page,/href=\{PLAY_URL\}/,'the tour links to Play');assert.match(page,/<a className=\{s\.logo\} href="\/"/,'the logo goes home (/)');assert.match(page,/<NavPlay className=\{s\.pill\} href=\{PLAY_URL\}\/>/,'the bar Play goes to /play');

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
for(const f of ['components/learn/LearnEnhance.tsx','components/learn/FriendSteps.tsx','components/learn/ReelEnhance.tsx','components/learn/LearnReel.tsx',
 'components/learn/LearnMontage.tsx','components/learn/MontageEnhance.tsx','components/learn/LearnSlides.tsx','components/learn/SlidesEnhance.tsx','components/learn/MobileMenu.tsx']){const src=strip(read(f));
 assert.doesNotMatch(src,/getBoundingClientRect|offsetTop|scrollY|pageYOffset|scrollTo\(|preventDefault\(\)[^;]*wheel|['"]wheel['"]/,`${f}: no layout reads while scrolling, no scroll-jacking`);
 assert.doesNotMatch(src,/addEventListener\(\s*['"]scroll['"]|onScroll|onscroll/,`${f}: no scroll listeners`);
 assert.doesNotMatch(src,/framer-motion|gsap|animejs|react-spring|lottie/,`${f}: no animation library`);}
assert.doesNotMatch(enh,/getBoundingClientRect|offsetTop|scrollY|pageYOffset/,'LearnEnhance reads no layout while scrolling (IO entry rects only)');
const css=read('components/learn/learn.module.css');
assert.match(css,/@supports\(animation-timeline:view\(\)\)/,'CSS scroll-driven path');
assert.match(css,/\.root\[data-lm-io\]/,'IntersectionObserver fallback path');
assert.match(css,/\.root\[data-calm\] \*,[^{]*\{animation:none!important;transition:none!important\}/,'calm kills every animation');
assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{\.root \*,[^{]*\{animation:none!important;transition:none!important\}\}/,'reduced motion kills every animation, even before JS');
{const kf=[...css.matchAll(/@keyframes (\w+)\{([\s\S]*?\})\}/g)];assert.deepEqual(kf.map(k=>k[1]).sort(),['chrome','fill','heroZoom','menuIn','ring','rise'],'one motion language: fade + scale in, hero zoom-out (+ the sub-nav chrome fade, the phone menu slide-down, the slideshow dot fill, the montage ring)');
 // the one exception (Nov 3, brief): the montage button's 44px progress ring animates stroke-dashoffset (a tiny repaint, paused with the clip)
 assert.match(css,/@keyframes ring\{from\{stroke-dashoffset:100\}to\{stroke-dashoffset:0\}\}/,'montage ring: stroke-dashoffset on the 44px button only');
 assert.equal((css.match(/animation:ring /g)||[]).length,1,'the ring animation is used once (the montage button)');
 for(const [,name,body] of kf.filter(k=>k[1]!=='ring')){const props=[...body.matchAll(/([a-z-]+):/g)].map(m=>m[1]).filter(p=>!['transform','opacity','box-shadow','background','color'].includes(p));
  assert.deepEqual(props,[],`@keyframes ${name} animates transform / opacity only`);
  assert.doesNotMatch(body,/box-shadow|background|color/,`@keyframes ${name}: transform / opacity only`);}
 // Nov 3 restyle: the sub-nav plus at most one pinned feature (the friends media); no word-by-word headline, no snap scrolling
 assert((css.match(/position:sticky/g)||[]).length<=2,'sticky: the sub-nav and one pinned feature at most');
 assert.doesNotMatch(css,/\.word\b/,'no word-by-word headline');
 // scroll snap only on the See it in action row (horizontal, Nov 3); never on the page itself (no vertical scroll-jacking)
 {const snaps=[...strip(css).matchAll(/([^{}]+)\{[^{}]*scroll-snap-type:([^;}]+)/g)].map(m=>[m[1].trim(),m[2].trim()]);
  assert.deepEqual(snaps,[['.reelRow','x mandatory'],['.slideRow','x mandatory']],'scroll-snap-type only on the carousel and slideshow rows, x mandatory');}
 // owner, Nov 3: IslandBrush only on the gold Play buttons; everything else is the system sans
 for(const m of strip(css).matchAll(/([^{}]+)\{[^{}]*IslandBrush[^{}]*\}/g))assert.match(m[1].trim(),/^\.(cta|pill)$|^\.root \.logo$/,`IslandBrush only on Play buttons and the logo wordmark, not ${m[1].trim()}`);
 assert.match(css,/--sans:-apple-system,/,'system sans stack, no web font download');}
const media=read('components/learn/LearnMedia.tsx');
assert.match(media,/<video [^>]*muted loop playsInline preload=\{eager\?'auto':'none'\}/,'clips: muted, loop, playsinline, preload none (auto for the hero only; LearnEnhance buffers the next one ahead)');
assert.match(media,/srcSet=/,'stills carry srcset + sizes, ready for sharper captures');
// Nov 3, 4:5 captures: a phone (<= 640px) fetches only the 720px still and clip, wider screens only the 1080px ones
assert.match(media,/<picture><source media="\(max-width: 640px\)" srcSet=\{m\.src\}/,'4:5 stills: the 720px file for viewports <= 640px');
assert.match(strip(media),/\{a\.clip\.mp4m&&<source media=\{a\.image\.m\?'\(max-width: 640px\)':'\(max-width: 1280px\)'\} src=\{a\.clip\.mp4m\}[^\n]*\n\s*\{a\.clip\.mp4&&<source src=\{a\.clip\.mp4\}/,'clips: the smaller source first (media): 720px for 4:5 shots (<= 640px), 1280px for 16:9 chapter clips (<= 1280px), then the full-size one');
assert.match(read('components/learn/LearnEnhance.tsx'),/slowLink\(\)\)for\(const v of vids\)[^\n]*source\[media="\(max-width: 640px\)"\]/,'Save-Data / 2g / 3g keep only the 720px clip');
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
 // public/learn stays small enough to deploy (brief: under 56 MB since the Nov 3 feature slideshow clips, slide_* in 2 sizes; clips under 50 MB).
 // Only the montage may pass 2 MB per file (montage_l.mp4 <= 4.5 MB, montage_m <= 2.2 MB, montage_s <= 1.1 MB).
 const walk=d=>fs.existsSync(d)?fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]):[];
 const files=walk(path.join(root,'public/learn')),size=f=>fs.statSync(f).size;
 const total=files.reduce((t,f)=>t+size(f),0),clips=files.filter(f=>/\.(mp4|webm)$/.test(f)).reduce((t,f)=>t+size(f),0);
 // Nov 3: + the 4:5 re-captures (~9.7 MB, both sizes) while the old 390x844 files still sit beside them (removal pending): 46 / 42 MB.
 // Nov 3 merge with the Fuel up clip: 52 / 48 MB (the slides, ~14 MB, and the old 390x844 files to delete, are the next reconcile; big files move to R2 after)
// Nov 3 merge with the feature slideshow clips (~12.6 MB): 64 / 58 MB until the old 390x844 files are deleted and the big files move to R2
// Nov 3: lesson_field_45 re-cut as a 16 s four-surface clip (paths, story, lesson, quiz; was a 0.2 MB 8 s pitch clip): +2.9 MB → 66 / 61 MB
// Nov 3: the 9 "See it in action" clips re-captured at best quality (1920 at the lowest CRF under 2 MB, + a 1280 wide_*_m file each,
// 1920 posters; was 9 x ~1.4 MB): +13.3 MB → 78 / 73 MB. wide_cards is 16 s (collect + binder), so its pair may reach 3 / 1.5 MB.
assert(total<78e6,`public/learn is ${(total/1e6).toFixed(1)} MB (< 78 MB)`);assert(clips<73e6,`clips ${(clips/1e6).toFixed(1)} MB (< 73 MB)`);
 const cap={'montage_l.mp4':4.5e6,'montage_m.mp4':2.2e6,'montage_s.mp4':1.1e6,'town_overview_45.mp4':3.5e6,'wide_cards.mp4':3e6,'wide_cards_m.mp4':1.5e6};
 // 4:5 clips: 1080x1350 <= 2.5 MB (the hero 3.5 MB), their 720x900 phone file <= 1.2 MB
 const capOf=b=>cap[b]||(/_45_m\.mp4$/.test(b)?1.2e6:/_45\.mp4$/.test(b)?2.5e6:2e6);
 for(const f of files.filter(f=>/\.(mp4|webm)$/.test(f))){const b=path.basename(f);assert(size(f)<=capOf(b),`${b} is ${(size(f)/1e6).toFixed(2)} MB (cap ${(capOf(b)/1e6)} MB)`);}
 // the 4:5 re-captures: every LEARN_45 target is a 1080x1350 still with its 720x900 phone still, picked over the old shot
 for(const [k,v] of Object.entries(M.LEARN_45)){if(!has(`public/learn/${v}.webp`))continue;
  const x=M.learnAsset(Object.entries(M.LEARN_SHOT).find(([,s])=>s===k)?.[0]??k);
  assert.equal(x.image.src,`/learn/${v}.webp`,`${k}: the 4:5 still wins`);assert.deepEqual([x.image.width,x.image.height],[1080,1350],`${v}: 1080x1350`);
  assert.equal(x.image.m?.src,`/learn/${v}_m.webp`,`${v}: 720 phone still`);
  if(x.clip)assert.equal(x.clip.mp4m,`/learn/video/${v}_m.mp4`,`${v}: 720 phone clip`);}
 assert(M.learnAsset('lesson_quiz').image.src.endsWith('_45.webp'),'the Learn chapter shows its 4:5 capture');}

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
 assert.doesNotMatch(reel+read('app/(site)/page.tsx'),/dangerouslySetInnerHTML/,'captions are text nodes, never HTML');
 // media: a card without its manifest entry + poster renders nothing (no placeholder art), the section disappears with no cards
 assert.equal(M.learnWideAsset('definitely_not_captured_xyz'),null,'missing wide clip = no card');
 assert.match(reel,/\.filter\(\(x\)[^\n]*=>!!x\.a\)\.slice\(0,9\)/,'missing cards are skipped, 9 at most');
 assert.match(reel,/if\(!cards\.length\)return null;/,'no cards = no section');
 assert.match(read('lib/site/learnMedia.ts'),/if\(!m\|\|!exists\(still\)\)return null;/,'a card needs its manifest entry and poster');
 assert.match(read('app/(site)/page.tsx'),/<LearnReel\/>\s*\n\s*\{\/\* ---- 2-3\. learn, explore/,'the carousel sits right after the hero');
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

// ---- 3c. the montage, the Even more to explore slideshow, the dark sub-nav, the friend-step shots (Nov 3 2026) -------------------
{const M=L('lib/site/learnMedia.ts'),{LEARN_SLIDES:SL,LEARN_MONTAGE:LM}=L('lib/site/learnFeatures.ts');
 const mon=read('components/learn/LearnMontage.tsx'),mx=strip(read('components/learn/MontageEnhance.tsx'));
 const sli=read('components/learn/LearnSlides.tsx'),sx=strip(read('components/learn/SlidesEnhance.tsx')),enh2=strip(read('components/learn/LearnEnhance.tsx'));
 // montage: one <video> whose sources are media alternatives (one file fetched), poster ladder by srcset, preload none in the HTML
 assert.match(page,/<LearnMontage\/>\s*\n\s*\{\/\* ---- 1b\. See it in action[^\n]*\n\s*<LearnReel\/>/,'the montage sits right after the hero, before the carousel');
 assert.match(mon,/<video [^>]*data-mv="" muted loop playsInline preload="none"/,'montage clip: muted, loop, inline, preload none (raised when near)');
 assert.doesNotMatch(mon,/<video [^>]*(poster=|autoPlay)/,'montage: no poster attribute, no autoplay attribute');
 assert.match(mon,/<source media="\(max-width: 640px\)"[^>]*data-size="s"\/>\}\s*\n\s*\{md\?\.mp4&&<source media="\(max-width: 1280px\)"[^>]*data-size="m"\/>\}\s*\n\s*<source src=\{big\.mp4\}/,'montage: s / m / l as <source media> alternatives (only one is requested)');
 assert.match(mon,/srcSet=\{m\.sizes\.map/,'montage poster: the same size ladder through srcset');
 assert.match(mon,/if\(!m\)return null;/,'no montage files = no section');
 assert.match(mon,/pathLength=\{100\} data-ring=""/,'montage button: a progress ring');
 assert(LM.title.length<=40&&LM.line.length<=40,'montage: a short headline and one line under it');
 assert.match(mx,/const PLAY_AT=\.3;/,'montage plays at >= 30 % visible');
 assert.match(mx,/visibilitychange/,'montage pauses when the tab is hidden');
 assert.match(mx,/if\(calm\|\|!near\|\|v\.preload==='auto'\)return;/,'montage: no preloading in calm mode or before it is near');
 assert.match(mx,/slowLink\(\)[\s\S]*source\[data-size="s"\]/,'montage: Save-Data / 2g / 3g keep only the smallest file');
 assert.match(mx,/extPlaying\(page,ME\)<MAX_PLAYING/,'montage counts toward the page-wide cap of 2');
 assert.doesNotMatch(mx,/setInterval|requestAnimationFrame/,'montage: no timers, no frame loop (the ring is CSS)');
 {const M2=M.learnMontage();if(M2){assert.equal(M2.sizes[M2.sizes.length-1].key,'montage','montage: the 1920 size is last');assert(M2.sizes.every(x=>x.mp4&&has('public'+x.mp4)),'montage: every size has its clip on disk');}}
 // slideshow: data, placement, media
 assert.equal(SL.map(x=>x.key).join(),'stories,arcade,beachmatch,kit,collection,party','6 slides in order');
 for(const x of SL){const w=x.caption.split(/\s+/).length;assert(w<=14,`${x.key}: caption <= 14 words`);assert.equal(x.caption.split(/(?<=[.!?])\s+/).length,1,`${x.key}: one sentence`);
  assert(!/[<>*]/.test(x.caption),`${x.key}: plain text caption`);}
 assert.match(sli,/\.filter\(\(y\)[^\n]*=>!!y\.a\)\.slice\(0,6\)/,'missing slides are skipped, 6 at most');
 assert.match(sli,/if\(!slides\.length\)return null;/,'no slides = no section');
 assert.equal(M.learnSlideAsset('definitely_not_captured_xyz'),null,'missing slide = no slide');
 assert.match(page,/<Chapter h=\{together\} dark>[\s\S]*<\/Chapter>\s*\n\s*\{\/\* ---- 4b\. Even more[^\n]*\n\s*<LearnSlides\/>\s*\n\s*\{\/\* ---- 5\. safe/,'the slideshow sits after Play with friends, before Safe for kids');
 assert.match(sli,/<video [^>]*data-sv="" muted loop playsInline preload="none"/,'slide clips: muted, loop, inline, preload none');
 assert.match(sli,/<source media="\(max-width: 1280px\)" src=\{a\.clip\.mp4m\}/,'slides: the 1280px file for viewports <= 1280px');
 assert.match(sli,/role="region" aria-roledescription="carousel" aria-label="[^"]+" tabIndex=\{0\}/,'slide row: region, carousel, labelled, focusable');
 assert.match(sli,/aria-current=\{i===0\?'true':undefined\}/,'dots: aria-current on the active one');
 // slideshow behaviour + heat
 assert.match(sx,/const RUN_AT=\.5;/,'auto-advance only while >= 50 % of the section is on screen');
 assert.match(sx,/'data-run',n>1&&!calm&&!paused&&!hover&&!focus&&!hidden&&seen>=RUN_AT/,'auto-advance gated: visible, not paused / hovered / focused / calm, tab visible');
 assert.match(sx,/addEventListener\('animationend',onEnd\)/,'auto-advance on the dot bar\'s CSS animation end (no interval timer)');
 assert.doesNotMatch(sx,/setInterval|currentTime/,'slideshow: no interval, no scrubbing');
 assert.match(sx,/let want=!ok\?-1:calm\?started:paused\?-1:active;/,'only the active slide plays (calm: only the tapped one)');
 assert.match(sx,/extPlaying\(page,ME\)>=MAX_PLAYING/,'slides count toward the page-wide cap of 2');
 assert.match(sx,/root:row,rootMargin:/,'active slide from an IntersectionObserver on the row');
 assert.match(sx,/behavior:reduce\?'auto':'smooth'/,'programmatic moves are instant under reduced motion / calm');
 assert.match(sx,/const t=\(\(i%n\)\+n\)%n;/,'wraps last -> first');
 assert.match(sx,/ArrowRight[\s\S]*ArrowLeft[\s\S]*Home[\s\S]*End/,'arrow keys, Home and End on the focused row');
 assert.doesNotMatch(sx,/getBoundingClientRect|scrollLeft|scrollX/,'slideshow: no layout reads tied to scrolling');
 // CSS: a light section, centre snap, dimmed + scaled neighbours, controls only with JS, the fill bar runs only with data-run
 assert.match(css,/\.slides\{[^}]*background:var\(--paper\);color:var\(--ink\)\}/,'slideshow: the light (paper) section');
 assert.match(css,/\.slide\{flex:0 0 var\(--sw\);scroll-snap-align:center/,'slides snap centred');
 assert.match(css,/\.slides\[data-js\] \.slide:not\(\[data-active\]\) \.slideMedia\{opacity:\.55;transform:translateZ\(0\) scale\(\.94\)\}/,'neighbours dimmed .55 + scaled .94 (transform / opacity)');
 assert.match(css,/\.slides\[data-js\]\[data-run\]:not\(\[data-calm\]\) \.dot\[aria-current\] \.dotFill\{animation-play-state:running\}/,'the dot bar only fills while the slideshow runs');
 assert.match(css,/\.slideCtl\{display:none;/,'slideshow controls hidden without JS');
 // dark sub-nav: IO on markers inside dark chapters, a data attribute, no scroll reads
 assert.match(page,/<nav className=\{s\.subnav\}[^>]*data-subnav=""/,'the sub-nav is marked for the dark switch');
 assert.match(page,/\{dark&&<NavMark\/>\}/,'every dark chapter carries a nav marker');
 assert.match(enh2,/nav\.toggleAttribute\('data-dark',under\.size>0\)/,'the sub-nav gets data-dark from an IntersectionObserver');
 assert.match(css,/\.subnav\[data-dark\] \.navDark\{opacity:0\}/,'nav stays light over the soft tinted chapters (owner, Nov 3: no near-black)');
 // friend steps 1 and 2 show their own desktop shots (16:9 frame)
 assert.equal(M.LEARN_SHOT.friends_step_start,'friend_step1','step 1 shot');assert.equal(M.LEARN_SHOT.friends_step_code,'friend_step2','step 2 shot');
 assert.match(css,/\.frame169\{[^}]*aspect-ratio:16\/9\}/,'16:9 shots keep a 16:9 frame');
 // Nov 3: upright shots are 4:5 cards, the full content width on phones, never taller than min(80svh, 820px), no tan well around them
 assert.match(css,/--tallMax:min\(80svh,820px\)/,'tall cap min(80svh, 820px)');
 assert.match(css,/\.frameTall\{width:min\(100%,560px,var\(--tallMax\) \* 4 \/ 5\);height:auto;aspect-ratio:4\/5\}/,'4:5 frame sized by width');
 assert.match(css,/@media\(max-width:640px\)\{\.frameTall\{width:100%;[^}]*border-radius:24px\}/,'phones: the 4:5 card spans the content width, 24px corners');
 assert.match(css,/\.stage:has\(>\.frameTall\)\{padding:0;background:none;border-radius:0\}/,'desktop: no tan well around a 4:5 card');
 assert.match(css,/\.pinFrame\{position:relative;width:min\(100%,560px,var\(--tallMax\) \* 4 \/ 5\);aspect-ratio:4\/5\}/,'friends: one 4:5 box for every step');
 assert.match(css,/--pinW:min\(46vw,640px,min\(82svh,820px\) \* 4 \/ 5\)/,'friends (wide): pinned box about min(46vw, 640px), <= min(82svh, 820px) tall');
 assert.match(css,/\.panel>\.frameTall\{width:100%;max-width:none;height:100%\}/,'4:5 step pictures fill the box');
 // phones: logo + Play pill only (four links clipped "Safety" at 390px)
 assert.match(css,/@media\(max-width:640px\)\{\.root \.subLinks\{display:none\}\}/,'nav at <= 640px: no links');
 // owner, Nov 3: phones get a menu (icon left of Play) instead; <details>/<summary> so the links work with JS off
 {const mm=strip(read('components/learn/MobileMenu.tsx'));
  assert.match(page,/<ul className=\{s\.subLinks\} data-sublinks="">[\s\S]*?<\/ul>\s*<MobileMenu links=\{NAV\}\/>\s*<NavPlay className=\{s\.pill\}/,'phone menu sits between the links and the Play pill');
  assert.match(mm,/<details className=\{s\.menu\}[^>]*>\s*<summary className=\{s\.menuBtn\} aria-label="Menu" aria-controls="learn-menu">/,'details + summary, aria-label Menu, aria-controls');
  assert.match(mm,/setAttribute\('aria-expanded',String\(d\.open\)\)/,'aria-expanded follows the panel');
  assert.match(mm,/e\.key==='Escape'/,'Escape closes');assert.match(mm,/'pointerdown'/,'a tap outside closes');
  assert.match(mm,/closest\('a'\)\)\{d\.open=false/,'a link tap closes (the anchor scrolls natively)');
  assert.match(mm,/querySelector<HTMLAnchorElement>\('a'\)\?\.focus/,'focus to the first link on open');assert.match(mm,/btn\.focus\(/,'focus back to the button');
  assert.match(mm,/removeEventListener\('pointerdown'/,'document listeners only while open');
  assert.match(css,/\.menu\{display:none\}\s*@media\(max-width:640px\)\{\.menu\{display:block;flex:none\}\}/,'menu only at <= 640px');
  assert.match(css,/\.menuBtn\{display:grid;place-items:center;width:44px;height:44px;/,'44px icon button');
  assert.match(css,/\.menuBtn:active\{translate:0 var\(--btn-press,3px\)\}/,'pressed icon sinks 3px');assert.doesNotMatch(css,/\.menuBtn:hover/,'no hover colour on the icon');
  assert.match(css,/\.menuPanel\{position:absolute;top:100%;left:0;right:0;height:calc\(100svh - 68px\);overflow-y:auto;/,'panel under the 68px bar, fills the screen below the bar, scrolls');
  assert.match(css,/\.menu\[open\] \.menuPanel\{animation:menuIn \.22s/,'opens with the 220ms slide / fade');
  assert.match(css,/\.root \.menuList a\{[^}]*min-height:88px;[^}]*font-size:36px;font-weight:600/,'large rows, 88px tall, full-screen menu');
  assert.match(css,/\.menuList a\[aria-current\] span\{background:var\(--btn-pink/,'current chapter: the pink chip');
  assert.doesNotMatch(css.match(/\.menu[A-Za-z]*\{[^}]*\}/g).join(''),/IslandBrush/,'no IslandBrush in the menu');}
 // owner, Nov 3: ONE pink chip that moves between the desktop links (transform only, springy), not a fade per link
 {assert.equal((css.match(/\.root \.subLinks::before\{/g)||[]).length,1,'one indicator: the list ::before');
  assert.doesNotMatch(css,/\.subLinks a(\[aria-current\])?::before/,'no per-link chip any more');
  assert.match(css,/\.root \.subLinks a\{display:inline-flex;align-items:center;justify-content:center;width:92px;/,'links a fixed 92px');
  assert.match(css,/\.root \.subLinks\{position:relative;display:flex;flex:1;min-width:0;gap:6px;/,'6px gap');
  const ind=[...css.matchAll(/\.root \.subLinks(?:\[[a-z-]+\])?::before\{([^}]*)\}/g)].map(m=>m[1]);
  for(const b of ind){const tr=(b.match(/transition:([^;}]*)/)||[,''])[1];
   if(tr&&tr!=='none')for(const part of tr.split(/,(?![^(]*\))/))assert.match(part.trim(),/^(opacity|transform|translate) /,`indicator transitions transform / opacity only: ${part}`);}
  assert(ind.some(b=>/transform:translateX\(calc\(var\(--i,0\) \* 98px\)\);transition:[^;]*transform \.32s cubic-bezier\(\.34,1\.56,\.64,1\)/.test(b)),'moves by translateX(--i * 98px), 320ms spring');
  assert.match(css,/\.root \.subLinks\[data-snap\]::before\{transition:none\}/,'first appearance jumps while hidden');
  assert.match(enh,/list\.style\.setProperty\('--i'/,'LearnEnhance writes --i');assert.match(enh,/'data-has-current'/,'and data-has-current');
  // reduced motion: the global .root *::before{transition:none!important} rule (asserted above) makes the move instant
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{\.root \*,\.root \*::before,/,'reduced motion: the indicator changes instantly');}
}

// ---- 4. content -----------------------------------------------------------------------------------------------------------------
assert.equal(HL.map(h=>h.id).join(),'top,learn,explore,fuel,together,safe','six sections');
// Fuel up (Nov 3 2026): a light chapter between Explore and Play with friends; its clip is a 16:9 film (large frame) with a 1280px
// phone file; the copy names only what the game does (docs/learn-konbini-facts.md; the number checks are in tests/learn-content.cjs).
{const fu=HL.find(h=>h.id==='fuel');
 assert.match(page,/<Chapter h=\{hl\('explore'\)\}\/>\s*\n[^\n]*Fuel up[^\n]*\n\s*<Chapter h=\{hl\('fuel'\)\}\/>/,'Fuel up sits right after Explore, as a light chapter (no dark prop)');
 assert(page.indexOf("hl('fuel')")<page.indexOf('<Chapter h={together} dark>'),'Fuel up comes before Play with friends');
 assert.equal(fu.shot,'fuel_konbini','Fuel up uses the Konbini clip');assert.deepEqual([...fu.features],['konbini'],'Fuel up covers the Konbini feature');
 assert(has('docs/learn-konbini-facts.md'),'the facts doc behind the Fuel up copy exists');
 assert.doesNotMatch([fu.title,fu.line,...fu.chips].join(' '),/energy drink|weight|diet|healthy|medical|faster|stronger|calorie/i,'Fuel up copy: no health claims, no weight or diet talk, no gameplay perk');
 const M=L('lib/site/learnMedia.ts'),a=M.learnAsset('fuel_konbini');
 assert(a.image&&a.image.width>=a.image.height*1.5,'Fuel up: a 16:9 poster');assert(a.clip?.mp4&&a.clip.mp4m,'Fuel up: 1920 mp4 + 1280 phone mp4');
 assert.match(media,/a\.clip\.mp4m&&<source media=\{a\.image\.m\?[^}]*'\(max-width: 1280px\)'\}[\s\S]*a\.clip\.mp4&&<source/,'the phone file is a <source media> listed before the full-size mp4');
 assert.match(css,/\.frameFilm\{width:min\(100%,1052px\);aspect-ratio:16\/9\}/,'16:9 chapter clips get the large film frame');}
for(const h of HL){assert(h.chips.length<=3,`${h.id}: at most 3 chips`);assert(h.title&&h.line&&h.line.length<=90,`${h.id}: one headline, one short line`);
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
 const ok=new Set(['/','/about','/privacy','#together']);
 for(const h of hrefs){if(h.startsWith('#'))continue;assert(ok.has(h)||h.startsWith('#')||/^https:\/\/futbolisland\.app\//.test(h),`link ${h} is known`);}
 for(const id of ['/about','/privacy'])assert(has(`app/(site)${id}`)||has(`app${id}`),`${id} route exists`);}

// ---- 5. built site --------------------------------------------------------------------------------------------------------------
const dist=path.join(root,process.env.NEXT_DIST_DIR||'.next'),built=path.join(dist,'server/app/index.html');
if(!fs.existsSync(built)){console.log(`learn page sources ok: ${HL.length} sections, ${Q.length} FAQ (data: ${F.length} features, ${G.length} groups)`);console.log(`  SKIP built-page checks: no home page in ${path.relative(root,dist)} (build with NEXT_DIST_DIR to run them)`);process.exit(0);}
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
for(const t of ['WebSite','Organization'])assert(ld.some(x=>x['@type']===t),t+' JSON-LD');
assert.match(html,/<link rel="canonical" href="https:\/\/futbolisland\.app"\/>/,'canonical /');
assert(!fs.existsSync(path.join(dist,'server/app/learn.html')),'no /learn page is built (it redirects)');
{const plays=[...html.matchAll(/<a [^>]*href="([^"]*)"[^>]*>((?:(?!<\/a>)[\s\S])*?)<\/a>/g)].filter(m=>/Play/.test(m[2].replace(/<[^>]+>/g,''))).map(m=>m[1]);assert(plays.length>=2&&plays.every(h=>h==='/play'),'built: every Play link goes to /play: '+plays.join(' '));}
assert.match(html,/<meta property="og:image" content="[^"]*opengraph-image\.png"/,'OG image');
assert.equal((html.match(/<h1[ >]/g)||[]).length,1,'one h1');
{const vs=[...html.matchAll(/<video [^>]*>/g)].map(m=>m[0]);
 for(const v of vs)assert(/muted/.test(v)&&/loop/.test(v)&&/playsInline|playsinline/.test(v)&&/preload="(none|auto)"/.test(v)&&!/poster=/.test(v),'built video attrs');
 assert.equal(vs.filter(v=>/preload="auto"/.test(v)).length,1,'only the hero clip preloads in full');}
{const M=L('lib/site/learnMedia.ts'),live=CAR.filter(c=>M.learnWideAsset(c.key));
 const cards=html.match(/aria-roledescription="slide"[^>]*data-reel-card=""/g)||[];
 assert.equal(cards.length,live.length,`carousel: ${live.length} cards (one per wide clip on disk + in the manifest)`);
 assert(cards.length<=9,'carousel: 9 cards at most');
 if(live.length){assert.match(html,/role="region" aria-roledescription="carousel"/,'carousel region');
  {const flat=text.replace(/\s+/g,"");for(const c of live)assert(flat.includes(learnPlain(c.caption).replace(/\s+/g,"")),`caption: ${c.key}`);}
  const rv=[...html.matchAll(/<video [^>]*data-rv=""[^>]*>/g)].map(m=>m[0]);assert(rv.every(v=>/preload="none"/.test(v)),'carousel clips preload none in the HTML');
  assert(html.indexOf('id="reel-h"')<html.indexOf('id="learn-h"'),'the carousel sits before the Learn chapter');}
 else assert(!/id="reel-h"/.test(html),'no wide clips yet = no carousel section');}
{const M=L('lib/site/learnMedia.ts'),{LEARN_SLIDES:SL}=L('lib/site/learnFeatures.ts');
 if(M.learnMontage()){const mv=html.match(/<video [^>]*data-mv=""[^>]*>([\s\S]*?)<\/video>/);assert(mv,'built: one montage video');
  assert.equal((html.match(/data-mv=""/g)||[]).length,1,'built: exactly one montage video');
  assert.match(mv[0],/preload="none"/,'built: montage preload none until near');
  const srcs=[...mv[1].matchAll(/<source [^>]*>/g)].map(m=>m[0]);assert(srcs.length<=3&&srcs.slice(0,-1).every(x=>/media="/.test(x))&&!/media="/.test(srcs[srcs.length-1]),'built: montage sources are media alternatives with one default');
  assert(html.indexOf('id="learn-title"')<html.indexOf('id="montage-h"')&&(html.indexOf('id="reel-h"')<0||html.indexOf('id="montage-h"')<html.indexOf('id="reel-h"')),'built: hero, montage, then the carousel');}
 else assert(!/data-montage=""/.test(html),'built: no montage files = no section');
 const live=SL.filter(x=>M.learnSlideAsset(x.key)),cards=html.match(/data-slide=""/g)||[];
 assert.equal(cards.length,live.length,`built: ${live.length} slides`);assert(cards.length<=6,'built: 6 slides at most');
 if(live.length){const flat=text.replace(/\s+/g,'');let at=-1;for(const x of live){const k=flat.indexOf(x.caption.replace(/\s+/g,''),at+1);assert(k>at,`built: slide caption in order: ${x.key}`);at=k;}
  assert(html.indexOf('id="together-h"')<html.indexOf('id="slides-h"')&&html.indexOf('id="slides-h"')<html.indexOf('id="safe-h"'),'built: slideshow between Play with friends and Safe');
  assert([...html.matchAll(/<video [^>]*data-sv=""[^>]*>/g)].every(m=>/preload="none"/.test(m[0])),'built: slide clips preload none');}}
assert(!fs.existsSync(path.join(dist,'server/app/learn',lessons.LESSONS[0].id+'.html')),'old /learn/<id> pages are not built');
assert(fs.existsSync(path.join(dist,'server/app/learn/lessons',lessons.LESSONS[0].id+'.html')),'lessons are built under /learn/lessons');
console.log(`learn page ok: ${HL.length} sections, ${Q.length} FAQ, ${(html.match(/<video /g)||[]).length} clips, ${(html.match(/src="\/learn\/[a-z0-9_]+\.webp"/g)||[]).length} stills in ${path.relative(root,dist)}`);
