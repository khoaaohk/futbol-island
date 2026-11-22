import {abs,SITE_URL} from './seo';
import {sitePaths} from './paths';
import {COMPARISONS} from './comparisons';
import {hasEs,languageAlternates,toEn,toEs} from '../i18n/esPaths';
/**
 * The sitemaps (SEO, Nov 21 2026, owner approved: "sitemaps split by family"). /sitemap.xml is a sitemap index
 * (app/sitemap.xml/route.ts) naming one sitemap per page family at /sitemaps/<family>.xml (app/sitemaps/[family]/route.ts),
 * so Search Console reports indexing family by family. Every URL is in exactly one family sitemap, with the same <lastmod>
 * (lib/site/lastmod.ts pageModified, through sitePaths), priority and hreflang set (en, es, x-default) the single sitemap had.
 * A Spanish page goes to the `es-` twin of its English page's family. The image and video sitemaps stay separate files
 * (/sitemap-images.xml, /sitemap-video.xml), named in robots.txt as before.
 * Before Nov 21 2026 this list was app/sitemap.ts (Next's MetadataRoute), which can only write one <urlset>.
 */
export type SitemapEntry={url:string;lastModified:string;priority:number;alternates?:{languages:{en:string;es:string;'x-default':string}}};
/** Each page with a Spanish version is listed in both languages, each entry with the same hreflang set (Nov 15 2026). */
export function sitemapEntries():SitemapEntry[]{
 const alt=(p:string)=>{const l=languageAlternates(p);return {languages:{en:abs(l.en),es:abs(l.es),'x-default':abs(l['x-default'])}};};
 return sitePaths().flatMap(({path,priority,lastmod})=>hasEs(path)
  ?[{url:abs(path),lastModified:lastmod,priority,alternates:alt(path)},{url:abs(toEs(path)),lastModified:lastmod,priority,alternates:alt(path)}]
  :[{url:abs(path),lastModified:lastmod,priority}]);
}
/** The English families, in index order. `core`: the main pages (/, /play, /games, /library), the about and trust pages, every
 *  hub and index page and the one-level /learn guides (size charts, team-size guides, topic hubs). */
export const EN_FAMILIES=['core','rules','terms','positions','formations','comparisons','drills','practice-plans','lessons','tools','games','books','cards','fish','exhibits','videos'] as const;
export type Family=typeof EN_FAMILIES[number]|`es-${typeof EN_FAMILIES[number]}`;
const COMPARE=new Set(COMPARISONS.map(c=>c.path));
const BY_PREFIX:readonly [string,Family][]=[['/learn/soccer-rules/','rules'],['/learn/soccer-terms/','terms'],['/learn/soccer-positions/','positions'],
 ['/learn/soccer-formations/','formations'],['/learn/soccer-drills/','drills'],['/learn/soccer-practice-plans/','practice-plans'],['/learn/lessons/','lessons'],
 ['/tools/','tools'],['/games/','games'],['/books/','books'],['/cards/','cards'],['/fish/','fish'],['/exhibits/','exhibits'],['/videos/','videos']];
/** The family of a site path (English or Spanish). Hubs (/learn/soccer-rules, /tools …) are core; their children are the family. */
export function familyOf(path:string):Family{
 const es=path==='/es'||path.startsWith('/es/'),en=es?toEn(path)??path:path;
 const f:typeof EN_FAMILIES[number]=COMPARE.has(en)?'comparisons':(BY_PREFIX.find(([p])=>en.startsWith(p))?.[1] as typeof EN_FAMILIES[number]|undefined)??'core';
 return es?`es-${f}`:f;
}
const pathOf=(url:string)=>url.slice(SITE_URL.length)||'/';
/** The entries of every family that has at least one URL, in index order (English families, then their Spanish twins). */
export function sitemapFamilies():{family:Family;entries:SitemapEntry[]}[]{
 const by=new Map<Family,SitemapEntry[]>();
 for(const e of sitemapEntries()){const f=familyOf(pathOf(e.url));(by.get(f)??by.set(f,[]).get(f)!).push(e);}
 const order:Family[]=[...EN_FAMILIES,...EN_FAMILIES.map(f=>`es-${f}` as Family)];
 return order.filter(f=>by.has(f)).map(family=>({family,entries:by.get(family)!}));
}
export const familySitemapPath=(f:Family)=>`/sitemaps/${f}.xml`;
const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const newest=(xs:readonly SitemapEntry[])=>xs.reduce((m,e)=>e.lastModified>m?e.lastModified:m,'');
/** One family's <urlset>, in the same shape Next's MetadataRoute sitemap wrote (loc, hreflang links, lastmod, priority). */
export function familySitemapXml(f:Family):string|null{
 const fam=sitemapFamilies().find(x=>x.family===f);if(!fam)return null;
 const url=(e:SitemapEntry)=>`<url>\n<loc>${esc(e.url)}</loc>\n`+(e.alternates?Object.entries(e.alternates.languages).map(([l,h])=>`<xhtml:link rel="alternate" hreflang="${l}" href="${esc(h)}" />\n`).join(''):'')
  +`<lastmod>${e.lastModified}</lastmod>\n<priority>${e.priority}</priority>\n</url>\n`;
 return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${fam.entries.map(url).join('')}</urlset>\n`;
}
/** /sitemap.xml: the index, one <sitemap> per family, its <lastmod> the newest page date in it. */
export function sitemapIndexXml():string{
 return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`+
  sitemapFamilies().map(({family,entries})=>`<sitemap>\n<loc>${abs(familySitemapPath(family))}</loc>\n<lastmod>${newest(entries)}</lastmod>\n</sitemap>\n`).join('')+`</sitemapindex>\n`;
}
export const XML_HEADERS={'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=3600, stale-while-revalidate=86400'} as const;
