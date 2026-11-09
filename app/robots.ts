import type {MetadataRoute} from 'next';
import {LAB_ROUTES} from '@/lib/dev/labRoutes';
import {SITE_URL} from '@/lib/site/seo';
/**
 * /robots.txt (Oct 16 2026): every public page is open to search engines and AI assistants, which are named one by one so a
 * crawler that only reads its own group still sees the same rules. Closed: the admin dashboard, the API, the developer labs
 * (lib/dev/labRoutes.ts, 404 in production anyway) and the donation checkout redirect.
 */
export const dynamic='force-static';
// Nov 8 2026 (owner, AI search): + Claude-User, Perplexity-User, Applebot-Extended, so every answer engine's search and
// user-fetch agent is allowed by name. CCBot (Common Crawl) stays allowed, as before (owner's call).
const AI_AND_SEARCH_BOTS=['GPTBot','OAI-SearchBot','ChatGPT-User','ClaudeBot','Claude-Web','Claude-SearchBot','Claude-User','anthropic-ai','PerplexityBot','Perplexity-User','Google-Extended','CCBot','Bingbot','Googlebot','Applebot','Applebot-Extended'] as const;
const DISALLOW=['/admin','/api',...LAB_ROUTES,'/coffee/checkout'];
export default function robots():MetadataRoute.Robots{
 return {rules:[...AI_AND_SEARCH_BOTS.map(userAgent=>({userAgent,allow:'/',disallow:DISALLOW})),{userAgent:'*',allow:'/',disallow:DISALLOW}],
  sitemap:`${SITE_URL}/sitemap.xml`,host:SITE_URL};
}
