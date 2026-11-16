// Club embeds (seo-extras, Nov 15 2026; app/embed, lib/site/tools/embed.ts, components/site/tools/EmbedSnippet.tsx):
//  1. /embed/<slug> exists for every lineup builder and playing-time page, static, unknown slugs 404.
//  2. Each embed: noindex,follow with the canonical on the tool page; no site nav or footer; exactly ONE link, the
//     "Made with Futbol Island" attribution to the tool page with target=_blank rel=noopener; no script tags; no images from elsewhere.
//  3. Headers: X-Frame-Options SAMEORIGIN everywhere but /embed/*; /embed/* gets frame-ancestors * and X-Robots-Tag noindex
//     (the full header rules are in tests/security-headers.cjs).
//  4. No beacons: VisitTracker, ErrorBeacon and WelcomeTally skip /embed paths; the embed files import no analytics.
//  5. Each tool page shows "Use this on your club's website" with an iframe snippet for its embed.
// usage: node tests/seo-embed.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {root,L,read,render,React}=require('./lib/tsLoad.cjs');process.chdir(root);
const em=L('lib/site/tools/embed.ts'),reg=L('lib/site/tools/registry.ts'),iE=L('lib/embed/isEmbed.ts');
(async()=>{
 const P=L('app/embed/[tool]/page.tsx'),src=read('app/embed/[tool]/page.tsx');
 assert(/export const dynamic='force-static'/.test(src)&&/dynamicParams=false/.test(src),'static, unknown slugs 404');
 const slugs=P.generateStaticParams().map(x=>x.tool);
 assert.deepEqual(slugs,[...reg.LINEUP_PAGES,...reg.PLANNER_PAGES].map(p=>p.slug),'an embed per lineup builder and planner');
 assert(slugs.some(s=>/lineup-builder$/.test(s))&&slugs.includes('soccer-playing-time-calculator'));
 assert.throws(()=>render(React.createElement(P.default,{params:{tool:'nope'}})),/NEXT_NOT_FOUND/);
 const layout=render(React.createElement(L('app/embed/layout.tsx').default,{children:null}));
 assert(!/<header|<footer|<nav/.test(layout),'the embed layout has no site chrome');
 for(const s of slugs){
  const t=em.embedTool(s),m=P.generateMetadata({params:{tool:s}});
  assert.deepEqual(m.robots,{index:false,follow:true},`${s}: noindex`);assert.equal(m.alternates.canonical,`https://futbolisland.app${t.path}`,`${s}: canonical on the tool page`);
  const h=render(React.createElement(P.default,{params:{tool:s}}));
  const links=[...h.matchAll(/<a\b[^>]*>/g)].map(x=>x[0]);
  assert.equal(links.length,1,`${s}: one link only (${links.length})`);
  assert(links[0].includes(`href="${t.path}"`)&&/target="_blank"/.test(links[0])&&/rel="noopener"/.test(links[0]),`${s}: the attribution link`);
  assert(/Made with Futbol Island<\/a>/.test(h),`${s}: attribution text`);
  assert(!/<script(?![^>]*application\/ld\+json)/.test(h),`${s}: no scripts in the page body`);
  assert(!/src="https?:\/\//.test(h),`${s}: nothing loaded from elsewhere`);
 }
 // headers
 const cfg=await import(path.join(root,'next.config.mjs'));const rules=await cfg.default('phase-production-build').headers();
 const {pathToRegexp}=require('next/dist/compiled/path-to-regexp');
 const headersFor=p=>{const out={};for(const r of rules){if(r.has)continue;if(pathToRegexp(r.source,[],{strict:false,delimiter:'/'}).test(p))for(const x of r.headers)out[x.key]=x.value;}return out;};
 for(const s of slugs){const h=headersFor(em.embedPath(s));assert.equal(h['X-Frame-Options'],undefined,`${s}: framable`);assert(/frame-ancestors \*/.test(h['Content-Security-Policy-Report-Only']));assert.equal(h['X-Robots-Tag'],'noindex');}
 for(const p of ['/','/play','/tools/soccer-lineup-builder','/learn/lessons']){const h=headersFor(p);assert.equal(h['X-Frame-Options'],'SAMEORIGIN',`${p}: SAMEORIGIN`);assert(/frame-ancestors 'self'/.test(h['Content-Security-Policy-Report-Only']),`${p}: frame-ancestors 'self'`);}
 // beacons
 assert(iE.isEmbedPath('/embed/7v7-lineup-builder')&&iE.isEmbedPath('/embed')&&!iE.isEmbedPath('/embedded')&&!iE.isEmbedPath('/tools/x'));
 assert(/if\(inEmbed\(\)\)return;/.test(read('components/VisitTracker.tsx')),'VisitTracker skips embeds');
 assert(/\\\/embed\(\\\/\|\$\)/.test(read('components/ErrorBeacon.tsx')),'ErrorBeacon skips embeds');
 assert(/inEmbed\(\)\?undefined:startWelcomeTally/.test(read('components/WelcomeTally.tsx')),'WelcomeTally skips embeds');
 for(const f of ['app/embed/[tool]/page.tsx','app/embed/layout.tsx','lib/site/tools/embed.ts'])assert(!/analytics|sendBeacon|fetch\(|cookie/i.test(read(f).replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm,'')),`${f}: no analytics, network or cookies`);
 // snippet on tool pages
 const TP=L('app/(site)/tools/[slug]/page.tsx');
 for(const s of slugs){const h=render(React.createElement(TP.default,{params:{slug:s}}));
  assert(/Use this on your club’s website/.test(h),`/tools/${s}: the embed box`);
  assert(h.includes(`&lt;iframe src=&quot;https://futbolisland.app/embed/${s}&quot;`),`/tools/${s}: the iframe snippet`);}
 const sn=em.embedSnippet(em.embedTool('soccer-lineup-builder'));
 assert(/^<iframe src="https:\/\/futbolisland\.app\/embed\/soccer-lineup-builder" title="[^"]+" width="100%" height="\d+" style="[^"]+" loading="lazy" referrerpolicy="strict-origin"><\/iframe>$/.test(sn),'snippet shape');
 console.log(`seo-embed: ok (${slugs.length} embeds)`);
})().catch(e=>{console.error(e);process.exit(1);});
