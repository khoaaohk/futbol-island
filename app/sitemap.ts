import type {MetadataRoute} from 'next';
import {abs} from '@/lib/site/seo';
import {sitePaths} from '@/lib/site/paths';
import {hasEs,languageAlternates,toEs} from '@/lib/i18n/esPaths';
/** /sitemap.xml (Oct 16 2026): the home page `/` (the feature tour), /about, the game at /play, /privacy and every static reading
 *  page (lib/site/paths.ts). Nov 8 2026 (SEO audit): <lastmod> is each section's real content date (lib/site/updated.ts), and
 *  no <changefreq> (Google ignores it). */
export const dynamic='force-static';
export default function sitemap():MetadataRoute.Sitemap{
 // Nov 15 2026 (Spanish round 1): each page with a Spanish version is listed in both languages, each entry carrying the same
 // xhtml:link hreflang set (en, es, x-default), and the Spanish entry right after its English one.
 const alt=(p:string)=>{const l=languageAlternates(p);return {languages:{en:abs(l.en),es:abs(l.es),'x-default':abs(l['x-default'])}};};
 return sitePaths().flatMap(({path,priority,lastmod})=>hasEs(path)
  ?[{url:abs(path),lastModified:lastmod,priority,alternates:alt(path)},{url:abs(toEs(path)),lastModified:lastmod,priority,alternates:alt(path)}]
  :[{url:abs(path),lastModified:lastmod,priority}]);
}
