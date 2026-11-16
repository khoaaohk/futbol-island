// Guide clips (seo-extras, Nov 15 2026; lib/site/guideVideos.ts, components/site/GuideVideo.tsx, app/sitemap-video.xml):
//  1. Every clip is a real file already in public/learn (poster + mp4), small (< 400 KB), and its uploadDate is the day git first saw it.
//  2. Each page that has a clip renders one VideoObject with name, description, thumbnailUrl, uploadDate, contentUrl and an ISO duration,
//     a play BUTTON (no <video> before the tap, so nothing autoplays or downloads), and the caption text matching the JSON-LD.
//  3. The video sitemap is valid XML-ish (one <url> per clip, video namespace, all required tags) and robots.txt names it.
//  4. ClipPlay: the <video> is muted, inline, has controls and is only created after a click.
// usage: node tests/seo-video.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const {root,L,read,render,React,ldOf}=require('./lib/tsLoad.cjs');process.chdir(root);
const gv=L('lib/site/guideVideos.ts');
const vids=gv.allGuideVideos();
assert.equal(vids.length,gv.GUIDE_VIDEOS.length,'every listed clip resolves to real files');
assert(vids.length>=3,'at least three guide pages have a clip');
for(const v of vids){
 for(const f of [v.poster,v.mp4,v.webm].filter(Boolean)){const st=fs.statSync(path.join(root,'public',f));assert(st.size<400_000,`${f} is small (${st.size})`);}
 let first='';try{first=execFileSync('git',['log','--diff-filter=A','--format=%aI','--',`public${v.mp4}`],{cwd:root,encoding:'utf8'}).trim().split('\n').pop();}catch{}
 if(first)assert.equal(v.uploadDate,first,`${v.key}: uploadDate is the first commit of the clip`);
 assert(v.seconds>0&&v.seconds<=60,`${v.key}: a short clip`);
}
const pageFile={'/learn/passing-and-support':'app/(site)/learn/passing-and-support/page.tsx','/learn/soccer-quiz-for-kids':'app/(site)/learn/soccer-quiz-for-kids/page.tsx','/learn/lessons':'app/(site)/learn/lessons/page.tsx'};
for(const v of vids){
 const f=pageFile[v.path];assert(f,`${v.path}: a known page`);
 const html=render(React.createElement(L(f).default,{}));
 const ld=ldOf(html),vo=ld.filter(x=>x['@type']==='VideoObject');
 assert.equal(vo.length,1,`${v.path}: one VideoObject`);
 const o=vo[0];
 for(const k of ['name','description','thumbnailUrl','uploadDate','contentUrl','duration'])assert(o[k],`${v.path}: VideoObject.${k}`);
 assert(/^PT\d+S$/.test(o.duration),`${v.path}: ISO 8601 duration`);
 assert(/^https:\/\//.test(o.contentUrl)&&/\.mp4(\?|$)/.test(o.contentUrl),`${v.path}: absolute mp4 contentUrl`);
 assert(o.thumbnailUrl.every(u=>u.startsWith('https://futbolisland.app/learn/')),`${v.path}: thumbnail on the site`);
 assert(/^\d{4}-\d\d-\d\dT/.test(o.uploadDate),`${v.path}: uploadDate is ISO`);
 assert(!/<video/.test(html),`${v.path}: no <video> before the tap`);
 assert(/<button type="button"[^>]*aria-label="Play video: /.test(html),`${v.path}: a labelled play button`);
 assert(/loading="lazy"/.test(html),`${v.path}: lazy poster`);
 assert(html.includes(o.description.replace(/'/g,'&#x27;')),`${v.path}: the caption says what the JSON-LD says`);
 assert.equal(new Set(ld.map(x=>JSON.stringify(x['@type']))).size,ld.length,`${v.path}: no duplicate JSON-LD @types`);
}
// sitemap
const xml=gv.videoSitemapXml();
assert(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')&&xml.includes('xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"'),'video sitemap header');
// Nov 16 2026: the games pages add their own entries (lib/site/gameMedia.ts): /games (hero + island clips) and one per game page.
const gm=L('lib/site/gameMedia.ts'),gamePages=gm.GAME_VIDEO_PAGES.filter(p=>gm.gameVideosFor(p).length),gameClips=gamePages.flatMap(p=>gm.gameVideosFor(p));
assert.equal((xml.match(/<url>/g)||[]).length,vids.length+gamePages.length,'one <url> per guide clip and per games page with clips');
const entries=vids.length+gameClips.length;assert.equal((xml.match(/<video:video>/g)||[]).length,entries,'one <video:video> per clip');
for(const c of gameClips){for(const f of [c.mp4,c.webm,c.poster]){const st=fs.statSync(path.join(root,'public',f));assert(st.size<1_600_000,`${f} is small (${st.size})`);}
 assert(c.seconds>=4&&c.seconds<=12,`${c.key}: a 4-12 s loop`);assert(Math.max(c.w,c.h)<=720,`${c.key}: 720 px on the long side at most`);
 const ld=gm.gameClipLd(c);for(const k of ['name','description','thumbnailUrl','uploadDate','contentUrl','duration'])assert(ld[k],`${c.key}: VideoObject.${k}`);}
// LoopClip: muted, inline, no sound, the <video> only exists on the client once it may play, one clip at a time
const lc=read('components/site/games/LoopClip.tsx');
assert(/<video[^>]*\bmuted\b[^>]*\bplaysInline\b/.test(lc)&&/preload="none"/.test(lc)&&/\{on&&<video/.test(lc),'LoopClip: muted inline video, created only when it may play');
assert(/prefers-reduced-motion: reduce/.test(lc)&&/IntersectionObserver/.test(lc)&&/visibilitychange/.test(lc)&&/PLAYING/.test(lc),'LoopClip: reduced motion keeps the poster, pauses off screen and when hidden, one at a time');
for(const t of ['loc','video:thumbnail_loc','video:title','video:description','video:content_loc','video:duration','video:publication_date','video:family_friendly'])
 assert.equal((xml.match(new RegExp(`<${t}>[^<]+</${t}>`,'g'))||[]).length,t==='loc'?vids.length+gamePages.length:entries,`every entry has <${t}>`);
assert(!/&(?!amp;|lt;|gt;|quot;|apos;)/.test(xml),'XML entities escaped');
assert(/export const dynamic='force-static'/.test(read('app/sitemap-video.xml/route.ts')),'the video sitemap is static');
assert(read('app/robots.ts').includes('/sitemap-video.xml'),'robots.txt names the video sitemap');
// ClipPlay source
const cp=read('components/site/ClipPlay.tsx');
assert(/<video[^>]*\bmuted\b[^>]*\bplaysInline\b[^>]*\bcontrols\b|<video[^>]*\bcontrols\b[^>]*\bmuted\b/.test(cp),'the video is muted with controls');
assert(/useState\(false\)/.test(cp)&&/onClick=\{\(\)=>setOn\(true\)\}/.test(cp),'the video exists only after a click');
assert(!/youtube|vimeo|iframe/i.test(cp),'no third-party player');
console.log(`seo-video: ok (${vids.length} clips: ${vids.map(v=>v.path).join(', ')})`);
