import type {MetadataRoute} from 'next';
import {abs} from '@/lib/site/seo';
import {sitePaths} from '@/lib/site/paths';
/** /sitemap.xml (Oct 16 2026): the home page `/` (the feature tour), /about, the game at /play, /privacy and every static reading
 *  page (lib/site/paths.ts). Nov 8 2026 (SEO audit): <lastmod> is each section's real content date (lib/site/updated.ts), and
 *  no <changefreq> (Google ignores it). */
export const dynamic='force-static';
export default function sitemap():MetadataRoute.Sitemap{
 return sitePaths().map(({path,priority,lastmod})=>({url:abs(path),lastModified:lastmod,priority}));
}
