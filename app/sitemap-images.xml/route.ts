import {imageSitemapXml} from '@/lib/site/tools/imageSitemap';
/** /sitemap-images.xml (lib/site/tools/imageSitemap.ts): the image sitemap, built once at build time and named in robots.txt. */
export const dynamic='force-static';
export function GET(){
 return new Response(imageSitemapXml(),{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=3600, stale-while-revalidate=86400'}});
}
