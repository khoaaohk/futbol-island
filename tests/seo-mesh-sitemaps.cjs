// SEO mesh, split sitemaps and feed (Nov 21 2026, owner approved; lib/site/mesh.ts, lib/site/sitemaps.ts, lib/site/feed.ts).
//  1. Mesh: every rule, term, drill, drill guide, plan, position, formation, comparison and lesson page gets up to 8 siblings of its own
//     family (all of them when the family is smaller) and up to 3 pages of other families, one per family; no self link, none twice,
//     every target a sitemap page, the same answer on every call (deterministic), the page's read-next pair and skipped paths left out;
//     Spanish links are Spanish pages only. Every page that renders a "Keep reading" grid on a family page passes through withMesh.
//  2. Sitemaps: the family sitemaps hold every sitemap entry exactly once, with the same lastmod, priority and hreflang; the index
//     names each family once; the XML is well formed (balanced tags); robots.txt still names /sitemap.xml, the image and video sitemaps.
//  3. Feed: 50 entries, newest first, unique ids, every one a sitemap page with its sitemap date; well-formed Atom; pageMeta names it.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {L,read,root}=require('./lib/tsLoad.cjs');
const mesh=L('lib/site/mesh.ts'),sm=L('lib/site/sitemaps.ts'),feed=L('lib/site/feed.ts'),paths=L('lib/site/paths.ts'),rn=L('lib/site/readNext.ts'),ep=L('lib/i18n/esPaths.ts');
const SP=paths.sitePaths(),PATHS=new Set(SP.map(p=>p.path));
// ---- 1. mesh
const all=mesh.meshPaths(),fam=new Map(all.map(p=>[p,mesh.meshFamilyOf(p)])),size=f=>all.filter(p=>fam.get(p)===f).length;
assert(all.length>=250,`mesh covers the family pages (${all.length})`);
let total=0;
for(const p of all){
 assert(PATHS.has(p),`${p}: a mesh page is a sitemap page`);
 const ls=mesh.meshLinks(p),f=fam.get(p),r=rn.readNext(p),near=new Set(r?[r.prev.path,r.next.path]:[]);
 assert.deepEqual(mesh.meshLinks(p),ls,`${p}: deterministic`);
 assert(ls.every(l=>l.path!==p&&PATHS.has(l.path)&&l.name),`${p}: real targets with words`);
 assert.equal(new Set(ls.map(l=>l.path)).size,ls.length,`${p}: no link twice`);
 assert(!ls.some(l=>near.has(l.path)),`${p}: not the read-next pair again`);
 const same=ls.filter(l=>fam.get(l.path)===f).length,cross=ls.filter(l=>fam.get(l.path)!==f);
 assert(same>=Math.min(mesh.MESH_SAME,size(f)-1-near.size),`${p}: ${same} siblings`);
 assert(cross.length>=2&&cross.length<=mesh.MESH_CROSS&&new Set(cross.map(l=>fam.get(l.path))).size===cross.length,`${p}: 2-3 cross-family links, one per family`);
 const skip=ls.slice(0,2).map(l=>l.path),again=mesh.meshLinks(p,{skip});assert(!again.some(l=>skip.includes(l.path)),`${p}: skipped paths stay out`);
 if(ep.hasEs(p)){const es=mesh.meshLinks(p,{lang:'es'});assert(es.length>0&&es.every(l=>l.path.startsWith('/es/')&&ep.hasEs(ep.toEn(l.path))),`${p}: Spanish links are Spanish pages`);}
 total+=ls.length;
}
for(const f of ['app/(site)/learn/soccer-rules/[slug]/page.tsx','app/(site)/learn/soccer-terms/[slug]/page.tsx','app/(site)/learn/soccer-drills/[slug]/page.tsx','app/(site)/learn/soccer-practice-plans/[slug]/page.tsx',
 'app/(site)/learn/soccer-positions/[slug]/page.tsx','app/(site)/learn/soccer-formations/[slug]/page.tsx','components/site/ComparePage.tsx','components/es/pages/GuidesEs.tsx','components/es/pages/FormationsEs.tsx','components/es/pages/DrillsEs.tsx'])
 assert(/groups=\{withMesh\(/.test(read(f)),`${f}: Keep reading goes through withMesh`);
for(const f of ['app/(site)/learn/lessons/[slug]/page.tsx','components/es/pages/LessonsEs.tsx'])assert(/meshLinks\(lessonPath\(l\.id\)/.test(read(f)),`${f}: lesson siblings add the mesh`);
// ---- 2. sitemaps
const entries=sm.sitemapEntries(),fams=sm.sitemapFamilies(),flat=fams.flatMap(f=>f.entries);
assert.equal(flat.length,entries.length,'every entry in one family');assert.equal(new Set(flat.map(e=>e.url)).size,entries.length,'no URL twice');
assert.deepEqual([...flat].sort((a,b)=>a.url<b.url?-1:1),[...entries].sort((a,b)=>a.url<b.url?-1:1),'same entries, same lastmod, priority and hreflang');
for(const {family,entries:es} of fams){assert(es.every(e=>sm.familyOf(e.url.slice(sm.familySitemapPath?'https://futbolisland.app'.length:0)||'/')===family),`${family}: every URL belongs`);
 const x=sm.familySitemapXml(family);assert(x.startsWith('<?xml')&&x.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')&&(x.match(/<url>/g)||[]).length===es.length&&(x.match(/<\/url>/g)||[]).length===es.length,`${family}: urlset`);
 for(const e of es)assert(x.includes(`<loc>${e.url}</loc>`)&&x.includes(`<lastmod>${e.lastModified}</lastmod>`),`${family}: ${e.url}`);}
assert.equal(sm.familySitemapXml('nope'),null,'an unknown family has no sitemap');
const idx=sm.sitemapIndexXml(),locs=[...idx.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
assert(idx.includes('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')&&idx.trim().endsWith('</sitemapindex>'),'index');
assert.deepEqual(locs,fams.map(f=>`https://futbolisland.app/sitemaps/${f.family}.xml`),'index names each family once, in order');
assert(fams.some(f=>f.family==='core')&&fams.some(f=>f.family.startsWith('es-')),'core and Spanish families');
assert(!fs.existsSync(path.join(root,'app/sitemap.ts'))&&fs.existsSync(path.join(root,'app/sitemap.xml/route.ts'))&&fs.existsSync(path.join(root,'app/sitemaps/[family]/route.ts')),'route handlers, no app/sitemap.ts');
assert(/\/sitemap\.xml`/.test(read('app/robots.ts'))&&/sitemap-images\.xml/.test(read('app/robots.ts'))&&/sitemap-video\.xml/.test(read('app/robots.ts')),'robots.txt names the index and the image and video sitemaps');
// ---- 3. feed
const fe=feed.feedEntries(),byPath=new Map(SP.map(p=>[p.path,p]));
assert.equal(fe.length,50,'50 feed entries');assert.equal(new Set(fe.map(e=>e.path)).size,50,'unique');
for(let i=0;i<fe.length;i++){const e=fe[i];assert(byPath.has(e.path)&&byPath.get(e.path).lastmod===e.updated,`${e.path}: sitemap page, sitemap date`);assert(e.title&&e.summary,`${e.path}: title and summary`);if(i)assert(fe[i-1].updated>=e.updated,'newest first');}
const fx=feed.feedXml();assert(fx.startsWith('<?xml')&&fx.includes('<feed xmlns="http://www.w3.org/2005/Atom"')&&(fx.match(/<entry>/g)||[]).length===50&&(fx.match(/<\/entry>/g)||[]).length===50,'Atom feed');
assert(!/&(?!amp;|lt;|gt;|quot;)/.test(fx),'feed text is escaped');
assert(/types:FEED_TYPES/.test(read('lib/site/seo.ts'))&&/types:FEED_TYPES/.test(read('app/play/page.tsx')),'pages name the feed in <head>');
console.log(`seo-mesh-sitemaps: ok (${all.length} mesh pages, ${total} mesh links; ${fams.length} family sitemaps, ${entries.length} URLs; feed ${fe.length})`);
