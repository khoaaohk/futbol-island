// The unlisted marketing pages (Nov 4 2026, owner): /marketing and its print page /marketing/overview (lib/site/marketing.ts).
//  1. Hidden: noindex + nofollow metadata, an X-Robots-Tag header for /marketing and everything under it (the PDF too), not in the
//     sitemap paths, robots.ts, llms.txt or llms-full.txt, and no link to /marketing anywhere in app/, components/, lib/ or public/
//     outside the marketing files themselves.
//  2. The page: force-static, no video, the PDF download (download attribute) with the real gold `.cta`, the title screen's own
//     game buttons; every design swatch hex is really in the CSS file it is taken from.
//  3. The PDF exists, is a PDF and is under 15 MB; the print page uses only lib/site copy and the tour's stills (no video).
//  4. With a build (NEXT_DIST_DIR or .next holding marketing.html): the built pages carry the robots meta and are not in the sitemap.
// usage: node tests/marketing-page.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const has=rel=>fs.existsSync(path.join(root,rel));
const strip=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:])\/\/.*$/gm,'$1');

const PAGE='app/(site)/marketing/page.tsx',DOC='app/(site)/marketing/overview/page.tsx',LIB='lib/site/marketing.ts',PDF='public/marketing/futbol-island-overview.pdf';
for(const f of [PAGE,DOC,LIB,'components/marketing/marketing.module.css','scripts/build-marketing-pdf.cjs'])assert(has(f),f+' exists');
const page=read(PAGE),doc=read(DOC),lib=read(LIB);

// ---- 1. hidden ----
assert.match(lib,/robots:\{index:false,follow:false/,'hiddenMeta: noindex, nofollow');
assert.match(lib,/googleBot:\{index:false,follow:false/,'hiddenMeta: googleBot noindex, nofollow');
for(const [f,s,p] of [[PAGE,page,'MARKETING_PATH'],[DOC,doc,'MARKETING_OVERVIEW_PATH']]){
 assert.match(s,/export const dynamic='force-static';/,f+' is force-static');
 assert(new RegExp(`export const metadata=hiddenMeta\\([^\\n]*${p}\\)`).test(s),f+' uses hiddenMeta (noindex)');
 assert(!/['"]use client['"]/.test(s),f+' is a server page');}
const cfg=read('next.config.mjs');
for(const src of ["'/marketing'","'/marketing/:path*'"])assert(new RegExp(`source: ${src.replace(/[*/]/g,'\\$&')}, headers: \\[\\{ key: 'X-Robots-Tag', value: 'noindex, nofollow`).test(cfg),`X-Robots-Tag noindex for ${src}`);
assert(!/marketing/.test(strip(read('app/robots.ts'))),'robots.txt does not name /marketing (that would advertise it)');
assert(!/marketing/i.test(read('public/llms.txt')),'llms.txt does not list /marketing');
assert(!/marketing/.test(strip(read('app/llms-full.txt/route.ts'))),'llms-full.txt does not list /marketing');
assert(!/marketing/.test(strip(read('lib/site/paths.ts'))),'paths.ts (the sitemap) does not list /marketing');
assert(!/marketing/.test(strip(read('app/sitemap.ts'))),'sitemap.ts does not add /marketing');
// No link anywhere: an href, a link target string or a router push to /marketing outside the marketing files.
const OWN=new Set([PAGE,DOC,LIB,'app/(site)/page.tsx',/* the main page's About chapter links to it (owner, Nov 4) */'tests/marketing-page.cjs','scripts/build-marketing-pdf.cjs']);
const walk=d=>{const abs=path.join(root,d);if(!fs.existsSync(abs))return [];return fs.readdirSync(abs,{withFileTypes:true}).flatMap(e=>e.isDirectory()?(e.name==='node_modules'||e.name.startsWith('.')?[]:walk(`${d}/${e.name}`)):[`${d}/${e.name}`]);};
const LINK=/(href=["'{`]*|['"`])(https:\/\/futbolisland\.app)?\/marketing(\/|["'`?#])/;
let scanned=0;
for(const f of [...walk('app'),...walk('components'),...walk('lib'),...walk('public').filter(f=>/\.(txt|html|xml|json|md|webmanifest)$/.test(f))].filter(f=>/\.(tsx?|jsx?|mjs|cjs|css|txt|html|xml|json|md|webmanifest)$/.test(f))){
 if(OWN.has(f))continue;scanned++;
 assert(!LINK.test(read(f)),`${f} links to /marketing (only the main page's About box may)`);}
assert(scanned>100,'the link scan covered the code ('+scanned+' files)');

// ---- 2. the page ----
assert.match(page,/className=\{learn\.cta\} href=\{MARKETING_PDF\} download=/,'Download marketing: the gold .cta with a download attribute');
assert.match(page,/>Download marketing</,'the button says Download marketing');
assert.match(page,/PDF\{size/,'shows PDF and the file size beside it');
assert.match(page,/className=\{title\.start\}/,'the game example is the title screen\'s own .start button');
for(const s of [page,doc])assert(!/<video|autoPlay|LearnMedia|clip/.test(strip(s)),'no video on the marketing pages');
// every swatch hex is really in one of its source CSS files
const lt=require('typescript'),out=lt.transpileModule(lib,{compilerOptions:{module:lt.ModuleKind.CommonJS,target:lt.ScriptTarget.ES2020}}).outputText;
const mod={exports:{}};new Function('exports','module','require',out)(mod.exports,mod,()=>({}));
for(const sheet of [mod.exports.SITE_SHEET,mod.exports.GAME_SHEET]){
 const src=sheet.src.map(read).join('\n').toLowerCase();
 assert(sheet.swatches.length>=6&&sheet.type.length>=3&&sheet.notes.length>=3&&sheet.notes.length<=5,'a short sheet: swatches, type, 3-5 notes');
 for(const w of sheet.swatches)assert(src.includes(w.hex.toLowerCase()),`${w.name} ${w.hex} is in ${sheet.src.join(' / ')}`);}
for(const c of mod.exports.LOGO_COLOURS)assert(read('components/learn/LogoWord.tsx').includes(`'${c}'`),`logo colour ${c} is LogoWord's`);

// ---- 3. the PDF and its print page ----
assert(has(PDF),'the PDF is built and committed (node scripts/build-marketing-pdf.cjs)');
const pdf=fs.readFileSync(path.join(root,PDF));
assert.equal(pdf.subarray(0,5).toString(),'%PDF-','it is a PDF');
assert(pdf.length<15e6,`the PDF is under 15 MB (${(pdf.length/1e6).toFixed(2)} MB)`);
const pages=(pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g)||[]).length;
assert(pages>=12&&pages<=30,`the deck is compact: 12-30 pages (${pages}), not one page per feature`);
// Nov 4 redesign: a 16:9 landscape deck (1280 x 720 CSS px = 960 x 540 pt per page)
const box=pdf.toString('latin1').match(/\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/);
assert(box&&Math.abs(+box[1]/+box[2]-16/9)<.01,`the PDF pages are 16:9 landscape (${box&&box.slice(1).join(' x ')})`);
assert.match(doc,/data-feature=\{f\.id\}/,'every feature tile is marked data-feature (the build script checks all of LEARN_FEATURES are in the deck)');
assert.match(doc,/data-features-total=\{LEARN_FEATURES\.length\}/,'the deck states how many features it must show');
assert.match(doc,/from '@\/lib\/site\/learnFeatures'/,'print page copy comes from lib/site/learnFeatures');
assert.match(doc,/from '@\/lib\/site\/aboutCopy'/,'and lib/site/aboutCopy');
for(const k of ['LEARN_GROUPS.map','LEARN_FEATURES.filter','LEARN_FAQ.map','LEARN_HIGHLIGHTS','CONTACT_EMAIL','G.partnerRest','LEARN_TOGETHER_TRUST'])assert(doc.includes(k),`print page covers ${k}`);
assert.match(read('components/marketing/marketing.module.css'),/break-inside:avoid/,'cards never split across pages');

// ---- 4. a built site ----
const dist=path.join(root,process.env.NEXT_DIST_DIR||'.next'),app=path.join(dist,'server/app');
if(!fs.existsSync(path.join(app,'marketing.html'))){console.log('marketing page ok (sources; SKIP built checks: no build with /marketing)');process.exit(0);}
for(const p of ['marketing','marketing/overview']){const h=fs.readFileSync(path.join(app,p+'.html'),'utf8');
 assert.match(h,/<meta name="robots" content="noindex, nofollow/,`/${p}: robots noindex, nofollow`);
 assert(!/<meta property="og:/.test(h),`/${p}: no Open Graph card`);}
if(fs.existsSync(path.join(app,'sitemap.xml.body')))assert(!/marketing/.test(fs.readFileSync(path.join(app,'sitemap.xml.body'),'utf8')),'the built sitemap leaves /marketing out');
console.log('marketing page ok (sources and build)');
