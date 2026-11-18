import {videoSitemapXml} from '@/lib/site/videos';
/** /sitemap-video.xml (lib/site/videos.ts): one entry per watch page (/videos/<slug>), built once at build time and named in robots.txt. */
export const dynamic='force-static';
export function GET(){
 return new Response(videoSitemapXml(),{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=3600, stale-while-revalidate=86400'}});
}
