import type {MetadataRoute} from 'next';
import {LAB_ROUTES} from '@/lib/dev/labRoutes';
import {SITE_URL} from '@/lib/site/seo';
/**
 * /robots.txt (Oct 16 2026): every public page is open to search engines and AI assistants, which are named one by one so a
 * crawler that only reads its own group still sees the same rules. Closed: the admin dashboard, the API, the developer labs
 * (lib/dev/labRoutes.ts, 404 in production anyway) and the donation checkout redirect.
 */
export const dynamic='force-static';
const AI_AND_SEARCH_BOTS=['GPTBot','OAI-SearchBot','ChatGPT-User','ClaudeBot','Claude-Web','Claude-SearchBot','anthropic-ai','PerplexityBot','Google-Extended','CCBot','Bingbot','Googlebot','Applebot'] as const;
const DISALLOW=['/admin','/api',...LAB_ROUTES,'/coffee/checkout'];
export default function robots():MetadataRoute.Robots{
 return {rules:[...AI_AND_SEARCH_BOTS.map(userAgent=>({userAgent,allow:'/',disallow:DISALLOW})),{userAgent:'*',allow:'/',disallow:DISALLOW}],
  sitemap:`${SITE_URL}/sitemap.xml`,host:SITE_URL};
}
