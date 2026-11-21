// The Library (/library, owner Nov 20 2026; lib/site/library.ts, components/site/LibraryPage.tsx):
//  1. It houses exactly the footer's link row (lib/site/footerHubs.ts): every footer link is one card, no more, and the footer reads the same list.
//  2. Every count on a card is the length of the data behind the linked page, never a typed number.
//  3. Title <= 60, description 120-155, canonical, hreflang pair, BreadcrumbList + CollectionPage JSON-LD; in the sitemap, both languages.
//  4. The header: Learn (unchanged) ... About, Library; the home bar and the Spanish bar too. Plain /learn redirects to /library, /learn?q= stays the search.
//  5. Kid-safe copy: no em dash, no link to /marketing; pictures have alt, width and height and only the hero loads eagerly.
const assert=require('node:assert/strict');
const {root,L,read,render,React}=require('./lib/tsLoad.cjs');process.chdir(root);
(async()=>{
 const lib=L('lib/site/library.ts'),foot=L('lib/site/footerHubs.ts'),paths=L('lib/site/paths.ts'),ep=L('lib/i18n/esPaths.ts'),W=lib.LIBRARY_EN;
 // 1
 const groups=lib.libraryGroups(),cards=groups.flatMap(g=>g.cards);
 assert.deepEqual(cards.map(c=>c.href).sort(),foot.FOOTER_HUBS.map(x=>x[0]).sort(),'one card per footer link');
 assert.deepEqual(groups.map(g=>g.id),['game','train','play','collect']);
 for(const [p,label] of foot.FOOTER_HUBS)assert.equal(W.items[p].name,label,`${p}: the card has the footer's name`);
 assert.match(read('app/(site)/layout.tsx'),/import \{FOOTER_HUBS\} from '@\/lib\/site\/footerHubs'/,'the footer reads the shared list');
 const PATHS=new Set(paths.sitePaths().map(p=>p.path));for(const c of cards)assert(PATHS.has(c.href),`${c.href} is a sitemap page`);
 // 2
 const n={'/learn/lessons':L('lib/site/lessons.ts').LESSONS.length,'/learn/soccer-terms':L('lib/site/terms.ts').TERM_PAGES.length,'/learn/soccer-rules':L('lib/site/rules.ts').RULES.length,
  '/learn/soccer-drills':L('lib/site/drills.ts').DRILLS.length,'/books':L('lib/site/books.ts').BUILT_BOOKS.length,'/games':L('lib/site/games.ts').GAME_PAGES.length,'/cards':L('lib/site/cards.ts').SITE_CARDS.length};
 for(const [p,k] of Object.entries(n)){const c=cards.find(x=>x.href===p);assert(k>0&&c.count.startsWith(k+' '),`${p}: count ${c.count} is the data's (${k})`);}
 assert.equal(cards.find(c=>c.href==='/learn/soccer-age-groups').count,undefined,'no count where there is none to derive');
 for(const t of [W.lead,W.description,W.playLine,...Object.values(W.groups).map(g=>g.line),...Object.values(W.items).map(x=>x.line)])assert(!/\d{2,}/.test(t.replace(/11v11|U1[02]|7 to 12/g,'')),`no typed count in the words: ${t}`);
 // 3
 const seo=L('lib/site/seo.ts'),meta=seo.pageMeta(W.title,W.description,lib.LIBRARY_PATH,{whole:true,type:'website'});
 assert.equal(meta.title,W.title);assert(W.title.length<=60,`title ${W.title.length}`);assert(W.description.length>=120&&W.description.length<=155,`description ${W.description.length}`);
 assert.equal(meta.alternates.canonical,'/library');assert.deepEqual(meta.alternates.languages,{en:'/library',es:'/es/library','x-default':'/library'});
 assert(PATHS.has('/library')&&ep.hasEs('/library'),'in the sitemap, in both languages');assert(!PATHS.has('/learn'),'/learn is not a page');
 const page=read('app/(site)/library/page.tsx');assert.match(page,/breadcrumbLd\(CRUMBS\)/);assert.match(page,/collectionLd\(\{name:W\.h1,path:LIBRARY_PATH/);assert.match(page,/export const dynamic='force-static'/);
 const html=render(React.createElement(L('app/(site)/library/page.tsx').default));
 assert.equal((html.match(/<h1/g)||[]).length,1);assert.match(html,/<h1[^>]*>The Futbol Island library<\/h1>/);
 for(const c of cards)assert(html.includes(`href="${c.href}"`),`${c.href} is linked`);
 assert.equal((html.match(/href="\/play"/g)||[]).length,2,'the Play button, at the top and at the close');
 assert(!/\/marketing/.test(html)&&!/—/.test(html),'no /marketing link, no em dash');
 const imgs=[...html.matchAll(/<img [^>]*>/g)].map(m=>m[0]);assert(imgs.length>=cards.length,'a picture on every card');
 for(const i of imgs)assert(/ alt="[^"]{8,}"/.test(i)&&/ width="\d+"/.test(i)&&/ height="\d+"/.test(i),`alt, width, height: ${i.slice(0,80)}`);
 assert.equal(imgs.filter(i=>!/loading="lazy"/.test(i)).length,2,'only the two hero pictures load eagerly');
 // Spanish
 const es=L('components/es/routes.tsx').esRoute('/library'),em=es.meta(),eh=render(es.render()),E=L('components/es/pages/LibraryEs.tsx');
 assert(em.title.absolute.length<=60&&em.description.length>=120&&em.description.length<=155,`Spanish title ${em.title.absolute.length}, description ${em.description.length}`);
 assert.equal(em.alternates.canonical,'/es/library');assert.match(eh,/<h1[^>]*>La biblioteca de Futbol Island<\/h1>/);
 for(const c of E.libraryGroupsEs().flatMap(g=>g.cards)){assert(eh.includes(`href="${c.href}"`));if(!c.href.startsWith('/es/'))assert(/\(en inglés\)$/.test(c.name),`${c.href}: an English page says so`);else assert(ep.hasEs(ep.toEn(c.href)),`${c.href}: a Spanish page`);}
 assert.equal(E.libraryGroupsEs().flatMap(g=>g.cards).length,cards.length);assert(!/—/.test(eh));
 // 4
 const nav=read('components/site/SiteNav.tsx'),navEs=read('components/es/SiteNavEs.tsx'),home=read('app/(site)/page.tsx');
 assert.match(nav,/\[LESSONS_INDEX,'Learn'\],\['\/#explore','Explore'\],\['\/#together','Friends'\],\[SAFE_GUIDE\.path,'Safety'\],\['\/about','About'\],\[LIBRARY_PATH,'Library'\]\]/,'header: Learn, Explore, Friends, Safety, About, Library');
 assert.match(navEs,/\[toEs\('\/about'\),'Acerca de'\],\[toEs\(ES_LIBRARY\),'Biblioteca'\]\]/,'Spanish header: Biblioteca after Acerca de');
 assert.match(home,/const NAV_PAGES:\[string,string\]\[\]=\[\[LIBRARY_PATH,'Library'\]\];/);assert.match(home,/<MobileMenu links=\{NAV\} pages=\{NAV_PAGES\}\/>/,'the home bar and its phone menu have Library too');
 const cfg=await import(require('node:path').join(root,'next.config.mjs')),red=await cfg.default('phase-production-build').redirects();
 const r=red.find(x=>x.source==='/learn'),re=red.find(x=>x.source==='/es/learn');
 assert.deepEqual([r.destination,r.permanent,r.missing],['/library',true,[{type:'query',key:'q'}]],'plain /learn -> /library; /learn?q= is the search');
 assert.deepEqual([re.destination,re.permanent,re.missing],['/es/library',true,[{type:'query',key:'q'}]]);
 assert.match(read('app/(site)/learn/page.tsx'),/LearnSearch/,'/learn?q= is still the search page');
 console.log(`library ok: ${cards.length} cards in ${groups.length} groups, title ${W.title.length}, description ${W.description.length}`);
})().catch(e=>{console.error(e);process.exit(1);});
