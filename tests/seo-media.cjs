// Video watch pages and museum case pages, SEO phase 2 (Nov 20 2026):
//  1. Every museum case has a search title (60 characters at most, used whole, unique), an h1 that differs from every other,
//     a 120-155 character description and at least two links to rule, term, position, formation, chart or tool pages
//     (lib/site/crossLinks.ts exhibitCrossLinks); every link is a real page in the sitemap and is on the rendered page.
//  2. Every watch page has an "About" section taken from the game's or the guide clip's own record, and at least three links
//     to other pages (lib/site/videoPages.ts), each a real page; a game clip links its game page, /games and /play.
//  3. No page here links /marketing, and the copy has no em dash.
// usage: node tests/seo-media.cjs
const assert=require('node:assert/strict');
const {root,L,render,React}=require('./lib/tsLoad.cjs');process.chdir(root);
const ex=L('lib/site/exhibits.ts'),xl=L('lib/site/crossLinks.ts'),vs=L('lib/site/videos.ts'),vp=L('lib/site/videoPages.ts'),games=L('lib/site/games.ts');
const PATHS=new Set(L('lib/site/paths.ts').sitePaths().map(p=>p.path));
const real=p=>PATHS.has(p.split('#')[0])||p==='/play';
const esc=s=>s.replace(/&/g,'&amp;').replace(/'/g,'&#x27;').replace(/"/g,'&quot;');
const warn=console.error;console.error=(...a)=>{if(!/fetchPriority/.test(a.join(" ")))warn(...a);};
// ---- 1. museum cases -----------------------------------------------------------------------------------------------------------
const E=ex.SITE_EXHIBITS,page=L('app/(site)/exhibits/[id]/page.tsx');
assert(E.length>=20,'the museum has its cases');
assert.equal(new Set(E.map(e=>e.seoTitle)).size,E.length,'unique case titles');assert.equal(new Set(E.map(e=>e.h1)).size,E.length,'unique case h1s');
let exLinks=0;
for(const e of E){
 const at=ex.exhibitPath(e.id),m=page.generateMetadata({params:{id:e.id}});
 assert.equal(m.title,e.seoTitle,`${at}: the title is the search title, whole`);assert(m.title.length>=40&&m.title.length<=60,`${at}: title 40-60 (${m.title.length})`);
 assert(/football|soccer|futsal|goalkeeper|world cup|ballon|copa|var\b/i.test(m.title),`${at}: the title names the sport or the subject`);
 assert(m.description.length>=120&&m.description.length<=155,`${at}: description 120-155 (${m.description.length})`);assert(/[.!?]$/.test(m.description),`${at}: the description ends on a whole sentence`);
 for(const l of e.story)assert(!/undefined/.test(l.text),`${at}: no empty field in the story`);
 assert.equal(m.alternates.canonical,at,`${at}: self canonical`);
 const html=render(React.createElement(page.default,{params:{id:e.id}}));
 assert.equal((html.match(/<h1[ >]/g)||[]).length,1,`${at}: one h1`);assert(html.includes(`>${esc(e.h1)}</h1>`),`${at}: the h1`);
 const links=xl.exhibitCrossLinks(e.id);exLinks+=links.length;
 assert(links.length>=2&&links.length<=4,`${at}: 2-4 topic links (${links.length})`);
 for(const l of links){assert(real(l.path),`${at}: ${l.path} is a real page`);assert(!l.path.startsWith('/exhibits'),`${at}: topic links leave the museum`);
  assert(html.includes(`href="${l.path}"`),`${at}: links ${l.path}`);assert(l.name&&l.line,`${at}: ${l.path} has a name and a line`);}
 assert(!/\/marketing/.test(html),`${at}: no /marketing link`);assert(!/—/.test(e.seoTitle+e.h1),`${at}: no em dash`);
}
{const hub=L('app/(site)/exhibits/page.tsx'),h=render(React.createElement(hub.default,{}));
 assert(hub.metadata.title.length<=60&&/football/i.test(hub.metadata.title),'/exhibits: the title names the sport');
 assert(hub.metadata.description.length>=120&&hub.metadata.description.length<=155,'/exhibits: description 120-155');
 for(const e of E)assert(h.includes(`href="${ex.exhibitPath(e.id)}"`),`/exhibits links ${e.id}`);assert.equal((h.match(/<h1[ >]/g)||[]).length,1,'/exhibits: one h1');}
// ---- 2. watch pages ------------------------------------------------------------------------------------------------------------
const W=vs.allWatchVideos(),watch=L('app/(site)/videos/[slug]/page.tsx');let vLinks=0;const said=new Map();
for(const v of W){
 const at=v.path,about=vp.watchAbout(v),links=vp.watchLinks(v),html=render(React.createElement(watch.default,{params:{slug:v.slug}}));vLinks+=links.length;
 assert(about.title&&about.lines.length>=1,`${at}: an about section`);
 for(const l of about.lines){assert(!said.has(l.text),`${at}: an about sentence is also on ${said.get(l.text)}`);said.set(l.text,at);assert(!/undefined/.test(l.text),`${at}: no empty field`);}
 for(const l of about.lines){assert(l.text.length>20,`${at}: about text`);assert(html.includes(esc(l.text)),`${at}: the about text is on the page`);assert(!/—/.test(l.text),`${at}: no em dash`);}
 assert(links.length>=3&&links.length<=6,`${at}: 3-6 links (${links.length})`);assert.equal(new Set(links.map(l=>l.path)).size,links.length,`${at}: no link twice`);
 for(const l of links){assert(real(l.path),`${at}: ${l.path} is a real page`);assert(l.path!==at,`${at}: no self link`);assert(html.includes(`href="${l.path}"`),`${at}: links ${l.path}`);}
 assert(links.some(l=>l.path==='/play'),`${at}: links /play`);assert(links.some(l=>l.path==='/games'),`${at}: links /games`);
 const g=games.GAME_PAGES.find(x=>x.id===v.key);
 if(g){assert(links.some(l=>l.path===g.path),`${at}: links its game page`);assert(about.lines[0].text===g.lead,`${at}: the about text is the game's own lead`);
  assert(links.some(l=>l.path.startsWith('/learn/')),`${at}: links a learn page`);}
 assert(!/\/marketing/.test(html),`${at}: no /marketing link`);
 assert(html.indexOf('<video')<html.indexOf('id="about"'),`${at}: the player stays first`);
}
console.log(`seo-media: ok (${E.length} museum cases, ${exLinks} topic links; ${W.length} watch pages, ${vLinks} links)`);
