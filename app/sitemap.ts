import type {MetadataRoute} from 'next';
import {abs} from '@/lib/site/seo';
import {sitePaths} from '@/lib/site/paths';
/** /sitemap.xml (Oct 16 2026): the game's front door, /about, /privacy and every static reading page (lib/site/paths.ts). */
export const dynamic='force-static';
export default function sitemap():MetadataRoute.Sitemap{
 return sitePaths().map(({path,priority})=>({url:abs(path),changeFrequency:'weekly',priority}));
}
