import {feedXml} from '@/lib/site/feed';
/** /feed.xml (Nov 21 2026): the Atom feed of the 50 most recently updated pages (lib/site/feed.ts). Built at build time. */
export const dynamic='force-static';
export function GET(){
 return new Response(feedXml(),{headers:{'Content-Type':'application/atom+xml; charset=utf-8','Cache-Control':'public, max-age=3600, stale-while-revalidate=86400'}});
}
