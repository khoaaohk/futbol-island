import {coachPlans} from '@/lib/coach/plansData';
import {APP_LANGS,isAppLang} from '@/lib/i18n/appLangs';
/** The coach app's practice plans in one language (lib/coach/plansData.ts; ten languages since round 4F, one file each): a static JSON file fetched only when Practice plans
 *  opens. noindex by the /coach/:path* X-Robots-Tag header (next.config.mjs). */
export const dynamic='force-static';
export const dynamicParams=false;
export const generateStaticParams=()=>APP_LANGS.map(lang=>({lang}));
export function GET(_req:Request,{params}:{params:{lang:string}}){
 const all=coachPlans();return Response.json(all[isAppLang(params.lang)?params.lang:'en'],{headers:{'Cache-Control':'public, max-age=3600'}});
}
