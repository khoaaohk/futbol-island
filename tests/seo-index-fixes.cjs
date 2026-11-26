// SEO index fixes (Nov 26 2026, Search Console page-indexing report of Nov 22: 295 "Crawled, not indexed", 205 "Discovered, not
// crawled", 50 "Alternate page with proper canonical", 1 404, 1 redirect, 2 duplicates).
//  1. Sources: files that are not pages send X-Robots-Tag: noindex (/_next/static, a clip's .webm twin, narration audio, the web
//     manifest) while the video sitemap's .mp4 and the .webp posters stay indexable; robots.txt never blocks /_next or the
//     game deep links; game deep links (/play?…, /arcade?…) carry rel="nofollow"; the English footer lists the Spanish sections.
//  2. A built site (NEXT_DIST_DIR or .next), when present: no sitemap page is noindex; no page links a removed game or clip, and
//     every rendered link to /play?… or /arcade?… is nofollow; the English footer reaches every Spanish hub it names.
// usage: node tests/seo-index-fixes.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
(async()=>{
 const cfg=await import(path.join(root,'next.config.mjs')),rules=await cfg.default('phase-production-build').headers();
 const {pathToRegexp}=require('next/dist/compiled/path-to-regexp');
 const robotsFor=url=>rules.filter(r=>!r.has&&pathToRegexp(r.source).test(url)).flatMap(r=>r.headers).filter(h=>h.key==='X-Robots-Tag').map(h=>h.value);
 for(const u of ['/_next/static/css/de6023fa25b9327e.css','/_next/static/chunks/app/page-1.js','/_next/static/media/font.woff2','/games/clips/kitrush.webm',
  '/voice/books/son/basics.m4a','/stories/eleven/a/b-0123456789ab.m4a','/manifest.webmanifest'])assert.deepEqual(robotsFor(u),['noindex'],`${u}: noindex`);
 for(const u of ['/games/clips/kitrush.mp4','/games/clips/kitrush.webp','/','/learn/soccer-drills/dribbling','/es/learn/lessons','/stories/paths/chapters/ink-0123456789ab.webp'])
  assert.deepEqual(robotsFor(u),[],`${u}: indexable`);
 const robots=read('app/robots.ts');
 assert(!/['"]\/_next/.test(robots)&&!/go=|game=/.test(robots),'robots.txt never blocks /_next or the game deep links (Google renders with them; a blocked URL hides its canonical)');
 const {deepLinkRel}={deepLinkRel:href=>/^\/(?:play|arcade)\?/.test(href)?'nofollow':undefined};
 assert.match(read('lib/site/playLinks.ts'),/export const deepLinkRel=\(href:string\):'nofollow'\|undefined=>\/\^\\\/\(\?:play\|arcade\)\\\?\/\.test\(href\)/,'deepLinkRel: /play? and /arcade?');
 assert.equal(deepLinkRel('/play?go=lesson:x'),'nofollow');assert.equal(deepLinkRel('/play'),undefined);
 for(const f of ['components/site/games/GameParts.tsx','components/es/pages/GamesEs.tsx'])
  assert(!/href=\{(?:game|x)\.play\}(?! rel="nofollow")/.test(read(f)),`${f}: every Play link is nofollow`);
 assert.match(read('components/site/FooterHubs.tsx'),/En español[\s\S]*hasEs\(href\)[\s\S]*toEs\(href\)/,'English footer: the Spanish sections row');

 // ---- 2. built site --------------------------------------------------------------------------------------------------------
 const dist=path.join(root,process.env.NEXT_DIST_DIR||'.next'),app=path.join(dist,'server/app');
 if(!fs.existsSync(path.join(app,'index.html'))){console.log('seo-index-fixes: sources ok; SKIP built-site checks (no build in '+path.basename(dist)+')');return;}
 const pages=[];(function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(e.name.endsWith('.html'))pages.push(p);}})(app);
 const smDir=path.join(app,'sitemaps'),listed=new Set(fs.readdirSync(smDir).filter(f=>f.endsWith('.xml.body')).flatMap(f=>[...fs.readFileSync(path.join(smDir,f),'utf8').matchAll(/<loc>https:\/\/futbolisland\.app([^<]*)<\/loc>/g)].map(m=>m[1]||'/'))),rel=f=>'/'+path.relative(app,f).replace(/\.html$/,'').replace(/(^|\/)index$/,'').replace(/\\/g,'/');
 let deep=0,es=0;const bad=[];
 for(const f of pages){const p=rel(f).replace(/\/$/,'')||'/',h=fs.readFileSync(f,'utf8');
  if(listed.has(p)&&/<meta name="robots" content="[^"]*noindex/.test(h))bad.push(`${p}: in the sitemap but noindex`);
  if(/href="[^"]*(?:clearbox|streetdash|soccer-tap-puzzle-game|soccer-side-scroller-game|soccer-defending-game)/.test(h))bad.push(`${p}: links a removed game or clip`);
  for(const m of h.matchAll(/<a\b[^>]*href="(?:https:\/\/futbolisland\.app)?\/(?:play|arcade)\?[^"]*"[^>]*>/g)){deep++;if(!/rel="nofollow"/.test(m[0]))bad.push(`${p}: followed deep link ${m[0].slice(0,90)}`);}
  if(!p.startsWith('/es')&&p!=='/'&&/>En español</.test(h))es++;}
 assert.deepEqual(bad.slice(0,20),[],bad.length+' problems');
 assert(es>100,`the English footer's Spanish row is on the English pages (${es})`);
 console.log(`seo-index-fixes: ok (${pages.length} built pages, ${deep} deep links all nofollow, Spanish row on ${es} English pages, no listed noindex)`);
})().catch(e=>{console.error(e);process.exit(1);});
