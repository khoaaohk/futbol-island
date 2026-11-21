// The pop-up books on the website (Nov 17 2026; lib/site/books.ts, app/(site)/books, components/site/books):
//  1. Data: every player book in the catalog is on the shelf (36), grouped by region, each with a slug; every book has a page
//     (all 36 since Nov 17 2026) with a summary, facts, 3-5 FAQ items, real exhibits and a still of the game's 3D pop-up spread per chapter (public/books/spreads/<book>/<chapter>.webp, 960×600); the page text is the book's text minus only the action sentence.
//  2. Hub HTML: one h1, every book's title and subtitle, every cover linked to its page (no "on the island now" stand-ins),
//     CollectionPage + BreadcrumbList JSON-LD listing every book.
//  3. Every built page's HTML (/books/<id>; Cafu is the sample): h1, the answer-first summary right after it, every chapter's title, year, text (verbatim
//     paragraphs) and lesson, every source link, the check date, FAQ shown = FAQPage JSON-LD, Book JSON-LD with chapters and
//     citations, BreadcrumbList, the open button as a real link to the story, keep-reading links to the card and position guide.
//  4. Lazy reader: the server page, OpenBook and BookParts import no three.js / game code / registry; the game reader is a
//     dynamic import; the old 2D reader and drawn pictures (BookReader, ChapterArt) are gone; reduced motion is honoured.
//  5. Wiring: sitemap paths, llms.txt lines, pageKeys `books`, the footer link.
//  6. Built site (when a build exists in NEXT_DIST_DIR): /books and /books/cafu are prerendered, and the page's initial JS has no three.js.
// usage: node tests/books-site.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {root,L,read,render,React,ldOf}=require('./lib/tsLoad.cjs');process.chdir(root);
let n=0;const ok=(c,m)=>{assert(c,m);n++;};
const decode=h=>h.replace(/&#x27;|&#39;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const B=L('lib/site/books.ts'),EX=L('lib/site/exhibits.ts'),CAT=L('lib/books/catalog.ts'),LIB=L('lib/books/library.ts');
// ---- 1. data ----
const ids=Object.keys(CAT.PLAYER_BOOKS).filter(i=>i!=='island');
ok(B.SITE_BOOKS.length===ids.length&&ids.length===36,`all 36 player books on the shelf (${B.SITE_BOOKS.length})`);
ok(B.SITE_BOOKS.every(b=>b.region&&b.country&&/^[a-z]+$/.test(b.slug)),'every book has a country, region and slug');
ok(B.shelf().reduce((a,g)=>a+g.books.length,0)===36,'the shelf groups hold every book once');
ok(B.BUILT_BOOKS.length===36&&B.SITE_BOOKS.every(b=>b.path===`/books/${b.id}`),'every book has its own page');
for(const id of B.BUILT_BOOKS){const b=B.bookBySlug(id),p=b.page;
 ok(p.summary.split(/\s+/).length>=30&&p.summary.length<=420,`${id}: summary 30+ words`);
 ok(p.faq.length>=3&&p.faq.length<=5,`${id}: 3-5 FAQ items`);
 ok(p.facts.length>=4,`${id}: key facts`);
 ok(/^\d{4}-\d{2}-\d{2}$/.test(p.published),`${id}: published date`);
 ok((p.exhibits??[]).every(e=>EX.exhibitById(e)),`${id}: exhibits exist`);}
const webpSize=f=>{const b=fs.readFileSync(f);return b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP'&&b.toString('ascii',12,16)==='VP8 '?[b.readUInt16LE(26)&0x3fff,b.readUInt16LE(28)&0x3fff]:null;};
let spreadBytes=0;for(const b of B.SITE_BOOKS)for(const c of b.chapters){const f=path.join(root,'public/books/spreads',b.id,c.id+'.webp');
 ok(fs.existsSync(f),`${b.id}/${c.id}: spread picture exists`);const [w,hh]=webpSize(f)??[];spreadBytes+=fs.statSync(f).size;
 ok(w===960&&hh===600&&fs.statSync(f).size<90000,`${b.id}/${c.id}: spread picture is a 960×600 webp under 90 KB`);}
ok(spreadBytes<12e6,`spread pictures total ${(spreadBytes/1e6).toFixed(1)} MB`);
for(const b of B.SITE_BOOKS)for(const [i,c] of b.chapters.entries()){const raw=LIB.BOOKS[b.id].pages[i];
 const joined=c.paragraphs.join(' '),cut=raw.prompt.replace(/\.$/,'')+'.';
 ok(raw.text.split(/\n\n+/).join(' ').replace(cut,'').replace(/\s+/g,' ').trim()===joined.replace(/\s+/g,' ').trim(),`${b.id}/${c.id}: page text is the book's text minus the action sentence`);}
// ---- 2. hub ----
const hub=decode(render(React.createElement(L('app/(site)/books/page.tsx').default)));
ok((hub.match(/<h1\b/g)||[]).length===1&&/Football pop-up books for kids<\/h1>/.test(hub),'hub: one h1');
for(const b of B.SITE_BOOKS)ok(hub.includes(`${b.title}: ${b.subtitle}`),`hub lists ${b.id}`);
const linked=[...hub.matchAll(/href="\/books\/([a-z]+)"/g)].map(m=>m[1]);
ok(linked.every(x=>B.BUILT_BOOKS.includes(x))&&B.SITE_BOOKS.every(b=>linked.includes(b.id)),'hub links every book, and only built pages');
ok(!/On the island now|coming soon/i.test(hub),'hub: no stand-in for a missing page');
ok(/<a[^>]*href="\/fish"[^>]*>[\s\S]*?Fishbook/.test(hub)&&/Island field guides/.test(hub),'hub: the Fishbook field guide links to /fish');
ok(/href="\/books"/.test(decode(render(React.createElement(L('app/(site)/fish/page.tsx').default)))),'fish hub links back to the books');
const hubLd=ldOf(hub),coll=hubLd.find(x=>x['@type']==='CollectionPage');ok(coll&&hubLd.some(x=>x['@type']==='BreadcrumbList'),'hub JSON-LD: CollectionPage + BreadcrumbList');
ok(coll.mainEntity.numberOfItems===36&&B.SITE_BOOKS.every(x=>coll.mainEntity.itemListElement.some(it=>it.url===`https://futbolisland.app/books/${x.id}`)),'hub JSON-LD: the CollectionPage lists every book page');
// ---- 3. every built page (Cafu, the sample, also checks card #26) ----
const P=L('app/(site)/books/[slug]/page.tsx');
const esc=x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const allowed=new Set(['image','@context','@type','@id','name','url','mainEntityOfPage','description','inLanguage','isAccessibleForFree','bookFormat','numberOfPages','genre','audience','datePublished','dateModified','about','author','publisher','citation','hasPart','isPartOf']);
const pageHtml=id=>decode(render(React.createElement(P.default,{params:{slug:id}})));
for(const id of B.BUILT_BOOKS){const bk=B.bookBySlug(id),h=pageHtml(id);
 ok((h.match(/<h1\b/g)||[]).length===1&&new RegExp('<h1[^>]*>'+esc(bk.fullTitle)+'<span[^>]*> — </span><span[^>]*>a pop-up story for kids</span></h1>').test(h),`${id}: h1 names the book and says pop-up story for kids`);
 const afterH1=h.slice(h.indexOf('</h1>'));ok(/^<\/h1><div[^>]*data-quick-answer[^>]*><p[^>]*data-answer=""[^>]*>/.test(afterH1)&&afterH1.includes(bk.page.summary),`${id}: answer-first summary right after the h1`);
 for(const f of bk.page.facts)ok(h.includes(f.value)&&(!f.href||h.includes(`href="${f.href}"`)),`${id}: key fact ${f.label}`);
 for(const c of bk.chapters){
  ok(h.includes(`id="chapter-${c.id}"`)&&h.includes(c.title)&&h.includes(c.year)&&h.includes(c.lesson),`${id}: chapter ${c.id} title, year, lesson`);
  for(const p of c.paragraphs)ok(h.includes(`<p>${p}</p>`),`${id}: chapter ${c.id} paragraph verbatim`);
  ok(new RegExp(`<img[^>]*src="/books/spreads/${id}/${c.id}\\.webp"[^>]*>`).test(h),`${id}: chapter ${c.id} picture`);}
 const imgs=[...h.matchAll(/<img[^>]*src="\/books\/spreads\/[^>]*>/g)].map(m=>m[0]);
 ok(imgs.length===bk.chapters.length&&imgs.every((t,i)=>/width="960"/.test(t)&&/height="600"/.test(t)&&/decoding="async"/.test(t)&&/alt="Paper pop-up spread of [^"]+"/.test(t)&&(i===0)!==/loading="lazy"/.test(t)),`${id}: pictures have size, alt, async decode, lazy after the first`);
 ok((h.match(/What it teaches/g)||[]).length>=bk.chapters.length,`${id}: a lesson card per chapter`);
 for(const src of bk.sources)ok(h.includes(`href="${src.url}"`)&&h.includes(src.label),`${id}: source ${src.label}`);
 ok(/data-checked="\d{4}-\d{2}-\d{2}"/.test(h),`${id}: last checked date`);
 const ld=ldOf(h),book=ld.find(x=>x['@type']==='Book'),faq=ld.find(x=>x['@type']==='FAQPage'),crumbs=ld.find(x=>x['@type']==='BreadcrumbList');
 ok(book&&book.name===bk.fullTitle&&book.url===`https://futbolisland.app/books/${id}`&&book.about['@type']==='Person'&&book.about.name===bk.player,`${id}: Book JSON-LD: name, url, about Person`);
 ok(book.hasPart.length===bk.chapters.length&&book.hasPart.every((c,i)=>c['@type']==='Chapter'&&c.position===i+1&&c.name===bk.chapters[i].title),`${id}: Book JSON-LD: a Chapter part per chapter`);
 ok(book.citation.length===bk.sources.length&&book.citation.every(c=>c['@type']==='CreativeWork'&&/^https:\/\//.test(c.url)),`${id}: Book JSON-LD: citations`);
 ok(book.numberOfPages===bk.chapters.length&&book.bookFormat==='https://schema.org/EBook'&&/^\d{4}-\d{2}-\d{2}$/.test(book.dateModified)&&book.datePublished,`${id}: Book JSON-LD: pages, format, dates`);
 ok(Object.keys(book).every(k=>allowed.has(k)),`${id}: Book JSON-LD: only Book / CreativeWork properties`);
 ok(faq&&faq.mainEntity.length===bk.page.faq.length&&faq.mainEntity.every((q,i)=>q.name===bk.page.faq[i].q&&q.acceptedAnswer.text===bk.page.faq[i].a&&h.includes(q.name)&&h.includes(q.acceptedAnswer.text)),`${id}: FAQPage JSON-LD = the questions shown`);
 ok(crumbs&&crumbs.itemListElement.length===3,`${id}: BreadcrumbList: home, books, this book`);
 ok(/<a href="#story"[^>]*data-open-book=""/.test(h)&&/id="story"/.test(h),`${id}: open button is a real link to the story`);
 ok(B.bookLinks(bk).every(l=>h.includes(`href="${l.path}"`))&&/href="\/books"/.test(h),`${id}: keep reading: card, position guide, museum, hub`);
 ok(!/three\.js|three\.module|WebGL|PlayerPopUpBook/.test(h),`${id}: no three.js in the page HTML`);}
{const h=pageHtml('cafu');ok(/href="\/cards\/26"/.test(h)&&/href="\/learn\/soccer-positions\/fullback"/.test(h),'cafu keep reading: card #26 and the fullback guide');}
// ---- 4. lazy reader ----
const open=read('components/site/books/OpenBook.tsx'),parts=read('components/site/books/BookParts.tsx');
ok(!/\b(ChapterArt|BookReader)\b/.test(parts+open)&&!['ChapterArt.tsx','BookReader.tsx','reader.module.css'].some(f=>fs.existsSync(path.join(root,'components/site/books',f))),'the 2D reader and drawn pictures are gone; BookParts shows the spread pictures');
const page=read('app/(site)/books/[slug]/page.tsx');
ok(/retryImport\(\(\)=>import\('\.\/GameBookReader'\)\)/.test(open)&&!/^import[^\n]*(BookReader|PlayerPopUpBook)/m.test(open),'OpenBook imports the game reader only on tap');
const gameReader=read('components/site/books/GameBookReader.tsx');ok(/PlayerPopUpBook/.test(gameReader)&&/\bsite\b/.test(gameReader),'the website opens the game pop-up book in site mode');
for(const [n2,src] of [['OpenBook',open],['BookParts',parts],['page',page]])
 ok(!/from '(three|@\/lib\/books\/(library|registry|popup|bookAudio|useBookNarration)[^']*|@\/components\/Player[^']*)'/.test(src),`${n2}: no three.js, registry or game reader`);
for(const [n2,src] of [['OpenBook',open]])ok(!/^import (?!type)[^\n]*'@\/lib\/site\/books'/m.test(src),`${n2}: only type imports from lib/site/books (the registry stays on the server)`);
for(const f of ['books'])ok(/prefers-reduced-motion:no-preference/.test(read(`components/site/books/${f}.module.css`)),`${f}.module.css: motion only without reduced motion`);
ok(!/gradient\(/.test(read('components/site/books/books.module.css')),'no gradients');
ok(/\.shelf \.shelfLink,\.shelf \.shelfLink \*\{text-decoration:none\}/.test(read('components/site/books/books.module.css')),'shelf covers and names are not underlined at rest');
// ---- 5. wiring ----
const paths=L('lib/site/paths.ts').sitePaths().map(p=>p.path);
ok(paths.includes('/books')&&B.BUILT_BOOKS.every(id=>paths.includes('/books/'+id)),'sitemap has the hub and built pages');
ok(!paths.some(p=>/^\/books\/./.test(p)&&!B.BUILT_BOOKS.includes(p.slice(7))),'sitemap has no unbuilt book page');
const llms=L('lib/site/llms.ts').llmsText();
ok(/\]\(https:\/\/futbolisland\.app\/books\):/.test(llms)&&B.BUILT_BOOKS.every(id=>llms.includes(`(https://futbolisland.app/books/${id}): `+B.bookBySlug(id).page.summary)),'llms.txt: hub and a line per built book with its answer');
const PK=L('lib/analytics/pageKeys.ts');ok(PK.pageKeyOf('/books/cafu')==='books'&&PK.pageKeyOf('/books')==='books','pageKeys: books');
ok(/\['\/books','Story books'\]/.test(read('lib/site/footerHubs.ts'))&&/FOOTER_HUBS\.map/.test(read('app/(site)/layout.tsx')),'footer links the books (the list is lib/site/footerHubs.ts since Nov 20 2026)');
console.log(`books-site: ${n} source/HTML checks OK`);
// ---- 6. built site ----
const dist=path.join(root,process.env.NEXT_DIST_DIR||'.next'),app=path.join(dist,'server/app');
/* Nov 20 2026 (SEO foundation): the Book JSON-LD carries a real picture of the book (its first chapter's spread) */
for(const b of B.SITE_BOOKS.filter(x=>x.page)){const ld=B.bookLd(b,{modified:'2026-11-20'});assert(ld.image===`https://futbolisland.app/books/spreads/${b.id}/${b.chapters[0].id}.webp`&&fs.existsSync(path.join(root,'public',B.bookImage(b))),`${b.id}: Book image exists`);}
if(!fs.existsSync(path.join(app,'books/cafu.html'))){console.log(`  SKIP built-site checks: no build in ${path.relative(root,dist)}`);process.exit(0);}
const built=fs.readFileSync(path.join(app,'books/cafu.html'),'utf8');
ok(fs.existsSync(path.join(app,'books.html')),'built: /books prerendered');
const scripts=[...built.matchAll(/<script[^>]+src="\/_next\/([^"]+)"/g)].map(m=>path.join(dist,m[1].replace(/^static\//,'static/')));
let three=0;for(const f of scripts)if(fs.existsSync(f)&&/WebGLRenderer|THREE\.WebGL|three\.module/.test(fs.readFileSync(f,'utf8')))three++;
ok(scripts.length>0&&three===0,`built: no three.js in the ${scripts.length} initial scripts of /books/cafu`);
console.log('books-site: built pages OK');
