// The marketing pages (Nov 4 2026, owner): /marketing and its print page /marketing/overview (lib/site/marketing.ts).
//  1. Since Nov 6 2026 (owner) /marketing itself is open to search (pageMeta, canonical, in the sitemap paths). Everything UNDER it (the
//     print page and the PDF) stays hidden: noindex + nofollow metadata and an X-Robots-Tag header for /marketing/:path+, not in the
//     sitemap, and no link to /marketing/... anywhere outside the marketing files themselves.
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
 if(f===PAGE)assert(new RegExp(`export const metadata=pageMeta\\([^\\n]*${p}[^\\n]*\\)`).test(s)&&!/hiddenMeta/.test(s),f+' is indexable (pageMeta, no hiddenMeta)');
 else assert(new RegExp(`export const metadata=hiddenMeta\\([^\\n]*${p}\\)`).test(s),f+' uses hiddenMeta (noindex)');
 assert(!/['"]use client['"]/.test(s),f+' is a server page');}
const cfg=read('next.config.mjs');
assert(!/source: '\/marketing', headers/.test(cfg),'no X-Robots-Tag rule on /marketing itself');
for(const src of ["'/marketing/:path+'"])assert(new RegExp(`source: ${src.replace(/[*+/]/g,'\\$&')}, headers: \\[\\{ key: 'X-Robots-Tag', value: 'noindex, nofollow`).test(cfg),`X-Robots-Tag noindex for ${src}`);
assert(!/marketing/.test(strip(read('app/robots.ts'))),'robots.txt does not name /marketing (that would advertise it)');
assert(!/marketing/i.test(read('lib/site/llms.ts')),'llms.txt does not list /marketing');
assert(!/marketing/.test(strip(read('app/llms-full.txt/route.ts'))),'llms-full.txt does not list /marketing');
assert(/path:'\/marketing'/.test(strip(read('lib/site/paths.ts'))),'paths.ts (the sitemap) lists /marketing');
assert(!/marketing\/overview/.test(strip(read('lib/site/paths.ts'))),'the print page /marketing/overview is not in the sitemap');
// No link anywhere: an href, a link target string or a router push to /marketing outside the marketing files.
const OWN=new Set([PAGE,DOC,LIB,'lib/site/paths.ts'/* the sitemap lists /marketing since Nov 6 2026 */,'lib/site/lastmod.generated.json'/* its sitemap lastmod (Nov 15 2026) */,'lib/site/lastmodData.generated.ts'/* the same lastmod list as a code module (Nov 20 2026) */,'app/(site)/page.tsx',/* the main page's About chapter links to it (owner, Nov 4) */'tests/marketing-page.cjs','scripts/build-marketing-pdf.cjs']);
const walk=d=>{const abs=path.join(root,d);if(!fs.existsSync(abs))return [];return fs.readdirSync(abs,{withFileTypes:true}).flatMap(e=>e.isDirectory()?(e.name==='node_modules'||e.name.startsWith('.')?[]:walk(`${d}/${e.name}`)):[`${d}/${e.name}`]);};
const LINK=/(href=["'{`]*|['"`])(https:\/\/futbolisland\.app)?\/marketing(\/|["'`?#])/;
let scanned=0;
for(const f of [...walk('app'),...walk('components'),...walk('lib'),...walk('public').filter(f=>/\.(txt|html|xml|json|md|webmanifest)$/.test(f))].filter(f=>/\.(tsx?|jsx?|mjs|cjs|css|txt|html|xml|json|md|webmanifest)$/.test(f))){
 if(OWN.has(f))continue;scanned++;
 assert(!LINK.test(read(f).replace(/\/marketing\/[\w\/.-]+\.(?:webp|png|jpe?g|svg|mp4|webm)/g,''))/* a picture file under public/marketing is not a link (b5, Nov 17 2026) */,`${f} links to /marketing (only the main page's About box may)`);}
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
assert(pages>=12&&pages<=36,`the deck is compact: 12-36 pages (${pages}), not one page per feature`);
// Nov 4 redesign: a 16:9 landscape deck (1280 x 720 CSS px = 960 x 540 pt per page)
const box=pdf.toString('latin1').match(/\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/);
assert(box&&Math.abs(+box[1]/+box[2]-16/9)<.01,`the PDF pages are 16:9 landscape (${box&&box.slice(1).join(' x ')})`);
assert.match(doc,/data-feature=\{f\.id\}/,'every feature tile is marked data-feature (the build script checks all of LEARN_FEATURES are in the deck)');
assert.match(doc,/data-features-total=\{LEARN_FEATURES\.length\}/,'the deck states how many features it must show');
assert.match(doc,/from '@\/lib\/site\/learnFeatures'/,'print page copy comes from lib/site/learnFeatures');
assert.match(doc,/from '@\/lib\/site\/aboutCopy'/,'and lib/site/aboutCopy');
for(const k of ['LEARN_GROUPS.map','LEARN_FEATURES.filter','LEARN_FAQ.map','LEARN_HIGHLIGHTS','CONTACT_EMAIL','G.partnerRest','LEARN_TOGETHER_TRUST'])assert(doc.includes(k),`print page covers ${k}`);
assert.match(read('components/marketing/marketing.module.css'),/break-inside:avoid/,'cards never split across pages');
// Nov 13 2026 (owner): the DRIP FC Stadium sponsor chapter: every slot in SLOT_SPECS with its screenshot, plus naming rights and the feed bug
{const deck=read('lib/site/stadiumDeck.ts'),slots=read('lib/stadium/sponsors/slots.ts');
 assert.match(doc,/<StadiumChapter\/>/,'the deck prints the stadium chapter');
 assert.match(doc,/from '@\/lib\/site\/stadiumDeck'/,'stadium copy comes from lib/site/stadiumDeck');
 assert.match(doc,/data-stadium-slot=\{x\.id\}/,'every slot card is marked data-stadium-slot');
 assert.match(doc,/<StadiumPlan\/>/,'the overhead plan with numbered pins');
 const ids=[...slots.match(/SPONSOR_SLOTS=\[([^\]]*)\]/)[1].matchAll(/'(\w+)'/g)].map(m=>m[1]);
 assert.deepEqual(ids,['board','screen','gate','fascia','flag','centre'],'the six sponsor slots');
 for(const id of ids){
  const m=deck.match(new RegExp(`\\{pin:(\\d),id:'${id}'[^\\n]*shot:'(\\w+)'`));
  assert(m,`the stadium chapter shows the ${id} slot`);
  assert(has(`public/marketing/stadium/${m[2]}.webp`),`${id}: its screenshot public/marketing/stadium/${m[2]}.webp exists`);}
 for(const id of ['feed','naming'])assert(new RegExp(`id:'${id}'`).test(deck),`the stadium chapter shows the ${id} package`);
 assert.match(deck,/SLOT_SPECS\[id\]/,'sizes and sponsor counts are read from SLOT_SPECS (never typed by hand)');
 assert(!/\$\s?\d|£\s?\d|€\s?\d|per month|per year/i.test(deck),'no prices in the stadium chapter');
 assert.match(deck,/SPONSOR_BOARDS_LINE/,'the family rules sit beside lib/site/safety SPONSOR_BOARDS_LINE');}
// Nov 14 2026 (owner): the Kit Shop chapter (Drip FC club kit as the example) and one page with every way a brand can appear
{const kit=read('lib/site/kitDeck.ts'),slots=read('lib/stadium/sponsors/slots.ts');
 assert.match(doc,/<KitChapter\/>/,'the deck prints the Kit Shop chapter');
 assert.match(doc,/<SponsorClose\/>/,'then every placement, the packages and the family rules');
 assert(doc.indexOf('<StadiumChapter/>')<doc.indexOf('<KitChapter/>')&&doc.indexOf('<KitChapter/>')<doc.indexOf('<SponsorClose/>'),'stadium, then kit, then the close');
 assert.match(doc,/from '@\/lib\/site\/kitDeck'/,'kit copy comes from lib/site/kitDeck');
 assert.match(doc,/data-kit-item=\{x\.id\}/,'every kit item card is marked data-kit-item');
 for(const id of ['ball','boots','shirt','ready','seen']){
  const m=kit.match(new RegExp(`\\{id:'${id}',name:'[^']+',shot:'(\\w+)'`));
  assert(m,`the kit chapter shows the ${id} item`);
  assert(has(`public/marketing/kit/${m[1]}.webp`),`${id}: its screenshot public/marketing/kit/${m[1]}.webp exists`);}
 for(const k of ['hero','label'])assert(has(`public/marketing/kit/${k}.webp`),`kit ${k} screenshot exists`);
 for(const k of ['MAX_CLUB_BALL','CLUB_STICKERS','DECAL_ZONES','JERSEY_CLUB_SPOTS','CLUB_LABEL','SPONSOR_TAG'])assert(kit.includes(k),`kit facts read from the game: ${k}`);
 assert.match(doc,/Every way your brand can appear/,'the all-placements page');
 assert.match(doc,/data-placement=\{i\.id\}/,'every placement line is marked data-placement');
 const grp=id=>{const m=kit.match(new RegExp(`\\{id:'${id}',title:[^\\n]*items:\\[([\\s\\S]*?)\\n \\]\\}`));assert(m,`placement group ${id}`);return [...m[1].matchAll(/\{id:'(\w+)',name:/g)].map(x=>x[1]);};
 const ids=[...slots.match(/SPONSOR_SLOTS=\[([^\]]*)\]/)[1].matchAll(/'(\w+)'/g)].map(m=>m[1]);
 assert.deepEqual([...grp('stadium')].sort(),[...ids,'feed','naming'].sort(),'the stadium group lists every slot in SLOT_SPECS plus both packages, nothing invented');
 assert.deepEqual(grp('kit'),['ball','boots','shirt','ready'],'the Kit Shop group: ball and boot stickers, shirt crest and wordmark, ready-made kit');
 assert.match(kit,/share:share\('(board|screen|gate|fascia|flag|centre)'\)/,'stadium sponsor counts come from SLOT_SPECS');
 assert(!/gashapon|vending|konbini/i.test(strip(kit)),'the island machines are not sponsor slots and are not listed');
 assert.match(doc,/KIT_PACKAGE/,'the packages page carries the kit package');
 assert.match(doc,/SPONSOR_KIT_LINE/,'the family rules carry lib/site/safety SPONSOR_KIT_LINE');
 assert(!/\$\s?\d|£\s?\d|€\s?\d|per month|per year|USD|price:\s*\d/i.test(kit),'no prices in the kit chapter');}

// Nov 25 2026 (owner): the Island Line chapter: branding on the trains, the Drip FC kindness wraps as the example
{const tr=read('lib/site/trainDeck.ts'),kit=read('lib/site/kitDeck.ts');
 assert.match(doc,/<TrainChapter\/>/,'the deck prints the Island Line chapter');
 assert(doc.indexOf('<KitChapter/>')<doc.indexOf('<TrainChapter/>')&&doc.indexOf('<TrainChapter/>')<doc.indexOf('<SponsorClose/>'),'kit, then trains, then the close');
 assert.match(doc,/from '@\/lib\/site\/trainDeck'/,'train copy comes from lib/site/trainDeck');
 assert.match(doc,/data-train-item=\{x\.id\}/,'every train card is marked data-train-item');
 for(const id of ['panels','badge','ride']){
  const m=tr.match(new RegExp(`\\{id:'${id}',name:'[^']+',shot:'(\\w+)'`));
  assert(m,`the train chapter shows the ${id} item`);
  assert(has(`public/marketing/train/${m[1]}.webp`),`${id}: its screenshot public/marketing/train/${m[1]}.webp exists`);}
 for(const k of ['hero','slogan'])assert(has(`public/marketing/train/${k}.webp`),`train ${k} screenshot exists`);
 for(const k of ['TRAIN_COUNT','HEADWAY','TRAIN_STATIONS','WRAP_THEMES','PANELS','SPONSOR_TAG'])assert(tr.includes(k),`train facts read from the game: ${k}`);
 assert.match(doc,/TRAIN_PACKAGE/,'the packages page carries the train package');
 assert.match(kit,/\{id:'train',title:/,'the all-placements page lists the trains');
 assert(!/Express|departure board/i.test(strip(tr).replace(/^\s*\*.*$/gm,'')),'no named train: it is not built');
 assert(!/\$\s?\d|£\s?\d|€\s?\d|per month|per year|USD|price:\s*\d/i.test(tr),'no prices in the train chapter');}

// ---- 4. a built site ----
const dist=path.join(root,process.env.NEXT_DIST_DIR||'.next'),app=path.join(dist,'server/app');
if(!fs.existsSync(path.join(app,'marketing.html'))){console.log('marketing page ok (sources; SKIP built checks: no build with /marketing)');process.exit(0);}
{const h=fs.readFileSync(path.join(app,'marketing.html'),'utf8');
 assert(!/<meta name="robots" content="noindex/.test(h),'/marketing: open to search (no noindex)');
 assert(/<link rel="canonical" href="https:\/\/futbolisland\.app\/marketing"/.test(h),'/marketing: canonical');}
{const h=fs.readFileSync(path.join(app,'marketing/overview.html'),'utf8');
 assert.match(h,/<meta name="robots" content="noindex, nofollow/,'/marketing/overview: robots noindex, nofollow');
 assert(!/<meta property="og:/.test(h),'/marketing/overview: no Open Graph card');}
if(fs.existsSync(path.join(app,'sitemap.xml.body'))){const b=require('./lib/builtSitemap.cjs')(app);assert(/\/marketing</.test(b)&&!/marketing\/overview/.test(b),'the built sitemap lists /marketing but not its print page');}
console.log('marketing page ok (sources and build)');
