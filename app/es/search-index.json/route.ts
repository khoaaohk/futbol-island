import {buildSearchIndexEs} from '@/lib/i18n/es/search';
/** /es/search-index.json (lib/i18n/es/search.ts): the Spanish /es/learn search's index, built once at build time. Not a page: noindex. */
export const dynamic='force-static';
export function GET(){
 return new Response(JSON.stringify(buildSearchIndexEs()),{headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'public, max-age=3600, stale-while-revalidate=86400','X-Robots-Tag':'noindex'}});
}
