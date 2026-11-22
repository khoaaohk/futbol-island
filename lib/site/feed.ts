import {FEED_PATH,FEED_TITLE,SITE_URL,SITE_NAME,abs} from './seo';
import {sitePaths} from './paths';
import {ALL_GUIDE_PAGES} from './guides';
import {TOOL_PAGES} from './tools/registry';
import {GAME_LISTINGS} from './games';
import {COLLECTIONS} from './collections';
import {HUBS} from './hubs';
import {LESSONS,lessonDescription,lessonPath,lessonTitle} from './lessons';
/**
 * /feed.xml (SEO, Nov 21 2026, owner approved: "a feed of new/updated pages"): an Atom feed of the FEED_SIZE most recently
 * updated indexable English pages, for crawlers and feed readers that watch for change. Dates are the sitemap's own <lastmod>
 * (lib/site/lastmod.ts pageModified, the last commit that touched the page), so the feed, the sitemap and JSON-LD
 * dateModified agree; no build clock. Order: newest first, then higher sitemap priority, then path (deterministic). Title and
 * summary are the page's own <title> words and meta description, from the registries the pages are built from; a page with
 * no registry record (a few one-off pages) is left out and the next one takes its place. Linked from <head> as
 * rel=alternate type=application/atom+xml (lib/site/seo.ts pageMeta, app/play/page.tsx).
 */
export const FEED_SIZE=50;
export {FEED_PATH,FEED_TITLE,FEED_TYPES} from './seo';
type Info={title:string;summary:string};
function infoMap():Map<string,Info>{
 const m=new Map<string,Info>(),put=(path:string,title:string,summary:string)=>{if(!m.has(path)&&title&&summary)m.set(path,{title,summary});};
 for(const g of ALL_GUIDE_PAGES)put(g.path,g.title,g.description);
 for(const t of TOOL_PAGES)put(t.path,t.title,t.description);
 for(const g of GAME_LISTINGS)put(g.path,g.title,g.description);
 for(const c of COLLECTIONS)put(c.path,c.title,c.description);
 for(const h of HUBS)put(h.path,h.title,h.description);
 for(const l of LESSONS)put(lessonPath(l.id),lessonTitle(l),lessonDescription(l));
 return m;
}
export type FeedEntry={path:string;updated:string;title:string;summary:string};
export function feedEntries(n=FEED_SIZE):FeedEntry[]{
 const info=infoMap();
 return sitePaths().filter(p=>info.has(p.path))
  .sort((a,b)=>b.lastmod.localeCompare(a.lastmod)||b.priority-a.priority||(a.path<b.path?-1:a.path>b.path?1:0))
  .slice(0,n).map(p=>({path:p.path,updated:p.lastmod,...info.get(p.path)!}));
}
const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
/** RFC 3339 for Atom: a date-only lastmod is midnight UTC that day. */
const stamp=(d:string)=>/^\d{4}-\d{2}-\d{2}$/.test(d)?`${d}T00:00:00Z`:d;
export function feedXml():string{
 const es=feedEntries(),updated=es[0]?.updated??'2026-11-21';
 return `<?xml version="1.0" encoding="UTF-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">\n<title>${esc(FEED_TITLE)}</title>\n`+
  `<subtitle>Free football lessons, rules, drills and games for kids 7 to 12, their parents and coaches.</subtitle>\n`+
  `<id>${SITE_URL}/</id>\n<link rel="self" type="application/atom+xml" href="${abs(FEED_PATH)}"/>\n<link rel="alternate" type="text/html" href="${SITE_URL}/"/>\n`+
  `<updated>${stamp(updated)}</updated>\n<author><name>${esc(SITE_NAME)}</name><uri>${SITE_URL}/</uri></author>\n`+
  es.map(e=>`<entry>\n<title>${esc(e.title)}</title>\n<link rel="alternate" type="text/html" href="${esc(abs(e.path))}"/>\n<id>${esc(abs(e.path))}</id>\n<updated>${stamp(e.updated)}</updated>\n<summary>${esc(e.summary)}</summary>\n</entry>\n`).join('')+
  `</feed>\n`;
}
