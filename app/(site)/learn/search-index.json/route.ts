import {buildSearchIndex} from '@/lib/site/searchIndex';
/** /learn/search-index.json (lib/site/searchIndex.ts): the /learn search's index, built once at build time. Not a page: noindex. */
export const dynamic='force-static';
export function GET(){
 return new Response(JSON.stringify(buildSearchIndex()),{headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'public, max-age=3600, stale-while-revalidate=86400','X-Robots-Tag':'noindex'}});
}
