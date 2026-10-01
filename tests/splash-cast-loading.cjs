// Splash cast loading (Oct 1 2026, docs/performance-guide.md "Splash cast arrives with the splash"): the baked bean stills
// must arrive WITH the loading screen, not 0.5–1.1 s after it. Pins: one high-priority, media-scoped preload per character
// the layout shows (a phone fetches 3 files, not 10), AVIF twins under a size budget at the manifest's sizes, lazy <img>s
// so the hidden group never downloads, inline placeholders under budget, and a short unstaggered entrance.
// Browser timing check: scripts/check-splash-cast-timing-browser.cjs.
// usage: node tests/splash-cast-loading.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const cast=read('components/LoadingBeanCast.tsx'),css=read('components/IslandLoading.module.css');
const manifest=JSON.parse(read('public/splash/cast.json')),inline=JSON.parse(read('components/splashInline.json'));
const IDS=['hero-kick','hero-cheer','keeper','cat','rival'],ROW=['cat','hero-kick','hero-cheer'];

// ---- 1. Preloads: media-scoped, high priority, best format, one per shown character ------------------------------------------
assert.match(cast,/<link key=\{g\+c\.id\} rel="preload" as="image" type=\{`image\/\$\{best\}`\} href=\{src\(c\.id,best\)\.large\} imageSrcSet=\{srcSet\(c\.id,best\)\} imageSizes=\{sizes\(g,c\.id,c\.s\)\} media=\{CAST_GROUP_MEDIA\[g\]\} fetchPriority="high"\/>/,'one <link rel=preload> per group member, with its group media, sizes and high priority');
assert.match(cast,/const best=avif\?'avif':'webp';/);assert.match(cast,/avif=variant==='island'/,'main splash preloads AVIF; arcade keeps WebP');
// react-dom preload() in this React build drops `media`, which is what made phones fetch every group's files.
assert.doesNotMatch(cast,/import \{[^}]*\bpreload\b[^}]*\} from 'react-dom'/,'no react-dom preload() (it loses media)');
// The preload media strings are exactly the CSS breakpoint that swaps the portrait row for the wide flanks.
assert.match(cast,/const CAST_GROUP_MEDIA=\{row:'\(max-aspect-ratio:5\/6\)',left:'not all and \(max-aspect-ratio:5\/6\)',right:'not all and \(max-aspect-ratio:5\/6\)'\}/);
assert.match(css,/\.row\{display:none\}/);assert.match(css,/@media\(max-aspect-ratio:5\/6\)\{\n \.left,\.right\{display:none\}\n \.row\{display:block;/,'row shows exactly at (max-aspect-ratio:5/6)');
// Groups: the phone row holds exactly the three row characters (so a phone preloads 3 stills).
const groupItems=g=>{const m=cast.match(new RegExp(` ${g}:\\{w:\\d+,h:\\d+,items:\\[(.*?)\\]\\}`));assert(m,g);return [...m[1].matchAll(/id:'([\w-]+)'/g)].map(x=>x[1]);};
assert.deepEqual(groupItems('row').sort(),[...ROW].sort());assert.deepEqual([...groupItems('left'),...groupItems('right')].sort(),[...IDS].sort());

// ---- 2. <img>: lazy (hidden group never downloads; no automatic React head preload), AVIF <source>, WebP fallback --------------
assert.match(cast,/<img className=\{styles\.castMember\} data-cast=\{c\.id\}[^>]*src=\{src\(c\.id\)\.large\} srcSet=\{srcSet\(c\.id\)\}[^>]*loading="lazy" decoding="async" fetchPriority="high"/);
assert.match(cast,/<picture key=\{c\.id\}>\{avif&&<source type="image\/avif" srcSet=\{srcSet\(c\.id,'avif'\)\} sizes=\{sizes\(g,c\.id,c\.s\)\}\/>\}\{img\}<\/picture>/);
assert.match(cast,/backgroundImage:`var\(--inline-\$\{c\.id\}\)`/,'inline placeholder under every still');

// ---- 3. Files and size budget ----------------------------------------------------------------------------------------------
/** Width/height from the AVIF 'ispe' box. */
const avifSize=buf=>{const i=buf.indexOf('ispe');assert(i>0,'ispe box');return [buf.readUInt32BE(i+8),buf.readUInt32BE(i+12)];};
const size=f=>fs.statSync(path.join(ROOT,'public/splash',f)).size;
let rowBytes=0,allBytes=0;
for(const id of IDS){
 const m=manifest[id];assert(m&&m.width>0&&m.sm,id+' in cast.json');
 for(const f of [`${id}.webp`,`${id}-sm.webp`,`${id}.avif`,`${id}-sm.avif`])assert(fs.existsSync(path.join(ROOT,'public/splash',f)),f);
 assert.deepEqual(avifSize(fs.readFileSync(path.join(ROOT,'public/splash',id+'.avif'))),[m.width,m.height],id+'.avif at the manifest size');
 const [sw,sh]=avifSize(fs.readFileSync(path.join(ROOT,'public/splash',id+'-sm.avif')));assert(Math.abs(sw-m.sm[0])<=1&&sh===m.sm[1],id+'-sm.avif at the manifest size');
 assert(size(id+'.avif')<=13*1024,`${id}.avif ${size(id+'.avif')} B ≤ 13 KB`);assert(size(id+'-sm.avif')<=8*1024,`${id}-sm.avif ≤ 8 KB`);
 assert(size(id+'.avif')<size(id+'.webp'),id+': AVIF smaller than the WebP fallback');
 allBytes+=size(id+'.avif');if(ROW.includes(id))rowBytes+=size(id+'.avif');
}
assert(rowBytes<=34*1024,`phone row stills ${rowBytes} B ≤ 34 KB`);assert(allBytes<=56*1024,`desktop stills ${allBytes} B ≤ 56 KB`);
// Placeholders ride in the HTML: keep them small.
assert.deepEqual(Object.keys(inline).sort(),[...IDS].sort());
const inlineChars=Object.values(inline).reduce((n,u)=>n+u.length,0);assert(inlineChars<=23000,`inline placeholders ${inlineChars} chars ≤ 23000`);
for(const u of Object.values(inline))assert.match(u,/^data:image\/webp;base64,/);

// ---- 4. Entrance: short, unstaggered, compositor-only; exit order kept via --x -------------------------------------------------
const pop=css.match(/\.castMember\{[^}]*animation:castPop ([\d.]+)s var\(--d\)/);assert(pop&&Number(pop[1])<=.45,'castPop ≤ .45 s');
const kf=css.match(/@keyframes castPop\{0%\{opacity:0;[^}]*\}(\d+)%\{opacity:1\}/);assert(kf&&Number(kf[1])<=30,'opacity full within the first 30 %');
assert.match(cast,/'--d':`\$\{i\*\.03\}s`/,'≤ 30 ms per item (max 60 ms in a group of 3)');
assert(Math.max(...['left','right','row'].map(g=>groupItems(g).length))<=3);
assert.doesNotMatch(css,/castMember:nth-child/,'no :nth-child (each still sits alone in its <picture>)');
assert.match(css,/\.exiting \.castMember\{animation:castAway \.4s var\(--x,0s\) both ease-in\}/);assert.match(cast,/const EXIT_DELAY=\[\.12,\.04,\.18,0,0\];/);
assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{\.castMember,\.exiting \.castMember\{animation:none\}/,'reduced motion: no entrance');

// ---- 5. Render script keeps producing the AVIF twins --------------------------------------------------------------------------
const render=read('scripts/render-splash-characters.cjs');
assert.match(render,/if\(!arcade\)encodeAvif\(png,c\.id,h2\);/);assert.match(render,/'-q','50','--qalpha','75'/);
console.log(`splash-cast-loading: ok (phone row ${(rowBytes/1024).toFixed(1)} KB, all stills ${(allBytes/1024).toFixed(1)} KB, placeholders ${inlineChars} chars)`);
