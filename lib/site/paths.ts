import {LESSONS,lessonPath} from './lessons';
import {SITE_FISH,fishPath} from './fish';
import {SITE_CARDS,cardPath} from './cards';
import {SITE_EXHIBITS,exhibitPath} from './exhibits';
/**
 * Every public, indexable path (app/sitemap.ts, tests/seo-pages.cjs). /start was removed on Oct 9 2026 (it 404s, see
 * tests/landing.cjs), so it is not listed; the game's own rooms (/museum, /arcade …) are canvas scenes and stay out too.
 */
export const INDEX_PATHS=['/learn','/fish','/cards','/exhibits'] as const;
export function sitePaths():{path:string;priority:number}[]{
 return [{path:'/',priority:1},{path:'/about',priority:.9},{path:'/privacy',priority:.5},...INDEX_PATHS.map(path=>({path,priority:.8})),
  ...LESSONS.map(l=>({path:lessonPath(l.id),priority:.6})),...SITE_FISH.map(f=>({path:fishPath(f.id),priority:.4})),
  ...SITE_CARDS.map(c=>({path:cardPath(c.number),priority:.4})),...SITE_EXHIBITS.map(e=>({path:exhibitPath(e.id),priority:.5}))];
}
