// The pop-up books on the website (Nov 17 2026; lib/site/books.ts, app/(site)/books, components/site/books):
//  1. Data: every player book in the catalog is on the shelf (36), grouped by region, each with a slug; built pages have a
//     summary, facts, 3-5 FAQ items and one picture per chapter; the page text is the book's text minus only the action sentence.
//  2. Hub HTML: one h1, every book's title and subtitle, only built books linked, CollectionPage + BreadcrumbList JSON-LD.
//  3. Sample page HTML (/books/cafu): h1, the answer-first summary right after it, every chapter's title, year, text (verbatim
//     paragraphs) and lesson, every source link, the check date, FAQ shown = FAQPage JSON-LD, Book JSON-LD with chapters and
//     citations, BreadcrumbList, the open button as a real link to the story, keep-reading links to the card and position guide.
//  4. Lazy reader: the server page and OpenBook import no three.js / game code / registry; the reader is a dynamic import and
//     only `import type` from lib/site/books; reduced motion is honoured in both stylesheets.
//  5. Wiring: sitemap paths, llms.txt lines, pageKeys `books`, the footer link.
//  6. Built site (when a build exists in NEXT_DIST_DIR): /books and /books/cafu are prerendered, and the page's initial JS has no three.js.
// usage: node tests/books-site.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {root,L,read,render,React,ldOf}=require('./lib/tsLoad.cjs');process.chdir(root);
let n=0;const ok=(c,m)=>{assert(c,m);n++;};
const decode=h=>h.replace(/&#x27;|&#39;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const B=L('lib/site/books.ts'),CAT=L('lib/books/catalog.ts'),LIB=L('lib/books/library.ts');
// ---- 1. data ----
const ids=Object.keys(CAT.PLAYER_BOOKS).filter(i=>i!=='island');
ok(B.SITE_BOOKS.length===ids.length&&ids.length===36,`all 36 player books on the shelf (${B.SITE_BOOKS.length})`);
ok(B.SITE_BOOKS.every(b=>b.region&&b.country&&/^[a-z]+$/.test(b.slug)),'every book has a country, region and slug');
ok(B.shelf().reduce((a,g)=>a+g.books.length,0)===36,'the shelf groups hold every book once');
ok(B.BUILT_BOOKS.includes('cafu'),'cafu is built');
for(const id of B.BUILT_BOOKS){const b=B.bookBySlug(id),p=b.page;
 ok(p.summary.split(/\s+/).length>=30&&p.summary.length<=420,`${id}: summary 30+ words`);
 ok(p.faq.length>=3&&p.faq.length<=5,`${id}: 3-5 FAQ items`);
 ok(p.motifs.length===b.chapters.length,`${id}: one picture per chapter`);
 ok(p.facts.length>=4,`${id}: key facts`);}
for(const b of B.SITE_BOOKS)for(const [i,c] of b.chapters.entries()){const raw=LIB.BOOKS[b.id].pages[i];
 const joined=c.paragraphs.join(' '),cut=raw.prompt.replace(/\.$/,'')+'.';
 ok(raw.text.split(/\n\n+/).join(' ').replace(cut,'').replace(/\s+/g,' ').trim()===joined.replace(/\s+/g,' ').trim(),`${b.id}/${c.id}: page text is the book's text minus the action sentence`);}
// ---- 2. hub ----
const hub=decode(render(React.createElement(L('app/(site)/books/page.tsx').default)));
ok((hub.match(/<h1\b/g)||[]).length===1&&/Football pop-up books for kids<\/h1>/.test(hub),'hub: one h1');
for(const b of B.SITE_BOOKS)ok(hub.includes(`${b.title}: ${b.subtitle}`),`hub lists ${b.id}`);
const linked=[...hub.matchAll(/href="\/books\/([a-z]+)"/g)].map(m=>m[1]);
ok(linked.length>0&&linked.every(x=>B.BUILT_BOOKS.includes(x)),'hub links only built books');
const hubLd=ldOf(hub);ok(hubLd.some(x=>x['@type']==='CollectionPage')&&hubLd.some(x=>x['@type']==='BreadcrumbList'),'hub JSON-LD: CollectionPage + BreadcrumbList');
// ---- 3. sample page ----
const cafu=B.bookBySlug('cafu');
const P=L('app/(site)/books/[slug]/page.tsx'),h=decode(render(React.createElement(P.default,{params:{slug:'cafu'}})));
ok((h.match(/<h1\b/g)||[]).length===1&&/<h1[^>]*>Cafu: Told no, again and again<span[^>]*> — <\/span><span[^>]*>a pop-up story for kids<\/span><\/h1>/.test(h),'page: h1 names the book and says pop-up story for kids');
const afterH1=h.slice(h.indexOf('</h1>'));ok(/^<\/h1><div[^>]*data-quick-answer[^>]*><p[^>]*data-answer=""[^>]*>/.test(afterH1)&&afterH1.includes(cafu.page.summary),'page: answer-first summary right after the h1');
for(const f of cafu.page.facts)ok(h.includes(f.value),`page: key fact ${f.label}`);
for(const c of cafu.chapters){
 ok(h.includes(`id="chapter-${c.id}"`)&&h.includes(c.title)&&h.includes(c.year)&&h.includes(c.lesson),`page: chapter ${c.id} title, year, lesson`);
 for(const p of c.paragraphs)ok(h.includes(`<p>${p}</p>`),`page: chapter ${c.id} paragraph verbatim`);
 ok(h.includes(`data-motif="${c.motif}"`),`page: chapter ${c.id} picture`);}
ok((h.match(/What it teaches/g)||[]).length>=cafu.chapters.length,'page: a lesson card per chapter');
for(const s of cafu.sources)ok(h.includes(`href="${s.url}"`)&&h.includes(s.label),`page: source ${s.label}`);
ok(/data-checked="\d{4}-\d{2}-\d{2}"/.test(h),'page: last checked date');
const ld=ldOf(h),book=ld.find(x=>x['@type']==='Book'),faq=ld.find(x=>x['@type']==='FAQPage'),crumbs=ld.find(x=>x['@type']==='BreadcrumbList');
ok(book&&book.name===cafu.fullTitle&&book.url==='https://futbolisland.app/books/cafu'&&book.about['@type']==='Person'&&book.about.name==='Cafu','Book JSON-LD: name, url, about Person');
ok(book.hasPart.length===6&&book.hasPart.every((c,i)=>c['@type']==='Chapter'&&c.position===i+1&&c.name===cafu.chapters[i].title),'Book JSON-LD: six Chapter parts');
ok(book.citation.length===cafu.sources.length&&book.citation.every(c=>c['@type']==='CreativeWork'&&/^https:\/\//.test(c.url)),'Book JSON-LD: citations');
ok(book.numberOfPages===6&&book.bookFormat==='https://schema.org/EBook'&&/^\d{4}-\d{2}-\d{2}$/.test(book.dateModified)&&book.datePublished,'Book JSON-LD: pages, format, dates');
const allowed=new Set(['@context','@type','@id','name','url','mainEntityOfPage','description','inLanguage','isAccessibleForFree','bookFormat','numberOfPages','genre','audience','datePublished','dateModified','about','author','publisher','citation','hasPart','isPartOf']);
ok(Object.keys(book).every(k=>allowed.has(k)),'Book JSON-LD: only Book / CreativeWork properties');
ok(faq&&faq.mainEntity.length===cafu.page.faq.length&&faq.mainEntity.every((q,i)=>q.name===cafu.page.faq[i].q&&q.acceptedAnswer.text===cafu.page.faq[i].a&&h.includes(q.name)&&h.includes(q.acceptedAnswer.text)),'FAQPage JSON-LD = the questions shown');
ok(crumbs&&crumbs.itemListElement.length===3,'BreadcrumbList: home, books, this book');
ok(/<a href="#story"[^>]*data-open-book=""/.test(h)&&/id="story"/.test(h),'open button is a real link to the story');
ok(/href="\/cards\/26"/.test(h)&&/href="\/learn\/soccer-positions\/fullback"/.test(h)&&/href="\/books"/.test(h),'keep reading: card, position guide, hub');
ok(!/three\.js|three\.module|WebGL|PlayerPopUpBook/.test(h),'no three.js in the page HTML');
// ---- 4. lazy reader ----
const open=read('components/site/books/OpenBook.tsx'),reader=read('components/site/books/BookReader.tsx'),art=read('components/site/books/ChapterArt.tsx'),parts=read('components/site/books/BookParts.tsx');
const page=read('app/(site)/books/[slug]/page.tsx');
ok(/import\('\.\/GameBookReader'\)/.test(open)&&!/^import[^\n]*(BookReader|PlayerPopUpBook)/m.test(open),'OpenBook imports the game reader only on tap');
const gameReader=read('components/site/books/GameBookReader.tsx');ok(/PlayerPopUpBook/.test(gameReader)&&/\bsite\b/.test(gameReader),'the website opens the game pop-up book in site mode');
for(const [n2,src] of [['OpenBook',open],['BookReader',reader],['ChapterArt',art],['BookParts',parts],['page',page]])
 ok(!/from '(three|@\/lib\/books\/(library|registry|popup|bookAudio|useBookNarration)[^']*|@\/components\/Player[^']*)'/.test(src),`${n2}: no three.js, registry or game reader`);
for(const [n2,src] of [['OpenBook',open],['BookReader',reader],['ChapterArt',art]])ok(!/^import (?!type)[^\n]*'@\/lib\/site\/books'/m.test(src),`${n2}: only type imports from lib/site/books (the registry stays on the server)`);
ok(/preload='none'/.test(reader)&&/visibilitychange/.test(reader),'narration loads on Listen and stops when hidden');
for(const f of ['books','reader'])ok(/prefers-reduced-motion:no-preference/.test(read(`components/site/books/${f}.module.css`)),`${f}.module.css: motion only without reduced motion`);
ok(!/gradient\(/.test(read('components/site/books/books.module.css')+read('components/site/books/reader.module.css')),'no gradients');
// ---- 5. wiring ----
const paths=L('lib/site/paths.ts').sitePaths().map(p=>p.path);
ok(paths.includes('/books')&&B.BUILT_BOOKS.every(id=>paths.includes('/books/'+id)),'sitemap has the hub and built pages');
ok(!paths.some(p=>/^\/books\/./.test(p)&&!B.BUILT_BOOKS.includes(p.slice(7))),'sitemap has no unbuilt book page');
const llms=L('lib/site/llms.ts').llmsText();
ok(/\]\(https:\/\/futbolisland\.app\/books\):/.test(llms)&&llms.includes('(https://futbolisland.app/books/cafu): '+cafu.page.summary),'llms.txt: hub and Cafu lines with the answer');
const PK=L('lib/analytics/pageKeys.ts');ok(PK.pageKeyOf('/books/cafu')==='books'&&PK.pageKeyOf('/books')==='books','pageKeys: books');
ok(/\['\/books','Story books'\]/.test(read('app/(site)/layout.tsx')),'footer links the books');
console.log(`books-site: ${n} source/HTML checks OK`);
// ---- 6. built site ----
const dist=path.join(root,process.env.NEXT_DIST_DIR||'.next'),app=path.join(dist,'server/app');
if(!fs.existsSync(path.join(app,'books/cafu.html'))){console.log(`  SKIP built-site checks: no build in ${path.relative(root,dist)}`);process.exit(0);}
const built=fs.readFileSync(path.join(app,'books/cafu.html'),'utf8');
ok(fs.existsSync(path.join(app,'books.html')),'built: /books prerendered');
const scripts=[...built.matchAll(/<script[^>]+src="\/_next\/([^"]+)"/g)].map(m=>path.join(dist,m[1].replace(/^static\//,'static/')));
let three=0;for(const f of scripts)if(fs.existsSync(f)&&/WebGLRenderer|THREE\.WebGL|three\.module/.test(fs.readFileSync(f,'utf8')))three++;
ok(scripts.length>0&&three===0,`built: no three.js in the ${scripts.length} initial scripts of /books/cafu`);
console.log('books-site: built pages OK');
