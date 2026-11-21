// The Library (/library, owner Nov 20 2026; lib/site/library.ts, components/site/LibraryPage.tsx):
//  1. It houses exactly the footer's link row (lib/site/footerHubs.ts): every footer link is one section (one card in the data), no more, and the footer reads the same list.
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
 assert.match(read('components/site/FooterHubs.tsx'),/import \{FOOTER_ES,FOOTER_GROUPS\} from '@\/lib\/site\/footerHubs'/,'the footer reads the shared list');assert(/<FooterHubs\/>/.test(read('app/(site)/layout.tsx'))&&/<FooterHubs es\/>/.test(read('app/es/layout.tsx')),'both footers render it');
 /* Nov 20 2026 (owner: "do we need these in the footer?"; kept for search, tidied): four columns in the Library's groups and order */
 assert.deepEqual(foot.FOOTER_GROUPS.map(g=>g.id),lib.LIBRARY_GROUP_ORDER,'footer columns = Library groups, same order');
 for(const g of foot.FOOTER_GROUPS)assert.deepEqual(g.links.map(x=>x[0]),lib.libraryItemsIn(g.id).map(i=>i.path),`footer column ${g.id}: the Library's items in its order`);
 for(const [p] of foot.FOOTER_HUBS)assert(foot.FOOTER_ES[p],`${p}: a Spanish footer name`);
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
 assert.equal((html.match(/<h1/g)||[]).length,1);/* Nov 20 2026 (new layout SEO, owner: "boost traffic to ... library"): the H1 leads with "Learn soccer" */assert.match(html,/<h1[^>]*>Learn soccer: the Futbol Island library<\/h1>/);
 for(const c of cards)assert(html.includes(`href="${c.href}"`),`${c.href} is linked`);
 assert.equal((html.match(/href="\/play"/g)||[]).length,2,'the Play button, at the top and at the close (none in the group menu: owner, Nov 20 2026)');
 {const menu=html.match(/<nav[^>]*id="library-menu"[^>]*>([\s\S]*?)<\/nav>/);assert(menu&&/aria-label="Library sections"/.test(menu[0]),'the menu is a labelled nav');
  // Nov 20 2026 night, sections (owner: "we need to fix the library page. each of the side nav should smooth scroll the user down to that section.
  // each section is a little information about that section then cta to drill into internal page"): the menu is Overview (#top, lit
  // from the server) and the fifteen sections as in-page anchors in RAIL_ORDER; the page is one <section id> per item in that order,
  // each with its picture, H2, count, sentences, 3-5 real example pages and ONE mint button into the section; no group bands.
  const RO=L('lib/site/railNav.ts').RAIL_ORDER,secs=lib.librarySections(),byPath=Object.fromEntries(secs.map(x=>[x.href,x]));
  assert.deepEqual(secs.map(x=>x.href).sort(),cards.map(c=>c.href).sort(),'one section per footer link');
  const items=[...menu[1].matchAll(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g)].map(m=>[m[1],m[2]]);
  assert.deepEqual(items,[['#top','Overview'],...RO.map(p=>['#'+byPath[p].id,byPath[p].name])],'Overview then the 15 sections, as anchors, in RAIL_ORDER');
  assert(/<a href="#top"[^>]*data-on=""[^>]*>Overview<\/a>/.test(menu[1])&&(menu[1].match(/data-on/g)||[]).length===1&&!/aria-current/.test(menu[1]),'Overview lit from the server, nothing else; anchors are never aria-current');
  const order=[...html.matchAll(/<section id="([a-z-]+)"[^>]*data-library-section/g)].map(m=>m[1]);
  assert.deepEqual(order,RO.map(p=>byPath[p].id),'the sections, in the menu order');assert(!/data-library-group|id="group-/.test(html),'no group bands');
  for(const x of secs){const sec=html.match(new RegExp(`<section id="${x.id}"[\\s\\S]*?</section>`))[0];
   assert.match(sec,new RegExp(`<h2[^>]*>${x.name}</h2>`),`${x.id}: H2`);assert((sec.includes('<img ')&&/loading="lazy"/.test(sec))||/<svg [^>]*role="img" aria-label="[^"]{8,}"[^>]*data-pic-anim=/.test(sec),`${x.id}: a lazy picture, or the drawn picture inline`);
   assert(x.examples.length>=3&&x.examples.length<=5,`${x.id}: 3-5 examples`);for(const e of x.examples){assert(PATHS.has(e.href.split('#')[0]),`${x.id}: example ${e.href} is a real page`);assert(sec.includes(`href="${e.href}"`));}
   assert.equal((sec.match(/class="[^"]*go[^"]*" href=/g)||[]).length,1,`${x.id}: one button`);assert(sec.includes(`href="${x.href}">${x.cta}</a>`),`${x.id}: the button opens the section`);
   if(x.count)assert(!/\d/.test(x.cta)||x.cta.includes(x.count.split(' ')[0]),`${x.id}: the button's number is the count's`);
   assert(x.more.length>40&&!/\d{2,}/.test(x.more.replace(/11v11|U1[02]|2026-27/g,'')),`${x.id}: more words, no typed count`);}
  assert.equal(byPath['/learn/soccer-rules'].cta,`See all ${L('lib/site/rules.ts').RULES.length} rules`);
  // the section hubs' rails still link to the pages, not to anchors
  {const r=L('lib/site/railNav.ts').libraryRail();assert(r.groups[0].items.every(i=>i.href.startsWith('/')),'hub rails: page links');}}
 assert(!/\/marketing/.test(html)&&!/—/.test(html),'no /marketing link, no em dash');
 const imgs=[...html.matchAll(/<img [^>]*>/g)].map(m=>m[0]);/* Nov 20 2026 night (owner: "change these to light colors to match with the marketing side. also if these could animate that would
    be nice"): the eight drawn diagram pictures are inline SVG (lib/site/sectionImage.tsx SectionSvg, played by SectionPicPlayer),
    the rest are <img> */
 const svgs=[...html.matchAll(/<svg [^>]*data-pic-anim="[\d.]+"[^>]*>/g)].map(m=>m[0]);assert.equal(svgs.length,8,'eight drawn pictures inline');
 for(const v of svgs)assert(/role="img"/.test(v)&&/aria-label="[^"]{8,}"/.test(v)&&/viewBox="0 0 1440 900"/.test(v),`drawn picture: role, label, 16:10 ${v.slice(0,80)}`);
 assert(/<svg [^>]*data-pic-anim[\s\S]*?<\/svg>/.test(html)&&!/data-play/.test(html),'the server HTML is the final state (no play attribute)');
 assert(imgs.length+svgs.length>=cards.length,'a picture on every card');
 for(const i of imgs)assert(/ alt="[^"]{8,}"/.test(i)&&/ width="\d+"/.test(i)&&/ height="\d+"/.test(i),`alt, width, height: ${i.slice(0,80)}`);
 assert.equal(imgs.filter(i=>!/loading="lazy"/.test(i)).length,2,'only the two hero pictures load eagerly');
 /* Nov 20 2026 (owner: "the visuals need to match more with the title of the section"): every section picture is 16:10 with no
    baked-in title; the eight diagram sections show their own drawn section picture (lib/site/sectionImage.tsx, a real webp file
    under public/learn/sections/ made by scripts/build-section-pictures.cjs), never a page's 1200 x 630 share card */
 {const fs=require('node:fs'),path=require('node:path'),{webpSize}=L('lib/site/learnMedia.ts'),{SECTION_PICTURES}=L('lib/site/sectionImage.tsx');
  const drawn={'/learn/soccer-rules':'rules','/learn/soccer-terms':'terms','/learn/soccer-drills':'drills','/learn/soccer-positions':'positions','/learn/soccer-formations':'formations',
   '/learn/soccer-practice-plans':'plans','/learn/soccer-age-groups':'ages','/tools':'tools'};
  assert.deepEqual(Object.values(drawn).sort(),Object.keys(SECTION_PICTURES).sort(),'one drawn picture per diagram section');
  for(const [p,pic] of Object.entries(lib.LIBRARY_PICS)){assert(pic,`${p}: a picture`);assert(!pic.src.includes('/learn/diagrams/'),`${p}: not a share card`);
   assert(Math.abs(pic.w/pic.h-1.6)<.01||pic.pos||pic.h>pic.w||Math.abs(pic.w/pic.h-16/9)<.01,`${p}: 16:10, or a photo the frame crops`);
   const file=pic.src.split('?')[0];if(drawn[p])assert.equal(file,`/learn/sections/${drawn[p]}.webp`,`${p}: its drawn section picture`);
   if(file.endsWith('.webp')&&!/^https?:/.test(file)){const sz=webpSize(fs.readFileSync(path.join(root,'public',file)));assert.deepEqual([sz.width,sz.height],[pic.w,pic.h],`${p}: real size ${file}`);}}
  for(const pic of Object.values(lib.GUIDE_PICS)){const sz=webpSize(fs.readFileSync(path.join(root,'public',pic.src.split('?')[0])));assert.deepEqual([sz.width,sz.height],[480,360],`${pic.src}: a 480x360 guide picture`);}}
 // Spanish
 const es=L('components/es/routes.tsx').esRoute('/library'),em=es.meta(),eh=render(es.render()),E=L('components/es/pages/LibraryEs.tsx');
 assert(em.title.absolute.length<=60&&em.description.length>=120&&em.description.length<=155,`Spanish title ${em.title.absolute.length}, description ${em.description.length}`);
 assert.equal(em.alternates.canonical,'/es/library');assert.match(eh,/<h1[^>]*>Aprende fútbol: la biblioteca de Futbol Island<\/h1>/);
 {const es=E.librarySectionsEs();assert.equal(es.length,15);for(const x of es){assert(eh.includes(`<section id="${x.id}"`)&&eh.includes(`href="#${x.id}"`),`es ${x.id}`);assert(eh.includes(`href="${x.href}">${x.cta}</a>`));
   assert(x.examples.length>=3,`es ${x.id}: examples`);for(const e of x.examples)assert(x.href.startsWith('/es/')?e.href.startsWith('/es/')&&ep.hasEs(ep.toEn(e.href.split('#')[0])):!e.href.startsWith('/es/'),`es ${x.id}: ${e.href}`);
   if(!x.href.startsWith('/es/'))assert(/\(en inglés\)$/.test(x.cta),`${x.href}: the button says English`);}
  assert(/<a href="#top"[^>]*data-on=""[^>]*>Resumen<\/a>/.test(eh));}
 for(const c of E.libraryGroupsEs().flatMap(g=>g.cards)){assert(eh.includes(`href="${c.href}"`));if(!c.href.startsWith('/es/'))assert(/\(en inglés\)$/.test(c.name),`${c.href}: an English page says so`);else assert(ep.hasEs(ep.toEn(c.href)),`${c.href}: a Spanish page`);}
 assert.equal(E.libraryGroupsEs().flatMap(g=>g.cards).length,cards.length);assert(!/—/.test(eh));
 // 4
 const nav=read('components/site/SiteNav.tsx'),navEs=read('components/es/SiteNavEs.tsx'),home=read('app/(site)/page.tsx');
 // the header (owner, Nov 20 2026 evening: "Learn, Game, and Library"): three links and Play, in both languages
 assert.match(nav,/\[\['\/','Island'\],\['\/games','Games','games'\],\[LIBRARY_PATH,'Library','library'\]\]/,'header: Learn, Games, Library');
 assert.match(navEs,/\[\['\/es','Isla','island'\],\['\/games','Juegos','games'\],\[toEs\(ES_LIBRARY\),'Biblioteca','library'\]\]/,'Spanish header: Isla (selected on \/es, owner Nov 20 2026), Juegos, Biblioteca');
 for(const l of ['Explore','Friends','Safety','About'])assert(!nav.includes(`'${l}'`),`header has no ${l}`);
 {const lay=read('app/(site)/layout.tsx'),layEs=read('app/es/layout.tsx');assert(/<a href="\/about">About<\/a>/.test(lay)&&/<a href=\{SAFE_GUIDE\.path\}>Safety<\/a>/.test(lay),'About and Safety are in the footer');
  assert(/<a href=\{toEs\('\/about'\)\}>Acerca de<\/a>/.test(layEs)&&/safe-football-game-for-kids'\)\}>Seguridad<\/a>/.test(layEs),'and in the Spanish footer');}
 assert.match(home,/const NAV_PAGES:\[string,string\]\[\]=\[\['\/','Island'\],\['\/games','Games'\],\[LIBRARY_PATH,'Library'\]\];/,'home bar: Island, Games, Library');assert.match(home,/aria-current=\{href==='\/'\?'page':undefined\}/,'Island is selected on the home page from first paint (owner, Nov 20 2026)');assert.match(home,/<MobileMenu links=\{NAV\} pages=\{NAV_PAGES\}\/>/,'the home bar and its phone menu have Library too');
 // the selected state. Nov 20 2026 (owner: "library will go to all the other items"; layout batch 3): Library is selected on every
 // page of a section the Library houses and Games on /games/*, read from the page's breadcrumb (lib/site/navSection.ts ->
 // data-nav-section); the Library ([data-library-hero]) and the games pages ([data-games-page]) keep their markers. Island only on home.
 {const css=read('app/(site)/site.module.css'),ns=L('lib/site/navSection.ts');
  const LIB='.page:has([data-library-hero],[data-nav-section=library])',GAM='.page:has([data-games-page],[data-nav-section=games])';
  assert(css.includes(`${LIB} .nav a[data-nav-cur=library],${GAM} .nav a[data-nav-cur=games]{display:inline-flex}`),'the selected copy shows on its section');
  assert(css.includes(`${LIB} .nav a[data-nav-page=library],${GAM} .nav a[data-nav-page=games]{display:none}`),'and the plain copy is hidden there');
  assert(css.includes(`${LIB} .menuList a[data-nav-cur=library],${GAM} .menuList a[data-nav-cur=games]{`)&&/menuList a\[data-nav-cur=games\]\{[^}]*btn-pink/.test(css),'phone menu too');
  assert(css.includes(`${GAM} .navLinks{--i:1}`)&&css.includes(`${LIB} .navLinks{--i:2}`)&&/\.navChip\{[^}]*width:92px;height:36px[^}]*btn-pink/.test(css),'desktop: one pink chip on the section\'s link');
  assert.match(css,/\.page \.nav a\[data-nav-cur\]\{display:none\}/,'the selected copies are hidden on every other page');
  assert(!/href\$="\/library"\]\{/.test(css),'never by href: the Spanish bar\'s English switch also ends in /library');assert(/data-library-hero=""/.test(html)&&/data-library-hero=""/.test(eh),'both Library pages carry the marker');
  assert.match(read('components/site/games/GameParts.tsx'),/<header className=\{site\.intro\} (?:id="top" )?data-games-page="">/,'the games pages carry their marker');
  for(const p of ['/library','/learn/soccer-rules','/learn/soccer-rules/offside','/learn/soccer-terms/give-and-go','/learn/soccer-drills/sharks-and-minnows','/learn/soccer-positions/goalkeeper','/learn/soccer-formations/7v7-2-3-1','/learn/lessons','/learn/lessons/learn7_roles','/tools/soccer-lineup-builder','/learn/soccer-practice-plans/u6-first-practice','/videos/kit-rush-gameplay','/cards/strikers','/fish/shrimp','/exhibits/laws-1863','/books/messi','/learn/soccer-age-groups','/es/library','/es/learn/soccer-rules/offside','/es/tools/soccer-lineup-builder'])
   assert.equal(ns.navSection(['/',p]),'library',`${p}: Library is selected`);
  for(const p of ['/games','/games/soccer-snake-game'])assert.equal(ns.navSection(['/',p]),'games',`${p}: Games is selected`);
  for(const p of ['/about','/safe-football-game-for-kids','/es/about','/es'])assert.equal(ns.navSection(['/',p]),undefined,`${p}: nothing is selected`);
  assert(/data-nav-section=\{navSection\(crumbs\.map\(c=>c\.path\)\)\}/.test(read('components/site/Breadcrumbs.tsx'))&&/data-nav-section=\{navSection\(crumbs\.map\(c=>c\.path\)\)\}/.test(read('components/es/EsParts.tsx')),'both breadcrumb trails write it');}
 /* aria-current: only the selected copies carry it, one Games and one Library per list, in both languages */
 {const bar=render(React.createElement(L('components/site/SiteNav.tsx').default)),cur=[...bar.matchAll(/<a href="([^"]+)" data-nav-cur="[a-z]+" aria-current="page">/g)].map(m=>m[1]);
  assert.deepEqual(cur,['/games','/library','/games','/library'],'English bar: Games and Library (desktop list and phone menu)');assert.equal((bar.match(/aria-current/g)||[]).length,4);
  const barEs=render(React.createElement(L('components/es/SiteNavEs.tsx').default)),curEs=[...barEs.matchAll(/<a href="([^"]+)" data-nav-cur="[a-z]+" aria-current="page">/g)].map(m=>m[1]);
  assert.deepEqual(curEs,['/es','/games','/es/library','/es','/games','/es/library'],'Spanish bar: Isla (owner, Nov 20 2026: selected on /es), Juegos and Biblioteca');assert.equal((barEs.match(/aria-current/g)||[]).length,6);}
 const cfg=await import(require('node:path').join(root,'next.config.mjs')),red=await cfg.default('phase-production-build').redirects();
 const r=red.find(x=>x.source==='/learn'),re=red.find(x=>x.source==='/es/learn');
 assert.deepEqual([r.destination,r.permanent,r.missing],['/library',true,[{type:'query',key:'q'}]],'plain /learn -> /library; /learn?q= is the search');
 assert.deepEqual([re.destination,re.permanent,re.missing],['/es/library',true,[{type:'query',key:'q'}]]);
 assert.match(read('app/(site)/learn/page.tsx'),/LearnSearch/,'/learn?q= is still the search page');
 console.log(`library ok: ${cards.length} cards in ${groups.length} groups, title ${W.title.length}, description ${W.description.length}`);
})().catch(e=>{console.error(e);process.exit(1);});
