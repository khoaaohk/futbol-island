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
 assert.equal((html.match(/href="\/play"/g)||[]).length,3,'the Play button, at the top, at the foot of the group menu and at the close');
 {const menu=html.match(/<nav[^>]*id="library-menu"[^>]*>([\s\S]*?)<\/nav>/);assert(menu&&/aria-label="Library groups"/.test(menu[0]),'the group menu is a labelled nav');
  for(const g of groups)assert(menu[1].includes(`href="#group-${g.id}"`)&&html.includes(`id="group-${g.id}"`),`menu jumps to ${g.id}`);}
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
 // the header (owner, Nov 20 2026 evening: "Learn, Game, and Library"): three links and Play, in both languages
 assert.match(nav,/\[\[LESSONS_INDEX,'Learn'\],\['\/games','Games','games'\],\[LIBRARY_PATH,'Library','library'\]\]/,'header: Learn, Games, Library');
 assert.match(navEs,/\[\[toEs\('\/learn\/lessons'\),'Aprender'\],\['\/games','Juegos','games'\],\[toEs\(ES_LIBRARY\),'Biblioteca','library'\]\]/,'Spanish header: Aprender, Juegos, Biblioteca');
 for(const l of ['Explore','Friends','Safety','About'])assert(!nav.includes(`'${l}'`),`header has no ${l}`);
 {const lay=read('app/(site)/layout.tsx'),layEs=read('app/es/layout.tsx');assert(/<a href="\/about">About<\/a>/.test(lay)&&/<a href=\{SAFE_GUIDE\.path\}>Safety<\/a>/.test(lay),'About and Safety are in the footer');
  assert(/<a href=\{toEs\('\/about'\)\}>Acerca de<\/a>/.test(layEs)&&/safe-football-game-for-kids'\)\}>Seguridad<\/a>/.test(layEs),'and in the Spanish footer');}
 assert.match(home,/const NAV_PAGES:\[string,string\]\[\]=\[\[LIBRARY_PATH,'Library'\]\];/);assert.match(home,/<MobileMenu links=\{NAV\} pages=\{NAV_PAGES\}\/>/,'the home bar and its phone menu have Library too');
 // the selected state: a server-rendered bar cannot know its page, so the Library ([data-library-hero]) and the games pages ([data-games-page]) mark themselves and CSS shows the selected copy (desktop list and phone menu)
 {const css=read('app/(site)/site.module.css');
  assert.match(css,/\.page:has\(\[data-library-hero\]\) \.navLinks a\[data-nav-cur=library\],\.page:has\(\[data-games-page\]\) \.navLinks a\[data-nav-cur=games\]\{[^}]*background:var\(--btn-pink/,'desktop: Library on the Library, Games on the games pages');
  assert.match(css,/\.page:has\(\[data-library-hero\]\) \.menuList a\[data-nav-cur=library\],\.page:has\(\[data-games-page\]\) \.menuList a\[data-nav-cur=games\]\{[^}]*background:var\(--btn-pink/,'phone menu too');
  assert.equal((css.match(/:has\(\[data-(library-hero|games-page)\]\)[^{]*\{[^}]*btn-pink/g)||[]).length,2,'only the marked links are selected');assert(!/href\$="\/library"\]\{/.test(css),'never by href: the Spanish bar\'s English switch also ends in /library');assert(/data-library-hero=""/.test(html)&&/data-library-hero=""/.test(eh),'both Library pages carry the marker');
  assert.match(read('components/site/games/GameParts.tsx'),/<header className=\{site\.intro\} data-games-page="">/,'the games pages carry their marker');
  for(const f of ['app/(site)/learn/lessons/page.tsx','components/site/LessonHub.tsx','lib/site/GuideParts.tsx'])assert(!/data-library-hero|data-games-page/.test(read(f)),`${f}: no marker, so nothing is selected there`);
  assert.match(css,/\.page \.nav a\[data-nav-cur\]\{display:none\}/,'the selected copies are hidden on every other page');
  assert.match(css,/\.page:has\(\[data-library-hero\]\) \.nav a\[data-nav-page=library\],\.page:has\(\[data-games-page\]\) \.nav a\[data-nav-page=games\]\{display:none\}/,'and the plain copy is hidden on its own pages');}
 /* aria-current: only the selected copies carry it, one Games and one Library per list, in both languages */
 {const bar=render(React.createElement(L('components/site/SiteNav.tsx').default)),cur=[...bar.matchAll(/<a href="([^"]+)" data-nav-cur="[a-z]+" aria-current="page">/g)].map(m=>m[1]);
  assert.deepEqual(cur,['/games','/library','/games','/library'],'English bar: Games and Library (desktop list and phone menu)');assert.equal((bar.match(/aria-current/g)||[]).length,4);
  const barEs=render(React.createElement(L('components/es/SiteNavEs.tsx').default)),curEs=[...barEs.matchAll(/<a href="([^"]+)" data-nav-cur="[a-z]+" aria-current="page">/g)].map(m=>m[1]);
  assert.deepEqual(curEs,['/games','/es/library','/games','/es/library'],'Spanish bar: Juegos and Biblioteca');assert.equal((barEs.match(/aria-current/g)||[]).length,4);}
 const cfg=await import(require('node:path').join(root,'next.config.mjs')),red=await cfg.default('phase-production-build').redirects();
 const r=red.find(x=>x.source==='/learn'),re=red.find(x=>x.source==='/es/learn');
 assert.deepEqual([r.destination,r.permanent,r.missing],['/library',true,[{type:'query',key:'q'}]],'plain /learn -> /library; /learn?q= is the search');
 assert.deepEqual([re.destination,re.permanent,re.missing],['/es/library',true,[{type:'query',key:'q'}]]);
 assert.match(read('app/(site)/learn/page.tsx'),/LearnSearch/,'/learn?q= is still the search page');
 console.log(`library ok: ${cards.length} cards in ${groups.length} groups, title ${W.title.length}, description ${W.description.length}`);
})().catch(e=>{console.error(e);process.exit(1);});
