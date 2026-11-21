// Site videos (seo-extras Nov 15 2026; watch pages Nov 18 2026: Search Console "Video isn't on a watch page"):
//  1. Every guide clip and game clip is a real, small file whose size matches its metadata, and its uploadDate is real
//     (the day git first saw the file, or later).
//  2. Every clip has ONE watch page, /videos/<slug> (lib/site/videos.ts): the native player first (controls, playsInline,
//     preload="metadata", poster, real width and height, no autoplay), one h1 = the title, the words, a play button, more videos;
//     exactly one VideoObject (+ BreadcrumbList), a unique title with the site suffix, a 120-155 character description, a
//     self canonical and Open Graph video tags.
//  3. The video sitemap has one <url> per watch page, one <video:video> each, and every entry matches its page's VideoObject.
//  4. The pages the clips also play on (guides, /games, /games/<slug>, the Spanish hubs) emit NO VideoObject and link the watch page.
//  5. ClipPlay and LoopClip still create no <video> before the reader asks (phone heat).
// usage: node tests/seo-video.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const {root,L,read,render,React,ldOf}=require('./lib/tsLoad.cjs');process.chdir(root);
const gv=L('lib/site/guideVideos.ts'),gm=L('lib/site/gameMedia.ts'),vs=L('lib/site/videos.ts'),seo=L('lib/site/seo.ts'),games=L('lib/site/games.ts');
const MEDIA=JSON.parse(fs.readFileSync(path.join(root,'lib/site/gameMedia.json'),'utf8'));
let shallow=false;try{shallow=execFileSync('git',['rev-parse','--is-shallow-repository'],{cwd:root,encoding:'utf8'}).trim()==='true';}catch{}
// CI checks out a shallow clone (no full history): the add-commit is not there, so only compare on a full clone.
const firstCommit=f=>{if(shallow)return '';try{return execFileSync('git',['log','--diff-filter=A','--format=%aI','--',f],{cwd:root,encoding:'utf8'}).trim().split('\n').pop();}catch{return '';}};
const deep=(x,f)=>{if(Array.isArray(x))return x.some(y=>deep(y,f));if(x&&typeof x==='object')return f(x)||Object.values(x).some(y=>deep(y,f));return false;};
const hasVideoLd=ld=>ld.some(x=>deep(x,o=>o['@type']==='VideoObject'));
// ---- 1. files -----------------------------------------------------------------------------------------------------------------
const vids=gv.allGuideVideos();
assert.equal(vids.length,gv.GUIDE_VIDEOS.length,'every listed guide clip resolves to real files');
assert(vids.length>=3,'at least three guide pages have a clip');
for(const v of vids){
 for(const f of [v.poster,v.mp4,v.webm].filter(Boolean)){const st=fs.statSync(path.join(root,'public',f));assert(st.size<400_000,`${f} is small (${st.size})`);}
 const first=firstCommit(`public${v.mp4}`);if(first)assert.equal(v.uploadDate,first,`${v.key}: uploadDate is the first commit of the clip`);
 assert(v.seconds>0&&v.seconds<=60,`${v.key}: a short clip`);
}
const gameClips=[gm.HERO_CLIP,...games.GAME_PAGES.map(g=>gm.gameClip(g.id)),...gm.islandClips()].filter(Boolean);
for(const c of gameClips){
 const meta=MEDIA.clips[c.key];
 for(const [f,bytes] of [[c.mp4,meta.mp4],[c.webm,meta.webm],[c.poster,meta.poster.bytes]]){const st=fs.statSync(path.join(root,'public',f));assert(st.size<1_600_000,`${f} is small (${st.size})`);assert.equal(st.size,bytes,`${f}: gameMedia.json has the real size`);}
 assert(c.seconds>=4&&c.seconds<=12,`${c.key}: a 4-12 s loop`);assert(Math.max(c.w,c.h)<=720,`${c.key}: 720 px on the long side at most`);
 const first=firstCommit(`public${c.mp4}`);if(first)assert(new Date(c.uploaded)>=new Date(first),`${c.key}: uploaded (${c.uploaded}) is not before the file's first commit (${first})`);
}
for(const [k,ss] of Object.entries(MEDIA.shots))for(const s of ss)assert.equal(fs.statSync(path.join(root,'public/games/shots',s.file)).size,s.bytes,`${s.file}: gameMedia.json has the real size`);
// ---- 2. watch pages -----------------------------------------------------------------------------------------------------------
const W=vs.allWatchVideos(),page=L('app/(site)/videos/[slug]/page.tsx'),PATHS=new Set(L('lib/site/paths.ts').sitePaths().map(p=>p.path));
assert.equal(W.length,vids.length+gameClips.length,'one watch page per clip (guide clips + game clips)');
assert.equal(new Set(W.map(v=>v.slug)).size,W.length,'unique slugs');assert.equal(new Set(W.map(v=>v.key)).size,W.length,'one watch page per media key');
assert.equal(new Set(W.map(v=>v.title)).size,W.length,'unique titles');assert.equal(new Set(W.map(vs.watchDescription)).size,W.length,'unique descriptions');
assert.deepEqual(page.generateStaticParams().map(p=>p.slug),W.map(v=>v.slug),'every watch page is generated');
assert(PATHS.has(vs.VIDEOS_PATH),'/videos is in the sitemap');
const LD=new Map();
for(const v of W){
 const at=v.path;assert.match(at,/^\/videos\/[a-z0-9]+(?:-[a-z0-9]+)*$/,`${at}: a clean URL`);assert(PATHS.has(at),`${at}: in the sitemap`);
 assert(v.text.length>=2&&v.text.length<=4,`${at}: 2-4 sentences`);assert(!/\b(?:piece of cake|in a nutshell|ballpark|hit the ground|game changer)\b/i.test(v.text.join(' ')),`${at}: no idioms`);
 const meta=page.generateMetadata({params:{slug:v.slug}});
 assert.equal(meta.title,`${v.title} · Futbol Island`,`${at}: title with the site suffix`);assert(meta.title.length<=60,`${at}: title fits (${meta.title.length})`);
 assert(meta.description.length>=120&&meta.description.length<=155&&!meta.description.endsWith('…'),`${at}: description 120-155 (${meta.description.length})`);/* Nov 20 2026: was 70-155 */
 assert.equal(meta.alternates.canonical,at,`${at}: self canonical`);
 assert.equal(meta.openGraph.type,'video.other');assert.equal(meta.openGraph.images[0].url,v.poster,`${at}: og:image is the poster`);
 const ogv=meta.openGraph.videos[0];assert(ogv.url===v.contentUrl&&ogv.type==='video/mp4'&&ogv.width===v.w&&ogv.height===v.h,`${at}: og:video tags`);
 const html=render(React.createElement(page.default,{params:{slug:v.slug}})),ld=ldOf(html);
 const vo=ld.filter(x=>x['@type']==='VideoObject');assert.equal(vo.length,1,`${at}: exactly one VideoObject`);
 assert(ld.some(x=>x['@type']==='BreadcrumbList'),`${at}: BreadcrumbList`);assert.equal(new Set(ld.map(x=>x['@type'])).size,ld.length,`${at}: no duplicate @types`);
 const o=vo[0];LD.set(at,o);
 for(const k of ['name','description','thumbnailUrl','uploadDate','contentUrl','duration'])assert(o[k],`${at}: VideoObject.${k}`);
 assert.equal(o.name,v.title);assert(!('embedUrl' in o),`${at}: no embedUrl (there is no embeddable player)`);
 assert.match(o.duration,/^PT\d+S$/);assert.match(o.uploadDate,/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d[+-]\d\d:\d\d$/,`${at}: uploadDate with a timezone`);
 assert(/^https:\/\/[a-z0-9.-]+\/.+\.mp4(\?|$)/.test(o.contentUrl),`${at}: absolute mp4 contentUrl (the site, or the /learn clips' media host)`);
 assert(o.thumbnailUrl.every(u=>/^https:\/\/futbolisland\.app\/.+\.webp$/.test(u)),`${at}: absolute thumbnail`);
 assert(fs.existsSync(path.join(root,'public',new URL(o.contentUrl).pathname)),`${at}: the file exists`);
 assert(fs.existsSync(path.join(root,'public',o.thumbnailUrl[0].replace(seo.SITE_URL,''))),`${at}: the poster exists`);
 const tags=html.match(/<video\b[^>]*>/g)||[];assert.equal(tags.length,1,`${at}: one player`);const t=tags[0];
 assert(/\bcontrols\b/.test(t)&&/playsInline|playsinline/i.test(t)&&/preload="metadata"/.test(t)&&/poster="[^"]+"/.test(t)&&new RegExp(`width="${v.w}"`).test(t)&&new RegExp(`height="${v.h}"`).test(t),`${at}: native player with controls, poster and size`);
 assert(!/autoplay/i.test(t),`${at}: no autoplay`);
 assert.equal((html.match(/<h1[ >]/g)||[]).length,1,`${at}: one h1`);assert(html.indexOf('<video')<html.indexOf('<h1'),`${at}: the player comes first`);
 const h1=html.match(/<h1[^>]*>([^<]*)<\/h1>/)[1].replace(/&#x27;/g,"'").replace(/&amp;/g,'&');assert.equal(h1,v.title,`${at}: the h1 is the title`);
 for(const s of v.text)assert(html.includes(s.replace(/&/g,'&amp;').replace(/'/g,'&#x27;')),`${at}: the description is on the page`);
 assert(html.includes(`href="${v.play.href.replace(/&/g,'&amp;')}"`),`${at}: the play button`);assert(html.includes('href="/videos"'),`${at}: links back to /videos`);
 assert(/More videos/.test(html)&&(html.match(/href="\/videos\/[a-z0-9-]+"/g)||[]).length>=2,`${at}: more videos`);
}
// the hub links every watch page and plays nothing
{const hub=render(React.createElement(L('app/(site)/videos/page.tsx').default,{}));
 for(const v of W)assert(hub.includes(`href="${v.path}"`),`/videos links ${v.path}`);assert(!/<video/.test(hub),'/videos has no player');assert(!hasVideoLd(ldOf(hub)),'/videos: no VideoObject');
 assert.equal((hub.match(/<h1[ >]/g)||[]).length,1,'/videos: one h1');
 const m=L('app/(site)/videos/page.tsx').metadata;assert(m.title.endsWith(' · Futbol Island')&&m.title.length<=60&&m.alternates.canonical==='/videos','/videos: title and canonical');}
assert(read('lib/site/footerHubs.ts').includes("['/videos','Videos']")&&/FOOTER_HUBS\.map/.test(read('app/(site)/layout.tsx')),'the footer links /videos (the list is lib/site/footerHubs.ts since Nov 20 2026)');
// ---- 3. sitemap ----------------------------------------------------------------------------------------------------------------
const xml=vs.videoSitemapXml();
assert(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')&&xml.includes('xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"'),'video sitemap header');
const urls=[...xml.matchAll(/<url><loc>([^<]+)<\/loc>([\s\S]*?)<\/url>/g)];
assert.equal(urls.length,W.length,'one <url> per watch page');assert.equal((xml.match(/<video:video>/g)||[]).length,W.length,'one <video:video> per watch page');
const un=s=>s.replace(/&apos;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
const tag=(b,t)=>{const m=b.match(new RegExp(`<${t}>([^<]+)</${t}>`));return m&&un(m[1]);};
for(const [,loc,body] of urls){
 const p=un(loc).replace(seo.SITE_URL,'');const o=LD.get(p);assert(o,`${p}: the sitemap <loc> is a watch page`);
 assert.equal((body.match(/<video:video>/g)||[]).length,1,`${p}: one video`);
 assert.equal(tag(body,'video:title'),o.name,`${p}: sitemap title = VideoObject name`);assert.equal(tag(body,'video:description'),o.description,`${p}: description`);
 assert.equal(tag(body,'video:thumbnail_loc'),o.thumbnailUrl[0],`${p}: thumbnail`);assert.equal(tag(body,'video:content_loc'),o.contentUrl,`${p}: content`);
 assert.equal(`PT${tag(body,'video:duration')}S`,o.duration,`${p}: duration`);assert.equal(tag(body,'video:publication_date'),o.uploadDate,`${p}: date`);
 for(const t of ['video:family_friendly','video:requires_subscription'])assert(tag(body,t),`${p}: <${t}>`);
}
assert(!/&(?!amp;|lt;|gt;|quot;|apos;)/.test(xml),'XML entities escaped');
assert(/export const dynamic='force-static'/.test(read('app/sitemap-video.xml/route.ts')),'the video sitemap is static');
assert(read('app/robots.ts').includes('/sitemap-video.xml'),'robots.txt names the video sitemap');
{const r=L('app/robots.ts').default();for(const rule of r.rules)assert(!(rule.disallow||[]).some(d=>['/videos','/games','/learn'].some(p=>p.startsWith(d))),'robots.txt does not block the watch pages or the media');}
// ---- 4. the clips' other pages: no VideoObject, a link to the watch page ----------------------------------------------------
const watchOf=new Map(W.map(v=>[v.key,v.path]));
const pageFile={'/learn/passing-and-support':'app/(site)/learn/passing-and-support/page.tsx','/learn/soccer-quiz-for-kids':'app/(site)/learn/soccer-quiz-for-kids/page.tsx','/learn/lessons':'app/(site)/learn/lessons/page.tsx'};
for(const v of vids){
 const f=pageFile[v.path];assert(f,`${v.path}: a known page`);
 const html=render(React.createElement(L(f).default,{})),ld=ldOf(html);
 assert(!hasVideoLd(ld),`${v.path}: no VideoObject (its home is ${watchOf.get(v.key)})`);
 assert(html.includes(`href="${watchOf.get(v.key)}" data-watch-link=""`),`${v.path}: "Watch the full clip" links the watch page`);
 assert(!/<video/.test(html),`${v.path}: no <video> before the tap`);
 assert(/<button type="button"[^>]*aria-label="Play video: /.test(html),`${v.path}: a labelled play button`);
 assert(/loading="lazy"/.test(html),`${v.path}: lazy poster`);
 assert(html.includes(v.description.replace(/'/g,'&#x27;')),`${v.path}: the caption`);
 assert.equal(new Set(ld.map(x=>JSON.stringify(x['@type']))).size,ld.length,`${v.path}: no duplicate JSON-LD @types`);
}
{const hub=render(React.createElement(L('app/(site)/games/page.tsx').default,{}));assert(!hasVideoLd(ldOf(hub)),'/games: no VideoObject');
 for(const c of [gm.HERO_CLIP,...gm.islandClips()].filter(Boolean))assert(hub.includes(`href="${watchOf.get(c.key)}" data-watch-link=""`),`/games links the watch page of ${c.key}`);
 assert(hub.includes('href="/videos"'),'/games links /videos');
 const gp=L('app/(site)/games/[slug]/page.tsx');
 for(const g of games.GAME_PAGES){const h=render(React.createElement(gp.default,{params:{slug:g.slug}}));assert(!hasVideoLd(ldOf(h)),`${g.path}: no VideoObject (no trailer)`);
  if(gm.gameClip(g.id))assert(h.includes(`href="${watchOf.get(g.id)}" data-watch-link=""`),`${g.path}: links its watch page`);}}
assert(!/videoLd|VideoObject/.test(read('components/es/pages/HubsEs.tsx').replace(/\/\*[\s\S]*?\*\//g,'')),'Spanish hubs: no VideoObject (no Spanish watch pages yet)');
for(const f of ['lib/site/gameMedia.ts','lib/site/guideVideos.ts','components/site/GuideVideo.tsx','app/(site)/games/page.tsx','app/(site)/games/[slug]/page.tsx'])
 assert(!/'@type':'VideoObject'|gameClipLd|videoLd\(/.test(read(f)),`${f}: emits no VideoObject`);
// ---- 5. players on the other pages -------------------------------------------------------------------------------------------
const lc=read('components/site/games/LoopClip.tsx');
assert(/<video[^>]*\bmuted\b[^>]*\bplaysInline\b/.test(lc)&&/preload="none"/.test(lc)&&/\{on&&<video/.test(lc),'LoopClip: muted inline video, created only when it may play');
assert(/prefers-reduced-motion: reduce/.test(lc)&&/IntersectionObserver/.test(lc)&&/visibilitychange/.test(lc)&&/PLAYING/.test(lc),'LoopClip: reduced motion keeps the poster, pauses off screen and when hidden, one at a time');
const cp=read('components/site/ClipPlay.tsx');
assert(/<video[^>]*\bmuted\b[^>]*\bplaysInline\b[^>]*\bcontrols\b|<video[^>]*\bcontrols\b[^>]*\bmuted\b/.test(cp),'the video is muted with controls');
assert(/useState\(false\)/.test(cp)&&/onClick=\{\(\)=>setOn\(true\)\}/.test(cp),'the video exists only after a click');
assert(!/youtube|vimeo|iframe/i.test(cp+read('app/(site)/videos/[slug]/page.tsx')),'no third-party player');
console.log(`seo-video: ok (${W.length} watch pages, ${vids.length} guide + ${gameClips.length} game clips; sitemap ${urls.length} entries)`);
