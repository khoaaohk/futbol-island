import {coachPlans} from '@/lib/coach/plansData';
/** The coach app's practice plans in one language (lib/coach/plansData.ts): a static JSON file fetched only when Practice plans
 *  opens. noindex by the /coach/:path* X-Robots-Tag header (next.config.mjs). */
export const dynamic='force-static';
export const dynamicParams=false;
export const generateStaticParams=()=>[{lang:'en'},{lang:'es'}];
export function GET(_req:Request,{params}:{params:{lang:string}}){
 const all=coachPlans();return Response.json(params.lang==='es'?all.es:all.en,{headers:{'Cache-Control':'public, max-age=3600'}});
}
