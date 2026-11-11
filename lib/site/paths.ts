import {LESSONS,lessonPath} from './lessons';
import {SITE_FISH,fishPath} from './fish';
import {SITE_CARDS,cardPath} from './cards';
import {SITE_EXHIBITS,exhibitPath} from './exhibits';
import {HUB_PATHS,SAFE_GUIDE} from './hubs';
import {SITE_UPDATED} from './updated';
import {ALL_GUIDE_PAGES} from './guides';
import {TOOL_PAGES,TOOLS_UPDATED} from './tools/registry';
import {GAME_LISTINGS,GAMES_UPDATED} from './games';
/**
 * Every public, indexable path (app/sitemap.ts, tests/seo-pages.cjs). Nov 3 2026 (owner): `/` is the home page (the feature tour,
 * formerly /learn, which now redirects to `/`) and the main entry; the game is /play, indexable at a low priority.
 * The lesson index is /learn/lessons. /start was removed on Oct 9 2026 (it 404s, see
 * tests/landing.cjs), so it is not listed; the game's own rooms (/museum, /arcade …) are canvas scenes and stay out too.
 */
export const INDEX_PATHS=['/learn/lessons','/fish','/cards','/exhibits'] as const;
/** Kept for older imports: the home page's content date (lib/site/updated.ts is the source). */
export const HOME_UPDATED=SITE_UPDATED.home;
/** The topic hubs (lib/site/hubs.ts) and the parents' guide (SEO, Nov 8 2026). */
export const GUIDE_PATHS=[...HUB_PATHS,SAFE_GUIDE.path] as const;
/** Every path with its sitemap priority and its section's real content date (lib/site/updated.ts; no build-time "now"). */
export function sitePaths():{path:string;priority:number;lastmod:string}[]{
 const U=SITE_UPDATED;
 return [{path:'/',priority:1,lastmod:U.home},{path:'/about',priority:.9,lastmod:U.about},{path:'/play',priority:.3,lastmod:U.play},{path:'/privacy',priority:.5,lastmod:U.privacy},{path:'/marketing',priority:.4,lastmod:U.marketing},
  {path:'/learn/lessons',priority:.8,lastmod:U.lessons},{path:'/fish',priority:.8,lastmod:U.fish},{path:'/cards',priority:.8,lastmod:U.cards},{path:'/exhibits',priority:.8,lastmod:U.exhibits},
  ...GUIDE_PATHS.map(path=>({path,priority:.8,lastmod:U.hubs})),
  ...ALL_GUIDE_PAGES.map(g=>({path:g.path,priority:g.hub?.8:.7,lastmod:U.guides})),/* guide clusters: formations, positions, rules, size charts, glossary (lib/site/guides.ts) */
  ...TOOL_PAGES.map(t=>({path:t.path,priority:t.hub?.8:.7,lastmod:TOOLS_UPDATED})),/* the free coach tools and printables (lib/site/tools/registry.ts) */
  ...GAME_LISTINGS.map(g=>({path:g.path,priority:g.hub?.8:.7,lastmod:GAMES_UPDATED})),/* the arcade games' search pages (lib/site/games.ts) */
  ...LESSONS.map(l=>({path:lessonPath(l.id),priority:.6,lastmod:U.lessons})),...SITE_FISH.map(f=>({path:fishPath(f.id),priority:.4,lastmod:U.fish})),
  ...SITE_CARDS.map(c=>({path:cardPath(c.number),priority:.4,lastmod:U.cards})),...SITE_EXHIBITS.map(e=>({path:exhibitPath(e.id),priority:.5,lastmod:U.exhibits}))];
}
