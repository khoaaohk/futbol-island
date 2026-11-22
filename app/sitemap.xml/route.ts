import {sitemapIndexXml,XML_HEADERS} from '@/lib/site/sitemaps';
/** /sitemap.xml (Nov 21 2026): the sitemap index, one family sitemap per page family (lib/site/sitemaps.ts). Built at build time. */
export const dynamic='force-static';
export function GET(){
 return new Response(sitemapIndexXml(),{headers:XML_HEADERS});
}
